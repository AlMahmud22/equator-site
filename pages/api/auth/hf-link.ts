import { NextApiRequest, NextApiResponse } from 'next'
import { withCors, withAuth } from '@/lib/middleware/auth'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

async function linkHuggingFaceHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const { token } = req.body
  const userId = (req as any).userId

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Hugging Face token is required',
      errors: [{ field: 'token', message: 'Token is required' }]
    })
  }

  // Validate token format (should start with hf_)
  if (!token.startsWith('hf_')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Hugging Face token format',
      errors: [{ field: 'token', message: 'Token should start with "hf_"' }]
    })
  }

  try {
    await connectDB()

    // Validate token with Hugging Face API
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Hugging Face token',
          errors: [{ field: 'token', message: 'Token is invalid or expired' }]
        })
      }
      throw new Error(`HF API error: ${response.status}`)
    }

    const hfUser = await response.json()

    // Update user with HF token and info
    const user = await User.findByIdAndUpdate(
      userId,
      {
        huggingFace: {
          linked: true,
          token: token,
          username: hfUser.name,
          fullName: hfUser.fullname || hfUser.name,
          avatarUrl: hfUser.avatarUrl,
          linkedAt: new Date()
        }
      },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Hugging Face account linked successfully',
      data: {
        username: hfUser.name,
        fullName: hfUser.fullname || hfUser.name
      }
    })

  } catch (error) {
    console.error('Link Hugging Face error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to link Hugging Face account'
    })
  }
}

export default withCors(withAuth(linkHuggingFaceHandler))
