import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface DownloadTrackingProps {
  productId: string
  productName: string
  fileSize?: number
  version?: string
  downloadUrl: string
}

interface UseDownloadTrackingReturn {
  trackDownload: (props: DownloadTrackingProps) => Promise<void>
  isTracking: boolean
  error: string | null
}

/**
 * Hook for tracking downloads with automatic authentication check
 */
export function useDownloadTracking(): UseDownloadTrackingReturn {
  const { data: session } = useSession()
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trackDownload = async ({
    productId,
    productName,
    fileSize,
    version,
    downloadUrl
  }: DownloadTrackingProps) => {
    setError(null)
    setIsTracking(true)

    try {
      // Check if user is authenticated
      if (!session?.user) {
        // Redirect to login with callback to current page
        const currentUrl = window.location.href
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`
        return
      }

      // Track the download
      const trackingResponse = await fetch('/api/downloads/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productName,
          fileSize,
          version
        })
      })

      if (!trackingResponse.ok) {
        const errorData = await trackingResponse.json()
        throw new Error(errorData.message || 'Failed to track download')
      }

      // Start the actual download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = productName
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log(`✅ Download tracked and started: ${productName}`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Download tracking error:', errorMessage)
      
      // Still allow download even if tracking fails
      if (downloadUrl) {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = productName
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } finally {
      setIsTracking(false)
    }
  }

  return {
    trackDownload,
    isTracking,
    error
  }
}

/**
 * Configuration for download button component
 */
export interface DownloadConfig {
  productId: string
  productName: string
  downloadUrl: string
  fileSize?: number
  version?: string
}
