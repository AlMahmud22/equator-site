import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'

// Admin emails from the provided data context
const ADMIN_EMAILS = [
  'almahmud2122@gmail.com',
  'mahmud23k@gmail.com'
]

// Alternative names for SADIK AL MAHMUD (case variations)
const ADMIN_NAMES = [
  'SADIK AL MAHMUD',
  'sadik al mahmud',
  'Sadik Al Mahmud'
]

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export function isAdminByName(name: string): boolean {
  return ADMIN_NAMES.includes(name)
}

export function isAdmin(email: string, name?: string): boolean {
  return isAdminEmail(email) || (name ? isAdminByName(name) : false)
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.email) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
    return null
  }
  
  return session
}

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res)
  
  if (!session || !session.user?.email) {
    return null
  }
  
  if (!isAdminEmail(session.user.email)) {
    res.status(403).json({
      success: false,
      error: 'Admin access required'
    })
    return null
  }
  
  return session
}

export function getUserRole(email: string): 'admin' | 'user' {
  return isAdminEmail(email) ? 'admin' : 'user'
}
