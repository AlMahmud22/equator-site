import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debounce utility function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Scroll to element utility
 */
export function scrollToElement(elementId: string, offset: number = 80) {
  if (typeof window === 'undefined') return
  
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

/**
 * Format file size utility
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Generate download URL for files in public/downloads
 */
export function getDownloadUrl(filename: string): string {
  return `/downloads/${filename}`
}

/**
 * Detect user's operating system
 */
export function detectOS(): 'windows' | 'mac' | 'linux' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('win')) return 'windows'
  if (userAgent.includes('mac')) return 'mac'
  if (userAgent.includes('linux')) return 'linux'
  
  return 'unknown'
}

/**
 * Get the appropriate download file based on OS
 */
export function getOSSpecificDownload(productId: string): {
  filename: string
  label: string
  icon: string
  url: string
} {
  const os = detectOS()
  
  // Import products to get version info
  const { products } = require('../config/site')
  const product = products.find((p: any) => p.id === productId)
  
  if (!product) {
    return {
      filename: `${productId}-setup.exe`,
      label: 'Download',
      icon: '💻',
      url: `/downloads/${productId}-setup.exe`
    }
  }
  
  const downloads = {
    windows: {
      filename: `${productId}-setup.exe`,
      label: 'Download for Windows',
      icon: '🪟',
      url: product.downloads.windows
    },
    mac: {
      filename: `${productId}.dmg`,
      label: 'Download for macOS',
      icon: '🍎',
      url: product.downloads.mac
    },
    linux: {
      filename: `${productId}.AppImage`,
      label: 'Download for Linux',
      icon: '🐧',
      url: product.downloads.linux
    },
    unknown: {
      filename: `${productId}-setup.exe`,
      label: 'Download',
      icon: '💻',
      url: product.downloads.windows
    }
  }
  
  return downloads[os]
}

/**
 * Animation delay utility for staggered animations
 */
export function getStaggerDelay(index: number, baseDelay = 0.1): number {
  return index * baseDelay
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: Element): boolean {
  if (typeof window === 'undefined') return false
  
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Throttle utility function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}
