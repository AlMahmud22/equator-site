import useSWR from 'swr'
import { useState } from 'react'

// Types
interface SettingsData {
  displayName: string
  bio: string
  theme: 'dark' | 'light' | 'system'
  language: string
  profileVisibility: 'public' | 'private'
  emailNotifications: boolean
  securityAlerts: boolean
  showEmail: boolean
  showActivity: boolean
  privacy?: {
    dataCollection: boolean
    analytics: boolean
    marketing: boolean
  }
}

interface SettingsUpdate {
  displayName?: string
  bio?: string
  theme?: 'dark' | 'light' | 'system'
  language?: string
  profileVisibility?: 'public' | 'private'
  emailNotifications?: boolean
  securityAlerts?: boolean
  showEmail?: boolean
  showActivity?: boolean
  privacy?: {
    dataCollection?: boolean
    analytics?: boolean
    marketing?: boolean
  }
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

// Settings hook
export function useSettings() {
  const { data, error, mutate, isLoading } = useSWR<{
    success: boolean
    data: SettingsData
  }>('/api/settings', fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })

  return {
    settings: data?.data,
    isLoading,
    isError: error,
    mutate
  }
}

// Settings update hook
export function useSettingsUpdate() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const updateSettings = async (updates: SettingsUpdate) => {
    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(false)

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to save settings')
      }

      setUpdateSuccess(true)
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000)

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Settings update failed'
      setUpdateError(errorMessage)
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => setUpdateError(null), 5000)
      
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const clearMessages = () => {
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  return {
    updateSettings,
    isUpdating,
    updateError,
    updateSuccess,
    clearMessages
  }
}
