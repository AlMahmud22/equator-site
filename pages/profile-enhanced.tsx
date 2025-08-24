import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { User, Shield, Key, BarChart3 } from 'lucide-react'
import ProfileSettings from '@/components/profile/ProfileSettings'
import ApiKeysManager from '@/components/profile/ApiKeysManager'
import SecurityManager from '@/components/profile/SecurityManager'
import { useProfile } from '@/hooks/useProfile'

export default function ProfileEnhanced() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { profile, isLoading: profileLoading, isError } = useProfile()
  const [activeTab, setActiveTab] = useState<'profile' | 'api-keys' | 'security'>('profile')
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

  // Show loading state
  if (isLoading || profileLoading) {
    return (
      <Layout title="Profile Dashboard - Equators">
        <Head>
          <title>Profile Dashboard - Equators</title>
          <meta name="description" content="Manage your Equators account settings, security, and integrations" />
        </Head>
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-secondary-700 rounded w-1/4 mb-6"></div>
                <div className="bg-secondary-800 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-secondary-700 rounded w-1/3"></div>
                    <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
                    <div className="h-4 bg-secondary-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Show login redirect
  if (!isAuthenticated) {
    return (
      <Layout title="Profile Dashboard - Equators">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
          <div className="text-center">
            <p className="text-lg text-secondary-300">Redirecting to login...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (isError) {
    return (
      <Layout title="Profile Dashboard - Equators">
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8">
                <h1 className="text-2xl font-bold text-red-400 mb-4">Profile Error</h1>
                <p className="text-red-300">
                  Failed to load profile data. Please try refreshing the page or contact support if the issue persists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Get user data from NextAuth session
  const user = session?.user
  const userName = user?.name || 'User'
  const userEmail = user?.email || ''
  const userImage = user?.image

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile Settings',
      icon: User,
      description: 'Manage your personal information and preferences'
    },
    {
      id: 'api-keys' as const,
      label: 'API Keys',
      icon: Key,
      description: 'Create and manage API keys for integrations'
    },
    {
      id: 'security' as const,
      label: 'Security',
      icon: Shield,
      description: 'View login history, active sessions, and security settings'
    }
  ]

  const getDisplayName = () => {
    return profile?.user?.displayName || userName || 'Anonymous User'
  }

  return (
    <Layout title="Profile Dashboard - Equators">
      <Head>
        <title>Profile Dashboard - Equators</title>
        <meta name="description" content="Manage your Equators account settings, security, and integrations" />
        <meta property="og:title" content="Profile Dashboard - Equators" />
        <meta property="og:description" content="Manage your Equators account settings, security, and integrations" />
      </Head>
      
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Profile Dashboard
                  </h1>
                  <p className="text-secondary-400">
                    Manage your account settings, security, and integrations
                  </p>
                </div>
                
                {/* Profile Summary Card */}
                <div className="flex items-center space-x-4 p-4 bg-secondary-800/50 backdrop-blur-sm border border-secondary-700 rounded-lg">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={getDisplayName()}
                      className="w-12 h-12 rounded-full border-2 border-primary-500"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-medium">{getDisplayName()}</h3>
                    <p className="text-secondary-400 text-sm">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {profile?.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 bg-secondary-800/30 backdrop-blur-sm border border-secondary-700 rounded-lg text-center">
                    <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{profile.stats.totalLogins}</p>
                    <p className="text-xs text-secondary-400">Total Logins</p>
                  </div>
                  <div className="p-4 bg-secondary-800/30 backdrop-blur-sm border border-secondary-700 rounded-lg text-center">
                    <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{profile.stats.activeSessions}</p>
                    <p className="text-xs text-secondary-400">Active Sessions</p>
                  </div>
                  <div className="p-4 bg-secondary-800/30 backdrop-blur-sm border border-secondary-700 rounded-lg text-center">
                    <Key className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{profile.stats.apiKeys}</p>
                    <p className="text-xs text-secondary-400">API Keys</p>
                  </div>
                  <div className="p-4 bg-secondary-800/30 backdrop-blur-sm border border-secondary-700 rounded-lg text-center">
                    <User className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{profile.stats.totalDownloads}</p>
                    <p className="text-xs text-secondary-400">Downloads</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tabs Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-2 p-2 bg-secondary-800/30 backdrop-blur-sm border border-secondary-700 rounded-lg">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                          : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
              
              {/* Tab Description */}
              <div className="mt-4">
                {tabs.map((tab) => (
                  activeTab === tab.id && (
                    <motion.p
                      key={tab.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-secondary-400 text-sm"
                    >
                      {tab.description}
                    </motion.p>
                  )
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[600px]"
            >
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'api-keys' && <ApiKeysManager />}
              {activeTab === 'security' && <SecurityManager />}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
