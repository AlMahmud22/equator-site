import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, extractTokenFromRequest } from '@/modules/auth/services/auth'
import connectDB from '@/modules/database/connection'
import User from '@/modules/database/models/User'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

async function profileWithTokenHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const token = extractTokenFromRequest(req)
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const tokenPayload = verifyToken(token)
    
    if (!tokenPayload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      })
    }

    await connectDB()

    // Fetch user with Hugging Face token
    const user = await User.findById(tokenPayload.userId).select('+huggingFace.token')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          authType: user.authType,
          avatar: user.avatar,
          phone: user.phone,
          firstLogin: user.firstLogin,
          huggingFace: user.huggingFace,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          preferences: user.preferences
        }
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export default profileWithTokenHandler

