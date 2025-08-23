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
export function getOSSpecificDownload(projectId: string): {
  filename: string
  label: string
  icon: string
  url: string
} {
  const os = detectOS()
  
  // Import projects to get version info
  const { projects } = require('@/config/site')
  const project = projects.find((p: any) => p.id === projectId)
  
  if (!project) {
    return {
      filename: `${projectId}-setup.exe`,
      label: 'Download',
      icon: '💻',
      url: `/downloads/${projectId}-setup.exe`
    }
  }
  
  const downloads = {
    windows: {
      filename: `${projectId}-setup.exe`,
      label: 'Download for Windows',
      icon: '/images/os/windows.svg',
      url: project.downloads.windows
    },
    mac: {
      filename: `${projectId}.dmg`,
      label: 'Download for macOS',
      icon: '/images/os/macos.svg',
      url: project.downloads.mac
    },
    linux: {
      filename: `${projectId}.AppImage`,
      label: 'Download for Linux',
      icon: '/images/os/linux.svg',
      url: project.downloads.linux
    },
    unknown: {
      filename: `${projectId}-setup.exe`,
      label: 'Download',
      icon: '/images/os/windows.svg',
      url: project.downloads.windows
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
