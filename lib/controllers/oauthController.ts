import { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import { generateToken } from '@/lib/auth'
import { logUserAccess } from '@/lib/utils/accessLogger'

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

// OAuth Login Controller
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

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() })

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
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      authType: user.authType
    })

    // Log the access
    await logUserAccess(user._id.toString(), provider, req)

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
        },
        token
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
