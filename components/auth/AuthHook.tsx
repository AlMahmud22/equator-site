import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

interface AuthUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  provider?: string
}

interface UseAuthReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

/**
 * Enhanced authentication hook that wraps NextAuth for consistent usage across the app
 * This replaces the custom useAuth hook and provides a unified interface
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated' && !!session?.user

  // Transform NextAuth session to our expected user format
  const user: AuthUser | null = session?.user ? {
    id: (session as any)?.user?.id || (session as any)?.sub,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    provider: (session as any)?.provider,
  } : null

  const logout = useCallback(async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      })
      // Force navigation to home page
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Force navigation even if signOut fails
      router.push('/')
    }
  }, [router])

  const refreshSession = useCallback(async () => {
    try {
      await update()
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }, [update])

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshSession,
  }
}
