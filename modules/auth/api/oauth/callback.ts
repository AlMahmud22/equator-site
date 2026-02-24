import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from '@/modules/auth/middleware/auth'
import { handleProviderCallback } from '@/modules/auth/services/oauthController'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  await handleProviderCallback(req, res)
}

export default withCors(handler)

