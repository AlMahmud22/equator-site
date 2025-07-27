/**
 * Hydration-safe date formatting utilities
 */

export const formatDate = {
  /**
   * Format date for display with fallback for SSR
   */
  toLocaleDateString: (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    if (typeof window === 'undefined') {
      // Simple fallback for SSR - return the original date string
      return dateString
    }
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', options)
    } catch (error) {
      console.warn('Error formatting date:', error)
      return dateString
    }
  },

  /**
   * Format date to ISO string with fallback
   */
  toISOString: (dateString: string) => {
    if (typeof window === 'undefined') {
      return dateString
    }
    
    try {
      return new Date(dateString).toISOString()
    } catch (error) {
      console.warn('Error formatting date to ISO:', error)
      return dateString
    }
  },

  /**
   * Format relative time (e.g., "2 days ago")
   */
  relative: (dateString: string) => {
    if (typeof window === 'undefined') {
      return dateString
    }

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
      
      return `${Math.floor(diffInSeconds / 31536000)} years ago`
    } catch (error) {
      console.warn('Error formatting relative date:', error)
      return dateString
    }
  }
}
