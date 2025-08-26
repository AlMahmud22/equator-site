import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Github, Mail, ArrowRight, Shield, Users, Briefcase, Code, GraduationCap } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import Layout from '@/components/Layout'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState('')
  const [error, setError] = useState('')
  const { data: session, status } = useSession()

  // Check if user is already logged in and redirect immediately
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User already authenticated, redirecting to profile')
      router.replace('/profile')
    }
  }, [session, status, router])

  // Don't render anything if user is authenticated or still loading
  if (status === 'loading') {
    return (
      <Layout title="Loading...">
        <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
            <p className="text-secondary-300 mt-4">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (status === 'authenticated') {
    return null // Will redirect via useEffect
  }

  // Handle OAuth login
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(provider)
    setError('')
    
    try {
      const result = await signIn(provider, { 
        callbackUrl: '/profile',
        redirect: false
      })
      
      if (result?.error) {
        setError(`Login failed: ${result.error}`)
        setIsLoading('')
      } else if (result?.url) {
        // Successful login, redirect to profile
        router.push(result.url)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('OAuth error:', err)
      setIsLoading('')
    }
  }

  return (
    <Layout
      title="Sign In or Sign Up - Equators"
      description="Join Equators community to access exclusive downloads and connect with cutting-edge tools"
    >
      <Head>
        <meta property="og:title" content="Join Equators - Sign In or Sign Up" />
        <meta property="og:description" content="Join our community to access exclusive downloads and innovative tools" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6">
              <Shield className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Join <span className="text-gradient">Equators</span>
            </h2>
            <p className="text-secondary-300 text-lg">
              One click to sign in or create your account
            </p>
            <p className="text-secondary-400 text-sm mt-2">
              New here? No worries - we&apos;ll create your account automatically!
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Login Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card space-y-4"
          >
            <div className="space-y-4">
              {/* GitHub Login */}
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={!!isLoading}
                className="w-full flex items-center justify-center px-6 py-4 border border-secondary-600 rounded-lg text-white bg-secondary-800 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading === 'github' ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Github className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="flex-1 text-left">Continue with GitHub</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Google Login */}
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={!!isLoading}
                className="w-full flex items-center justify-center px-6 py-4 border border-secondary-600 rounded-lg text-white bg-secondary-800 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading === 'google' ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="flex-1 text-left">Continue with Google</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-4 h-4 text-primary-400 mr-2" />
                <span className="text-primary-300 text-sm font-medium">Secure OAuth Login</span>
              </div>
              <p className="text-secondary-400 text-xs">
                Your login is handled securely by Google/GitHub. We never see your password.
              </p>
            </div>
          </motion.div>

          {/* What You Get */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              What you get with your account:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center text-secondary-300">
                <Code className="w-4 h-4 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">Access to exclusive desktop applications</span>
              </div>
              <div className="flex items-center text-secondary-300">
                <Users className="w-4 h-4 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">Join the developer community</span>
              </div>
              <div className="flex items-center text-secondary-300">
                <Briefcase className="w-4 h-4 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">Professional tools and resources</span>
              </div>
              <div className="flex items-center text-secondary-300">
                <GraduationCap className="w-4 h-4 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">Educational content and tutorials</span>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center text-sm text-secondary-500"
          >
            <p>
              By signing in, you agree to our simple usage tracking for downloads.
              <br />
              <span className="text-secondary-400">No spam, no complex terms - just great tools.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
