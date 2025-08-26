import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import Layout from '@/components/Layout'

export default function AuthError() {
  const router = useRouter()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (router.query.error) {
      setError(router.query.error as string)
      
      // Log error for debugging
      console.error('Auth Error:', router.query.error)
      
      // Send error to your logging service
      fetch('/api/auth/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: router.query.error,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        })
      }).catch(console.error)
    }
  }, [router.query.error])

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: { [key: string]: string } = {
      'Configuration': 'There is a problem with the server configuration.',
      'AccessDenied': 'Access denied. This could be due to OAuth app configuration or security restrictions.',
      'Verification': 'The verification token has expired or has already been used.',
      'Default': 'An error occurred during authentication.',
      'Cannot read properties of undefined (reading \'x-forwarded-for\')': 'Server configuration issue. Please try again.',
      'OAuthCreateAccount': 'Could not create account. The email may already be linked to another account.',
      'EmailCreateAccount': 'Could not create account with this email.',
      'Callback': 'Authentication callback error. Please try again.',
      'OAuthCallback': 'OAuth provider returned an error.',
      'OAuthSignin': 'Error signing in with OAuth provider.',
      'SessionRequired': 'Please sign in to access this page.',
    }
    
    return errorMessages[errorCode] || errorMessages['Default']
  }

  const getErrorSuggestions = (errorCode: string): string[] => {
    if (errorCode === 'AccessDenied') {
      return [
        'Check if your OAuth app (GitHub/Google) is configured correctly',
        'Verify the callback URLs in your OAuth app settings',
        'Make sure the OAuth app is not restricted to specific users/organizations',
        'Check if your email address is authorized in the OAuth app settings',
        'Try using a different browser or clearing cookies',
        'Contact the administrator if this persists'
      ]
    }
    return [
      'Try again in a few minutes',
      'Clear your browser cookies and cache',
      'Try using a different browser',
      'Contact support if the problem persists'
    ]
  }

  const getErrorSolution = (errorCode: string): string => {
    const errorSolutions: { [key: string]: string } = {
      'Configuration': 'Please contact support. This is a server issue.',
      'AccessDenied': 'Contact an administrator if you believe this is an error.',
      'Verification': 'Request a new verification email or try signing in again.',
      'OAuthCreateAccount': 'Try signing in instead of creating a new account, or use a different email.',
      'EmailCreateAccount': 'Try using a different email address or sign in with an existing account.',
      'Callback': 'Clear your browser cookies and try again.',
      'OAuthCallback': 'The authentication provider may be temporarily unavailable.',
      'OAuthSignin': 'Try a different sign-in method or contact support.',
      'SessionRequired': 'Please sign in to continue.',
      'Default': 'Clear your browser cookies and try again.',
    }
    
    return errorSolutions[errorCode] || errorSolutions['Default']
  }

  return (
    <Layout
      title="Authentication Error - Equators"
      description="An error occurred during authentication"
      showNavbar={true}
      showFooter={false}
    >
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div 
                className="mx-auto h-16 w-16 text-red-400 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <AlertCircle className="w-16 h-16" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                Authentication Error
              </h2>
              
              <p className="text-secondary-400 mb-6">
                {getErrorMessage(error)}
              </p>
            </div>
            
            {error && (
              <motion.div 
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-300">Error Details</h3>
                    <div className="mt-2 text-sm text-red-200/80">
                      <code className="bg-red-500/20 px-2 py-1 rounded text-xs block mb-3">
                        {error}
                      </code>
                      <div className="space-y-1">
                        <p className="font-medium text-red-300 text-xs mb-2">Troubleshooting suggestions:</p>
                        {getErrorSuggestions(error).map((suggestion, index) => (
                          <p key={index} className="text-xs text-red-200/70">
                            • {suggestion}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <motion.div 
              className="flex flex-col space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link 
                href="/auth/login" 
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Link>
              
              <Link 
                href="/" 
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Link>
              
              <button
                onClick={() => router.back()}
                className="w-full btn-ghost flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </motion.div>

            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-secondary-500">
                If this problem persists, please{' '}
                <Link href="/contact" className="text-primary-400 hover:text-primary-300">
                  contact support
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
