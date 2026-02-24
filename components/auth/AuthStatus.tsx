import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthHook'

interface AuthStatusProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
}

/**
 * Component that conditionally renders content based on authentication state
 * Provides loading states and fallbacks for unauthenticated users
 */
export function AuthStatus({ children, fallback, loadingComponent }: AuthStatusProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        {loadingComponent || (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-secondary-400"
          >
            <div className="w-4 h-4 border-2 border-secondary-600 border-t-secondary-400 rounded-full animate-spin"></div>
            <span className="text-sm">Loading...</span>
          </motion.div>
        )}
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div>
        {fallback || (
          <div className="text-center text-secondary-400">
            <p>Please sign in to access this content.</p>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Loading spinner component for authentication states
 */
export function AuthLoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center"
    >
      <div className={`${sizeClasses[size]} border-2 border-secondary-600 border-t-green-500 rounded-full animate-spin`}></div>
    </motion.div>
  )
}

export default AuthStatus
