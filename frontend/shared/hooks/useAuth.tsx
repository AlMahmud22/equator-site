import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useAuth as useLibAuth } from '@/lib/auth/hooks'

interface User {
  _id: string
  fullName: string
  email: string
  authType: 'email' | 'google' | 'github'
  avatar?: string
  phone?: string
  firstLogin: boolean
  huggingFace?: {
    linked: boolean
    username?: string
    linkedAt?: string
    fullName?: string
    avatarUrl?: string
  }
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
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; errors?: any[]; token?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message: string; errors?: any[]; token?: string }>
  loginWithGoogle: () => void
  loginWithGithub: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>
  linkHuggingFace: (token: string) => Promise<{ success: boolean; message: string; username?: string }>
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

      // Check if response is HTML (404/500 error page)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Login API returned non-JSON response:', response.status, response.statusText)
        return { success: false, message: `Server error: ${response.status} ${response.statusText}` }
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Login API error:', response.status, errorText)
        return { success: false, message: `Server error: ${response.status}` }
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        return { 
          success: true, 
          message: data.message, 
          token: data.data.token // Include token in response
        }
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

      // Check if response is HTML (404/500 error page)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Register API returned non-JSON response:', response.status, response.statusText)
        return { success: false, message: `Server error: ${response.status} ${response.statusText}` }
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Register API error:', response.status, errorText)
        return { success: false, message: `Server error: ${response.status}` }
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        return { 
          success: true, 
          message: data.message, 
          token: data.data.token // Include token in response
        }
      } else {
        return { success: false, message: data.message, errors: data.errors }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  const loginWithGoogle = () => {
    const storedRedirect = sessionStorage.getItem('authRedirect')
    const redirectParam = storedRedirect ? `&redirect=${encodeURIComponent(storedRedirect)}` : ''
    window.location.href = `/api/auth/oauth?provider=google${redirectParam}`
  }

  const loginWithGithub = () => {
    const storedRedirect = sessionStorage.getItem('authRedirect')
    const redirectParam = storedRedirect ? `&redirect=${encodeURIComponent(storedRedirect)}` : ''
    window.location.href = `/api/auth/oauth?provider=github${redirectParam}`
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

      // Check if response is HTML (404/500 error page)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Profile API returned non-JSON response:', response.status, response.statusText)
        setUser(null)
        return
      }

      if (!response.ok) {
        console.error('Profile API error:', response.status, response.statusText)
        setUser(null)
        return
      }

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

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      // Check if response is HTML (404/500 error page)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Update profile API returned non-JSON response:', response.status, response.statusText)
        return { success: false, message: `Server error: ${response.status} ${response.statusText}` }
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update profile API error:', response.status, errorText)
        return { success: false, message: `Server error: ${response.status}` }
      }

      const result = await response.json()

      if (result.success) {
        setUser(result.data.user)
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  const linkHuggingFace = async (token: string) => {
    try {
      const response = await fetch('/api/auth/hf-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      })

      // Check if response is HTML (404/500 error page)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('HF Link API returned non-JSON response:', response.status, response.statusText)
        return { success: false, message: `Server error: ${response.status} ${response.statusText}` }
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('HF Link API error:', response.status, errorText)
        return { success: false, message: `Server error: ${response.status}` }
      }

      const result = await response.json()

      if (result.success) {
        // Refresh user data to get updated HF info
        await refreshUser()
        return { success: true, message: result.message, username: result.data?.username }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Link Hugging Face error:', error)
      return { success: false, message: 'Network error occurred' }
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
    updateProfile,
    linkHuggingFace,
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
