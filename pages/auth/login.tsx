import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Github, Mail, ArrowRight } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Layout from '@/components/Layout'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState('')
  const [error, setError] = useState('')

  // Capture and store redirect parameter
  useEffect(() => {
    const { redirect } = router.query
    if (redirect && typeof redirect === 'string') {
      sessionStorage.setItem('authRedirect', redirect)
    }
  }, [router.query])

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(provider)
    setError('')
    
    try {
      // Check if there's a stored redirect for desktop apps
      const storedRedirect = sessionStorage.getItem('authRedirect')
      let callbackUrl = '/profile' // Default to profile page
      
      if (storedRedirect && storedRedirect.startsWith('equatorschatbot://')) {
        callbackUrl = storedRedirect
        sessionStorage.removeItem('authRedirect')
      }
      
      // Use NextAuth's built-in redirect functionality
      await signIn(provider, { 
        callbackUrl,
        redirect: true // Let NextAuth handle the redirect
      })
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('OAuth error:', err)
      setIsLoading('')
    }
  }

  return (
    <Layout
      title="Sign In - Equators"
      description="Sign in to access downloads and connect with Equators tools"
    >
      <Head>
        <meta property="og:title" content="Sign In - Equators" />
        <meta property="og:description" content="Sign in to access downloads and connect with Equators tools" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to <span className="text-gradient">Equators</span>
            </h2>
            <p className="text-secondary-300">
              Sign in to access downloads and connect with my tools
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card space-y-6"
          >
            <div className="space-y-4">
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading === 'github'}
                className="w-full flex items-center justify-center px-4 py-3 border border-secondary-600 rounded-lg text-white bg-secondary-800 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'github' ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Github className="w-5 h-5 mr-3" />
                    Continue with GitHub
                    <ArrowRight className="w-4 h-4 ml-3" />
                  </>
                )}
              </button>

              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading === 'google'}
                className="w-full flex items-center justify-center px-4 py-3 border border-secondary-600 rounded-lg text-white bg-secondary-800 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'google' ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-3" />
                    Continue with Google
                    <ArrowRight className="w-4 h-4 ml-3" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-sm text-secondary-400">
              <p>
                Sign in to download projects and access tools.
                <br />
                No account? No problem - OAuth creates one automatically.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center text-sm text-secondary-500"
          >
            <p>
              By signing in, you agree to simple usage tracking for downloads.
              <br />
              No complex terms, just basic analytics.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
