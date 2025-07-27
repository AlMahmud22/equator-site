import { NextApiRequest } from 'next'
import { logAccess } from '@/lib/mongo'

export async function logUserAccess(
  userId: string,
  provider: 'email' | 'google' | 'github',
  req: NextApiRequest
): Promise<void> {
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  
  await logAccess(userId, provider, ip as string, userAgent)
}
