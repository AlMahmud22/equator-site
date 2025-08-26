import React from 'react'
import { useDownloadTracking, DownloadConfig } from '../hooks/useDownloadTracking'

interface DownloadButtonProps extends DownloadConfig {
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

/**
 * Download button component with automatic tracking
 */
export function DownloadButton({
  productId,
  productName,
  downloadUrl,
  fileSize,
  version,
  className = '',
  children,
  disabled = false
}: DownloadButtonProps) {
  const { trackDownload, isTracking, error } = useDownloadTracking()

  const handleDownload = () => {
    trackDownload({
      productId,
      productName,
      downloadUrl,
      fileSize,
      version
    })
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={disabled || isTracking}
        className={`${className} ${isTracking ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isTracking ? 'Starting Download...' : children}
      </button>
      {error && (
        <div className="text-red-400 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  )
}

/**
 * Simple download link with tracking
 */
interface DownloadLinkProps extends DownloadConfig {
  className?: string
  children: React.ReactNode
}

export function DownloadLink({
  productId,
  productName,
  downloadUrl,
  fileSize,
  version,
  className = '',
  children
}: DownloadLinkProps) {
  const { trackDownload, isTracking, error } = useDownloadTracking()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    trackDownload({
      productId,
      productName,
      downloadUrl,
      fileSize,
      version
    })
  }

  return (
    <div>
      <a
        href={downloadUrl}
        onClick={handleClick}
        className={`${className} ${isTracking ? 'pointer-events-none opacity-50' : ''}`}
        download={productName}
      >
        {isTracking ? 'Starting Download...' : children}
      </a>
      {error && (
        <div className="text-red-400 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  )
}
