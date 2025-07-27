import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from '@/lib/middleware/auth'
import { handleProviderCallback } from '@/lib/controllers/oauthController'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  await handleProviderCallback(req, res)
}

export default withCors(handler)
