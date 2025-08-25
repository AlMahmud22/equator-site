import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Download, 
  ExternalLink, 
  LogOut, 
  User, 
  Shield, 
  Activity, 
  Clock,
  Globe,
  Monitor,
  AlertTriangle,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react'
import Layout from '@/components/Layout'

interface LoginHistoryItem {
  _id: string
  timestamp: string
  action: string
  loginProvider: string
  ipAddress: string
  userAgent: string
  success: boolean
  location?: {
    country?: string
    city?: string
  }
}

interface DownloadLogItem {
  _id: string
  projectId: string
  projectName: string
  downloadedAt: string
  fileSize?: number
  version?: string
}

interface UserProfile {
  _id: string
  name: string
  email: string
  image?: string
  provider: string
  providerId: string
  displayName?: string
  bio?: string
  preferences: {
    theme: 'dark' | 'light' | 'system'
    newsletter: boolean
    notifications: boolean
    privacy: {
      showEmail: boolean
      showActivity: boolean
    }
  }
  createdAt: string
  lastLoginAt?: string
  loginHistory: LoginHistoryItem[]
  downloadLogs: DownloadLogItem[]
}

export default function ProfilePage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'downloads'>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Simplified authentication - focus on NextAuth only
  const isAuthenticated = session?.user && sessionStatus === 'authenticated'

  // Loading state management
  useEffect(() => {
    if (sessionStatus !== 'loading') {
      setIsLoading(false)
    }
  }, [sessionStatus])

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return
      
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        await signOut({ redirect: false })
        router.push('/')
      } else {
        console.error('Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format file size helper
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
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

  // Get user data from session or profile
  const userData = profile || {
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    image: session?.user?.image || '',
    provider: 'oauth',
    createdAt: new Date().toISOString(),
    loginHistory: [],
    downloadLogs: []
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Login Activity', icon: Activity },
    { id: 'downloads', label: 'Downloads', icon: Download }
  ]

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
            className="max-w-6xl mx-auto"
          >
            {/* Header Section */}
            <div className="card mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  {userData.image ? (
                    <img 
                      src={userData.image} 
                      alt={userData.name}
                      className="w-20 h-20 rounded-full border-2 border-green-500/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold text-2xl">
                      {userData.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                    <p className="text-secondary-300 text-lg">{userData.email}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-1 text-green-400" />
                        <p className="text-sm text-green-400 capitalize">
                          {userData.provider === 'github' ? 'GitHub' : userData.provider === 'google' ? 'Google' : 'OAuth'} Account
                        </p>
                      </div>
                      {profile?.createdAt && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                          <p className="text-sm text-blue-400">
                            Member since {formatDate(profile.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/settings')}
                    className="btn-ghost flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost flex items-center space-x-2 text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-800/50 text-secondary-300 hover:text-white hover:bg-secondary-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  <div className="lg:col-span-2 space-y-6">
                    {/* Account Information */}
                    <div className="card">
                      <div className="flex items-center mb-6">
                        <User className="w-5 h-5 mr-2 text-green-400" />
                        <h2 className="text-xl font-semibold text-white">Account Information</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-secondary-400 block mb-1">Full Name</label>
                          <p className="text-white font-medium">{userData.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-secondary-400 block mb-1">Email Address</label>
                          <p className="text-white font-medium">{userData.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-secondary-400 block mb-1">Authentication Provider</label>
                          <p className="text-white font-medium capitalize">{userData.provider}</p>
                        </div>
                        <div>
                          <label className="text-sm text-secondary-400 block mb-1">Account Status</label>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                            <span className="text-green-400 font-medium">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features & Access */}
                    <div className="card">
                      <div className="flex items-center mb-6">
                        <Shield className="w-5 h-5 mr-2 text-green-400" />
                        <h2 className="text-xl font-semibold text-white">Your Access & Features</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-secondary-800/50 rounded-lg p-4 hover:bg-secondary-800/70 transition-colors duration-200">
                          <Download className="w-8 h-8 text-green-400 mb-3" />
                          <h3 className="font-semibold text-white mb-2">Desktop Applications</h3>
                          <p className="text-sm text-secondary-300">Access to download all desktop applications including Chatbot, Browser, and AI Playground</p>
                        </div>
                        <div className="bg-secondary-800/50 rounded-lg p-4 hover:bg-secondary-800/70 transition-colors duration-200">
                          <Globe className="w-8 h-8 text-blue-400 mb-3" />
                          <h3 className="font-semibold text-white mb-2">Web Tools</h3>
                          <p className="text-sm text-secondary-300">Access to web-based tools and utilities</p>
                        </div>
                        <div className="bg-secondary-800/50 rounded-lg p-4 hover:bg-secondary-800/70 transition-colors duration-200">
                          <Shield className="w-8 h-8 text-purple-400 mb-3" />
                          <h3 className="font-semibold text-white mb-2">API Integration</h3>
                          <p className="text-sm text-secondary-300">OAuth integration for desktop app authentication</p>
                        </div>
                        <div className="bg-secondary-800/50 rounded-lg p-4 hover:bg-secondary-800/70 transition-colors duration-200">
                          <Activity className="w-8 h-8 text-yellow-400 mb-3" />
                          <h3 className="font-semibold text-white mb-2">Activity Tracking</h3>
                          <p className="text-sm text-secondary-300">Monitor your login history and download activity</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-300">Total Downloads</span>
                          <span className="text-white font-semibold">{profile?.downloadLogs?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-300">Login Sessions</span>
                          <span className="text-white font-semibold">{profile?.loginHistory?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-300">Account Type</span>
                          <span className="text-green-400 font-semibold">Free</span>
                        </div>
                      </div>
                    </div>

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
                          onClick={() => router.push('/settings')}
                          className="btn-ghost w-full text-left flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Account Settings</span>
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

                    {/* Privacy Notice */}
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
                  </div>
                </>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="lg:col-span-3">
                  <div className="card">
                    <div className="flex items-center mb-6">
                      <Activity className="w-5 h-5 mr-2 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">Login Activity</h2>
                    </div>
                    
                    {profile?.loginHistory && profile.loginHistory.length > 0 ? (
                      <div className="space-y-4">
                        {profile.loginHistory.slice(0, 10).map((log, index) => (
                          <div key={log._id || index} className="bg-secondary-800/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${log.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <div>
                                  <p className="text-white font-medium">
                                    {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-sm text-secondary-300">
                                      {log.loginProvider.charAt(0).toUpperCase() + log.loginProvider.slice(1)}
                                    </span>
                                    <span className="text-sm text-secondary-300">
                                      {log.ipAddress}
                                    </span>
                                    {log.location && (
                                      <span className="text-sm text-secondary-300">
                                        {log.location.city}, {log.location.country}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-secondary-300">
                                  {formatDate(log.timestamp)}
                                </p>
                                {!log.success && (
                                  <div className="flex items-center mt-1">
                                    <AlertTriangle className="w-4 h-4 mr-1 text-red-400" />
                                    <span className="text-xs text-red-400">Failed</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                        <p className="text-secondary-300">No login activity recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Downloads Tab */}
              {activeTab === 'downloads' && (
                <div className="lg:col-span-3">
                  <div className="card">
                    <div className="flex items-center mb-6">
                      <Download className="w-5 h-5 mr-2 text-green-400" />
                      <h2 className="text-xl font-semibold text-white">Download History</h2>
                    </div>
                    
                    {profile?.downloadLogs && profile.downloadLogs.length > 0 ? (
                      <div className="space-y-4">
                        {profile.downloadLogs.map((download, index) => (
                          <div key={download._id || index} className="bg-secondary-800/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Monitor className="w-8 h-8 text-green-400" />
                                <div>
                                  <p className="text-white font-medium">{download.projectName}</p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {download.version && (
                                      <span className="text-sm text-secondary-300">
                                        v{download.version}
                                      </span>
                                    )}
                                    <span className="text-sm text-secondary-300">
                                      {formatFileSize(download.fileSize)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-secondary-300">
                                  {formatDate(download.downloadedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Download className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                        <p className="text-secondary-300 mb-4">No downloads yet</p>
                        <button
                          onClick={() => router.push('/products')}
                          className="btn-primary"
                        >
                          Browse Applications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="card mt-8 border-red-500/20">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white mb-1">Delete Account</h3>
                    <p className="text-sm text-secondary-300">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-secondary-900 rounded-xl p-6 max-w-md w-full mx-4 border border-red-500/20"
                >
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
                    <h3 className="text-xl font-semibold text-white">Confirm Account Deletion</h3>
                  </div>
                  <p className="text-secondary-300 mb-6">
                    Are you sure you want to delete your account? This will permanently remove all your data, 
                    including login history, download logs, and preferences. This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
