import { NextApiRequest, NextApiResponse } from 'next'
import { handleProviderCallback } from '@/modules/auth/services/oauthController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleProviderCallback(req, res)
}
