import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  LogOut, 
  User, 
  Shield, 
  Activity, 
  Clock,
  Globe,
  Monitor,
  Mail,
  ExternalLink
} from 'lucide-react'
import Layout from '@/components/Layout'

export default function ProfilePage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === 'loading') return
    
    if (sessionStatus === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to login page')
      router.push('/auth/login?callbackUrl=/profile')
      return
    }
    
    // User is authenticated, stop loading
    setIsLoading(false)
  }, [sessionStatus, router])

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Show loading spinner while checking authentication
  if (isLoading || sessionStatus === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-slate-300 mt-4">Loading profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Redirect if not authenticated (should be handled by useEffect, but safety check)
  if (!session?.user) {
    return null
  }

  const user = session.user
  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : user.email ? user.email[0].toUpperCase() : 'U'

  return (
    <Layout>
      <Head>
        <title>Profile - Equators Tech</title>
        <meta name="description" content="Your profile information and account details" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User avatar'}
                        className="w-24 h-24 rounded-full border-4 border-purple-500/30"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-purple-500/30">
                        <span className="text-2xl font-bold text-white">{userInitials}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-slate-800"></div>
                  </div>

                  {/* User Info */}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {user.name || 'Anonymous User'}
                    </h1>
                    <p className="text-slate-300 text-lg mb-1">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Shield className="w-4 h-4" />
                      <span>Authenticated via {(user as any).authType || 'OAuth'}</span>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Account Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-400" />
                  Account Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Email</span>
                    </div>
                    <span className="text-white">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Provider</span>
                    </div>
                    <span className="text-white capitalize">
                      {(user as any).authType || 'OAuth'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">User ID</span>
                    </div>
                    <span className="text-white font-mono text-sm">
                      {(user as any).id || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Status</span>
                    </div>
                    <span className="text-green-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Session Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-400" />
                  Session Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Session Type</span>
                    </div>
                    <span className="text-white">JWT Token</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Device</span>
                    </div>
                    <span className="text-white">Web Browser</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Logged In</span>
                    </div>
                    <span className="text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Security</span>
                    </div>
                    <span className="text-green-400">Verified</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mt-8"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-purple-400" />
                Quick Actions
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <User className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Account Settings</div>
                    <div className="text-slate-400 text-sm">Manage your preferences</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/security-dashboard')}
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Security Dashboard</div>
                    <div className="text-slate-400 text-sm">View security logs</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <Globe className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Back to Home</div>
                    <div className="text-slate-400 text-sm">Return to main site</div>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Debug Information (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mt-8"
              >
                <h3 className="text-lg font-semibold text-slate-300 mb-4">
                  Debug Information (Development)
                </h3>
                <pre className="bg-slate-900/50 p-4 rounded-lg text-xs text-slate-300 overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
