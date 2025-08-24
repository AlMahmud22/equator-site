import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { Calendar, Download, ExternalLink, LogOut, User, Shield, Activity } from 'lucide-react'
import Layout from '@/components/Layout'

export default function ProfilePage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Simplified authentication - focus on NextAuth only
  const isAuthenticated = session?.user && sessionStatus === 'authenticated'

  // Loading state management
  useEffect(() => {
    if (sessionStatus !== 'loading') {
      setIsLoading(false)
    }
  }, [sessionStatus])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Layout title="Profile - Equators">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-secondary-300">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show login redirect
  if (!isAuthenticated) {
    return (
      <Layout title="Profile - Equators">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
          <div className="text-center">
            <p className="text-lg text-secondary-300">Redirecting to login...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Get user data from NextAuth session
  const user = session.user
  const userEmail = user?.email || ''
  const userName = user?.name || 'User'
  const userImage = user?.image || ''
  const authProvider = (session as any)?.provider || 'oauth'

  return (
    <Layout
      title="Profile - Equators"
      description="Your Equators profile and account information"
    >
      <Head>
        <meta property="og:title" content="Profile - Equators" />
        <meta property="og:description" content="Your Equators profile and account information" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 pt-20">
        <div className="container-custom py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header Section */}
            <div className="card mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt={userName}
                      className="w-16 h-16 rounded-full border-2 border-green-500/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold text-xl">
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-white">{userName}</h1>
                    <p className="text-secondary-300">{userEmail}</p>
                    <div className="flex items-center mt-1">
                      <Shield className="w-4 h-4 mr-1 text-green-400" />
                      <p className="text-sm text-green-400 capitalize">
                        {authProvider === 'github' ? 'GitHub' : authProvider === 'google' ? 'Google' : 'OAuth'} Account
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost flex items-center space-x-2 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Account Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <div className="flex items-center mb-4">
                    <User className="w-5 h-5 mr-2 text-green-400" />
                    <h2 className="text-xl font-semibold text-white">Account Information</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-secondary-400">Full Name</label>
                      <p className="text-white">{userName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-400">Email Address</label>
                      <p className="text-white">{userEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-400">Account Type</label>
                      <p className="text-white capitalize">{authProvider} Authentication</p>
                    </div>
                  </div>
                </div>

                {/* Features & Access */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    <h2 className="text-xl font-semibold text-white">Your Access</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-secondary-800/50 rounded-lg p-4">
                      <Download className="w-6 h-6 text-green-400 mb-2" />
                      <h3 className="font-semibold text-white mb-1">Downloads</h3>
                      <p className="text-sm text-secondary-300">Access to all desktop applications</p>
                    </div>
                    <div className="bg-secondary-800/50 rounded-lg p-4">
                      <Shield className="w-6 h-6 text-blue-400 mb-2" />
                      <h3 className="font-semibold text-white mb-1">API Access</h3>
                      <p className="text-sm text-secondary-300">OAuth integration for desktop apps</p>
                    </div>
                    <div className="bg-secondary-800/50 rounded-lg p-4">
                      <ExternalLink className="w-6 h-6 text-purple-400 mb-2" />
                      <h3 className="font-semibold text-white mb-1">Tools</h3>
                      <p className="text-sm text-secondary-300">Access to web-based tools</p>
                    </div>
                    <div className="bg-secondary-800/50 rounded-lg p-4">
                      <Calendar className="w-6 h-6 text-yellow-400 mb-2" />
                      <h3 className="font-semibold text-white mb-1">Updates</h3>
                      <p className="text-sm text-secondary-300">Latest project notifications</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/products')}
                      className="btn-ghost w-full text-left flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Browse Downloads</span>
                    </button>
                    <button
                      onClick={() => router.push('/contact')}
                      className="btn-ghost w-full text-left flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Contact Support</span>
                    </button>
                  </div>
                </div>

                {/* Privacy Info */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-green-400 mr-2" />
                    <h3 className="font-semibold text-green-400">Privacy First</h3>
                  </div>
                  <p className="text-green-300 text-sm">
                    Only essential profile information is stored. No tracking, no spam, 
                    just simple authentication for accessing tools and downloads.
                  </p>
                </div>

                {/* Status */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-300">Status</span>
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-300">Type</span>
                      <span className="text-white">Free</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
