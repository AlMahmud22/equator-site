/**
 * Utility functions for safe API calls and JSON parsing
 */

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any[]
}

/**
 * Safely parse JSON response and handle HTML error pages
 */
export async function safeJsonParse<T = any>(response: Response): Promise<ApiResponse<T>> {
  try {
    // Check if response is HTML (404/500 error page)
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('API returned non-JSON response:', response.status, response.statusText)
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}`
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API error:', response.status, errorText)
      return {
        success: false,
        message: `Server error: ${response.status}`
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('JSON parsing error:', error)
    return {
      success: false,
      message: 'Failed to parse server response'
    }
  }
}

/**
 * Make a safe API call with automatic error handling
 */
export async function safeApiCall<T = any>(
  url: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    return await safeJsonParse<T>(response)
  } catch (error) {
    console.error('Network error:', error)
    return {
      success: false,
      message: 'Network error occurred'
    }
  }
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined
}
