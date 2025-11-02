import bcrypt from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import connectDB from '@/modules/database/connection'
import User from '@/modules/database/models/User'
import { generateToken } from '@/modules/auth/services/auth'
import { validateRegistrationData, validateLoginData } from '@/shared/utils/validation'
import { logUserAccess } from '@/modules/auth/utils/accessLogger'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

// Registration Controller
export async function registerUser(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    await connectDB()

    const { fullName, email, password, confirmPassword } = req.body

    // Validate input data
    const validation = validateRegistrationData({
      fullName,
      email,
      password,
      confirmPassword
    })

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        errors: [{ field: 'email', message: 'Email is already registered' }]
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      authType: 'email'
    })

    const savedUser = await newUser.save()

    // Generate JWT token with Hugging Face token if available
    const tokenPayload: any = {
      userId: savedUser._id.toString(),
      email: savedUser.email,
      authType: savedUser.authType
    }

    // Include Hugging Face token in JWT if available
    if (savedUser.huggingFace?.linked && savedUser.huggingFace.token) {
      tokenPayload.huggingFaceToken = savedUser.huggingFace.token
    }

    const token = generateToken(tokenPayload)

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

    // Return success response (password is automatically excluded by schema)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: savedUser,
        token: token // Include the JWT token in the response
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
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

// Login Controller
export async function loginUser(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    await connectDB()

    const { email, password } = req.body

    // Validate input data
    const validation = validateLoginData({ email, password })
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      })
    }

    // Find user and include password field for verification
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      authType: 'email'
    }).select('+password +huggingFace.token')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: [{ field: 'email', message: 'Invalid credentials' }]
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password!)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: [{ field: 'password', message: 'Invalid credentials' }]
      })
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
    await logUserAccess(user._id.toString(), 'email', req)

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

    // Remove password from response
    const userResponse = user.toJSON()

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token: token // Include the JWT token in the response
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get User Profile Controller
export async function getUserProfile(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    await connectDB()

    // User ID should be added to req by auth middleware
    const userId = (req as any).userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Update User Profile Controller
export async function updateUserProfile(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    await connectDB()

    const userId = (req as any).userId
    const { fullName, phone, preferences } = req.body

    // Build update object with only provided fields
    const updateData: any = {}
    
    if (fullName !== undefined) {
      updateData.fullName = fullName.trim()
    }
    
    if (phone !== undefined) {
      updateData.phone = phone.trim() || null
    }
    
    if (preferences !== undefined) {
      updateData.preferences = preferences
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
