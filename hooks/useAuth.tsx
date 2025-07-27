import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface User {
  _id: string
  fullName: string
  email: string
  authType: 'email' | 'google' | 'github'
  createdAt: string
  updatedAt: string
  preferences?: {
    newsletter: boolean
    notifications: boolean
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; errors?: any[] }>
  register: (data: RegisterData) => Promise<{ success: boolean; message: string; errors?: any[] }>
  loginWithGoogle: () => void
  loginWithGithub: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message, errors: data.errors }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message, errors: data.errors }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/oauth?provider=google'
  }

  const loginWithGithub = () => {
    window.location.href = '/api/auth/oauth?provider=github'
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      // Force reload to clear any cached state
      window.location.href = '/'
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
      } else {
        // Token is invalid or expired
        setUser(null)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
