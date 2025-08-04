import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { withCors } from '@/modules/auth/middleware/auth'

async function logoutHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // Clear the authentication cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0, // Expire immediately
      path: '/',
    }

    res.setHeader('Set-Cookie', serialize('token', '', cookieOptions))

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export default withCors(logoutHandler)

