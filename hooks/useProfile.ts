import useSWR from 'swr'
import { useState } from 'react'

// Types
interface ProfileData {
  user: {
    name: string
    email: string
    image?: string
    provider: string
    displayName?: string
    bio?: string
    preferences: {
      theme: 'dark' | 'light' | 'system'
      newsletter: boolean
      notifications: boolean
      privacy: {
        showEmail: boolean
        showActivity: boolean
      }
    }
    loginHistory: Array<{
      timestamp: string
      provider: string
      ipAddress?: string
      userAgent?: string
    }>
    downloadLogs: Array<{
      projectId: string
      projectName: string
      downloadedAt: string
      fileSize?: number
      version?: string
    }>
    createdAt: string
    lastLoginAt?: string
  }
  stats: {
    totalLogins: number
    totalDownloads: number
    activeSessions: number
    apiKeys: number
  }
}

interface ApiKey {
  keyId: string
  name: string
  permissions: string[]
  createdAt: string
  lastUsedAt?: string
  expiresAt?: string
  isActive: boolean
}

interface Session {
  sessionToken: string
  deviceInfo?: string
  ipAddress?: string
  createdAt: string
  lastActiveAt: string
  isActive: boolean
}

// Fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to fetch')
  }
  return res.json()
}

// Profile data hook
export function useProfile() {
  const { data, error, mutate, isLoading } = useSWR<{
    success: boolean
    data: ProfileData
  }>('/api/profile', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })

  return {
    profile: data?.data,
    isLoading,
    isError: error,
    mutate
  }
}

// Profile update hook
export function useProfileUpdate() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const updateProfile = async (updates: {
    displayName?: string
    bio?: string
    preferences?: Partial<ProfileData['user']['preferences']>
  }) => {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed'
      setUpdateError(errorMessage)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateProfile,
    isUpdating,
    updateError
  }
}

// API Keys hook
export function useApiKeys() {
  const { data, error, mutate, isLoading } = useSWR<{
    success: boolean
    data: { apiKeys: ApiKey[] }
  }>('/api/profile/api-keys', fetcher)

  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const createApiKey = async (keyData: {
    name: string
    permissions: string[]
    expiresInDays?: number
  }) => {
    setIsCreating(true)
    setActionError(null)

    try {
      const res = await fetch('/api/profile/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(keyData)
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh the API keys list
      mutate()

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create API key'
      setActionError(errorMessage)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    setIsDeleting(true)
    setActionError(null)

    try {
      const res = await fetch(`/api/profile/api-keys?keyId=${keyId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh the API keys list
      mutate()

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete API key'
      setActionError(errorMessage)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    apiKeys: data?.data?.apiKeys || [],
    isLoading,
    isError: error,
    createApiKey,
    deleteApiKey,
    isCreating,
    isDeleting,
    actionError,
    mutate
  }
}

// Sessions hook
export function useSessions() {
  const { data, error, mutate, isLoading } = useSWR<{
    success: boolean
    data: { sessions: Session[] }
  }>('/api/profile/sessions', fetcher)

  const [isTerminating, setIsTerminating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const terminateSession = async (sessionToken?: string, terminateAll = false) => {
    setIsTerminating(true)
    setActionError(null)

    try {
      const res = await fetch('/api/profile/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ sessionToken, terminateAll })
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh the sessions list
      mutate()

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to terminate session'
      setActionError(errorMessage)
      throw error
    } finally {
      setIsTerminating(false)
    }
  }

  return {
    sessions: data?.data?.sessions || [],
    isLoading,
    isError: error,
    terminateSession,
    isTerminating,
    actionError,
    mutate
  }
}

// Account deletion hook
export function useAccountDeletion() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account'
      setDeleteError(errorMessage)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteAccount,
    isDeleting,
    deleteError
  }
}
