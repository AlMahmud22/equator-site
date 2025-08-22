import { NextApiRequest, NextApiResponse } from 'next'
import { redirectToProvider } from '@/modules/auth/services/oauthController'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  await redirectToProvider(req, res)
}
