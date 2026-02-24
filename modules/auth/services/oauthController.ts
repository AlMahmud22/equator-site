import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import connectDB from '@/modules/database/connection'
import User from '@/modules/database/models/User'
import { generateToken } from '@/modules/auth/services/auth'
import { logUserAccess } from '@/modules/auth/utils/accessLogger'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

interface OAuthUserData {
  email: string
  fullName: string
  provider: 'google' | 'github'
  providerId: string
}

interface GoogleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  given_name: string
  family_name: string
  picture: string
}

interface GitHubTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

interface GitHubUserInfo {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
}

// OAuth redirect handler - redirects to provider authorization URL
export async function redirectToProvider(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const { provider, redirect } = req.query
  
  // Get base URL and normalize it (remove trailing slashes and /api paths)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://equator.tech';

  // Clean up baseUrl - remove trailing slash and any /api suffix
  // baseUrl = baseUrl.replace(/\/+$/, '') // Remove trailing slashes
  // baseUrl = baseUrl.replace(/\/api$/, '') // Remove /api suffix if present
  
  const redirectUri = `${baseUrl}/api/auth/oauth/callback`
  
  // Store redirect parameter in state if provided
  let state = provider as string
  if (redirect && typeof redirect === 'string') {
    // Encode redirect URL in state parameter
    state = `${provider}:${encodeURIComponent(redirect)}`
  }

  try {
    let authUrl: string

    switch (provider) {
      case 'google':
        const googleClientId = process.env.GOOGLE_CLIENT_ID
        if (!googleClientId) {
          throw new Error('Google OAuth not configured')
        }
        
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(googleClientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent('openid email profile')}&` +
          `response_type=code&` +
          `state=${encodeURIComponent(state)}`
        break

      case 'github':
        const githubClientId = process.env.GITHUB_CLIENT_ID
        if (!githubClientId) {
          throw new Error('GitHub OAuth not configured')
        }
        
        authUrl = `https://github.com/login/oauth/authorize?` +
          `client_id=${encodeURIComponent(githubClientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent('user:email')}&` +
          `state=${encodeURIComponent(state)}`
        break

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid OAuth provider',
          errors: [{ field: 'provider', message: 'Provider must be either google or github' }]
        })
    }

    // Redirect to OAuth provider
    res.redirect(authUrl)

  } catch (error) {
    console.error('OAuth redirect error:', error)
    res.status(500).json({
      success: false,
      message: 'OAuth configuration error'
    })
  }
}

// OAuth callback handler - handles the code exchange and user creation
export async function handleProviderCallback(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const { code, state, error } = req.query

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return res.redirect('/auth/login?error=oauth_denied')
  }

  if (!code || !state) {
    return res.redirect('/auth/login?error=oauth_invalid')
  }

  // Parse state parameter to extract provider and redirect URL
  let provider = state as string
  let customRedirect: string | null = null
  
  if (state && typeof state === 'string' && state.includes(':')) {
    const parts = state.split(':')
    provider = parts[0]
    customRedirect = parts.length > 1 ? decodeURIComponent(parts[1]) : null
  }
  
  // Get base URL and normalize it
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://equator.tech';
  
  // Create the redirect URI
  const redirectUri = `${baseUrl}/api/auth/oauth/callback`

  try {
    await connectDB()
    
    let userInfo: { id: string; email: string; name: string; avatar?: string }

    if (provider === 'google') {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokenData: GoogleTokenResponse = await tokenResponse.json()

      if (!tokenData.access_token) {
        throw new Error('Failed to get access token from Google')
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      const googleUser: GoogleUserInfo = await userResponse.json()
      userInfo = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
      }

    } else if (provider === 'github') {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
          code: code as string,
          redirect_uri: redirectUri,
        }),
      })

      const tokenData: GitHubTokenResponse = await tokenResponse.json()

      if (!tokenData.access_token) {
        throw new Error('Failed to get access token from GitHub')
      }

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'equator-App',
        },
      })

      const githubUser: GitHubUserInfo = await userResponse.json()

      // Get user email (might be private)
      let email = githubUser.email
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'User-Agent': 'equator-App',
          },
        })
        const emails = await emailResponse.json()
        const primaryEmail = emails.find((e: any) => e.primary)
        email = primaryEmail?.email || emails[0]?.email
      }

      userInfo = {
        id: githubUser.id.toString(),
        email: email,
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
      }

    } else {
      throw new Error('Invalid provider state')
    }

    if (!userInfo.email) {
      return res.redirect('/auth/login?error=no_email')
    }

    // Check if user already exists (select HF token for JWT)
    let user = await User.findOne({ email: userInfo.email.toLowerCase() }).select('+huggingFace.token')
    let isNewUser = false

    if (user) {
      // User exists - update auth type and avatar if needed
      if (user.authType !== provider) {
        user.authType = provider as 'google' | 'github'
      }
      if (userInfo.avatar && user.avatar !== userInfo.avatar) {
        user.avatar = userInfo.avatar
      }
      user.firstLogin = false // Mark as returning user
      await user.save()
    } else {
      // Create new user
      isNewUser = true
      user = new User({
        fullName: userInfo.name.trim(),
        email: userInfo.email.toLowerCase(),
        authType: provider as 'google' | 'github',
        avatar: userInfo.avatar,
        firstLogin: true // Mark as new user
      })
      await user.save()
      
      // Re-fetch with HF token field for consistency
      user = await User.findById(user._id).select('+huggingFace.token')
    }

    // Generate JWT token with Hugging Face token if available
    const tokenPayload: any = {
      userId: user._id.toString(),
      email: user.email,
      authType: user.authType
    }

    // Include Hugging Face token in JWT if available
    if (user.huggingFace?.linked && user.huggingFace.token) {
      tokenPayload.huggingFaceToken = user.huggingFace.token
    }

    const token = generateToken(tokenPayload)

    // Log the access
    await logUserAccess(user._id.toString(), provider, req)

    // Set HTTP-only cookie
    const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: maxAge,
      path: '/',
    }

    res.setHeader('Set-Cookie', serialize('token', token, cookieOptions))

    // Handle custom redirect for equator Chatbot desktop app
    if (customRedirect && (customRedirect.startsWith('equatorchatbot://') || customRedirect.startsWith('myapp://'))) {
      return res.redirect(`${customRedirect}?token=${token}`)
    }

    // Default redirect to profile page with success and first login flag
    const redirectUrl = isNewUser ? '/profile?auth=success&firstLogin=true' : '/?auth=success'
    res.redirect(redirectUrl)

  } catch (error) {
    console.error('OAuth callback error:', error)
    res.redirect('/auth/login?error=oauth_failed')
  }
}

