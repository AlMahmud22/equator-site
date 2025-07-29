import { withCors, withAuth } from '@/lib/middleware/auth'
import { getUserProfile, updateUserProfile } from '@/lib/controllers/authController'
import { NextApiRequest, NextApiResponse } from 'next'

async function profileHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getUserProfile(req, res)
  } else if (req.method === 'PATCH') {
    return updateUserProfile(req, res)
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }
}

export default withCors(withAuth(profileHandler))
