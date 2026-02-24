import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Github, Mail, ArrowRight } from 'lucide-react'

interface LoginButtonProps {
  provider: 'github' | 'google'
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  callbackUrl?: string
  children?: React.ReactNode
}

export default function LoginButton({ 
  provider, 
  className = '', 
  variant = 'default',
  size = 'md',
  callbackUrl = '/profile',
  children 
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const providerConfig = {
    github: {
      name: 'GitHub',
      icon: Github,
      color: 'bg-gray-800 hover:bg-gray-700 border-gray-600'
    },
    google: {
      name: 'Google', 
      icon: Mail,
      color: 'bg-blue-600 hover:bg-blue-700 border-blue-500'
    }
  }

  const config = providerConfig[provider]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  const variantClasses = {
    default: `${config.color} text-white`,
    outline: `border-2 ${config.color.replace('bg-', 'border-').replace('hover:bg-', 'hover:border-')} bg-transparent text-white hover:bg-opacity-10`,
    ghost: 'bg-transparent text-secondary-300 hover:text-white hover:bg-secondary-800/50'
  }

  const handleLogin = async () => {
    setIsLoading(true)
    
    try {
      const result = await signIn(provider, { 
        callbackUrl,
        redirect: false 
      })
      
      if (result?.error) {
        console.error('Sign in failed:', result.error)
      } else if (result?.ok) {
        // Success - redirect will happen automatically
        window.location.href = callbackUrl
      }
    } catch (err) {
      console.error('OAuth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleLogin}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        flex items-center justify-center
        rounded-lg border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {children || (
            <>
              <Icon className="w-5 h-5 mr-3" />
              <span>Continue with {config.name}</span>
              <ArrowRight className="w-4 h-4 ml-3" />
            </>
          )}
        </>
      )}
    </motion.button>
  )
}
