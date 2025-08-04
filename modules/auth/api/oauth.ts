import { withCors } from '@/modules/auth/middleware/auth'
import { redirectToProvider, oauthLogin } from '@/modules/auth/services/oauthController'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 * OAuth handler that consolidates both Google and GitHub providers
 * GET: Redirects to provider authorization URL based on query.provider
 * POST: Handles legacy OAuth login (for direct API calls)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Handle OAuth redirect to provider
    // Expected query params: provider=google|github
    const { provider } = req.query
    
    if (!provider || !['google', 'github'].includes(provider as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing provider. Must be "google" or "github"',
        errors: [{ field: 'provider', message: 'Provider must be either google or github' }]
      })
    }
    
    return redirectToProvider(req, res)
  } else if (req.method === 'POST') {
    // Handle legacy OAuth login (for direct API calls)
    return oauthLogin(req, res)
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }
}

export default withCors(handler)