// Legacy OAuth Login Controller (for direct API calls)
export async function oauthLogin(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    await connectDB()

    const { email, fullName, provider, providerId }: OAuthUserData = req.body

    // Validate required fields
    if (!email || !fullName || !provider || !providerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required OAuth data',
        errors: [
          { field: 'oauth', message: 'Email, full name, provider, and provider ID are required' }
        ]
      })
    }

    // Validate provider
    if (!['google', 'github'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OAuth provider',
        errors: [
          { field: 'provider', message: 'Provider must be either google or github' }
        ]
      })
    }

    // Check if user already exists (select HF token for JWT)
    let user = await User.findOne({ email: email.toLowerCase() }).select('+huggingFace.token')

    if (user) {
      // User exists - update auth type if needed
      if (user.authType !== provider) {
        user.authType = provider
        await user.save()
      }
    } else {
      // Create new user
      user = new User({
        fullName: fullName.trim(),
        email: email.toLowerCase(),
        authType: provider
      })
      await user.save()
      
      // Re-fetch with HF token field for consistency
      user = await User.findById(user._id).select('+huggingFace.token')
    }

    // Generate JWT token with Hugging Face token if available
    const tokenPayload: any = {
      userId: user._id.toString(),
      email: user.email,
      authType: user.authType
    }

    // Include Hugging Face token in JWT if available
    if (user.huggingFace?.linked && user.huggingFace.token) {
      tokenPayload.huggingFaceToken = user.huggingFace.token
    }

    const token = generateToken(tokenPayload)

    // Log the access
    await logUserAccess(user._id.toString(), provider, req)

    // Set HTTP-only cookie
    const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: maxAge,
      path: '/',
    }

    res.setHeader('Set-Cookie', serialize('token', token, cookieOptions))

    // Return success response
    res.status(200).json({
      success: true,
      message: 'OAuth login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          authType: user.authType
        }
      }
    })

  } catch (error) {
    console.error('OAuth login error:', error)
    
    // Handle MongoDB duplicate key error
    if ((error as any).code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        errors: [{ field: 'email', message: 'Email is already registered' }]
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Update Hugging Face Token Controller
export async function updateHuggingFaceToken(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    await connectDB()

    // User ID should be added to req by auth middleware
    const userId = (req as any).userId
    const { huggingFaceToken } = req.body

    // Validate token format (basic validation)
    if (huggingFaceToken && typeof huggingFaceToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token format',
        errors: [{ field: 'huggingFaceToken', message: 'Token must be a string' }]
      })
    }

    // Find and update user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Update the token (can be null to remove it)
    user.huggingFaceToken = huggingFaceToken || undefined
    await user.save()

    res.status(200).json({
      success: true,
      message: huggingFaceToken ? 'Hugging Face token updated successfully' : 'Hugging Face token removed successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          authType: user.authType,
          hasHuggingFaceToken: !!user.huggingFaceToken
        }
      }
    })

  } catch (error) {
    console.error('Update Hugging Face token error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
