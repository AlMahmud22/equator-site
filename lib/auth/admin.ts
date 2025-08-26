// Admin user configuration
export const ADMIN_EMAILS = [
  'almahmud2122@gmail.com',
  'mahmud23k@gmail.com'
]

export const ADMIN_USER_IDS = [
  '68adc597203523b7f67cbd20',
  '68adc6e6203523b7f67cbd51'
]

export function isAdmin(email?: string | null, userId?: string | null): boolean {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true
  }
  if (userId && ADMIN_USER_IDS.includes(userId)) {
    return true
  }
  return false
}

export function requireAdmin(email?: string | null, userId?: string | null): boolean {
  if (!isAdmin(email, userId)) {
    throw new Error('Admin privileges required')
  }
  return true
}
