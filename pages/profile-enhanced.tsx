import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  Key, 
  Bell, 
  Settings,
  Download,
  Clock,
  Activity,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Monitor,
  Smartphone,
  Globe,
  Plus,
  Trash2
} from 'lucide-react'
import Layout from '@/components/Layout'

interface UserProfile {
  name: string
  email: string
  image?: string
  role: string
  bio?: string
  location?: string
  company?: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: string
  createdAt: string
}

interface UserStats {
  totalLogins: number
  totalDownloads: number
  activeSessions: number
  registeredApps: number
  apiKeys: number
}

interface ApiKey {
  _id: string
  keyId: string
  name: string
  permissions: string[]
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
}

interface RegisteredApp {
  _id: string
  clientId: string
  name: string
  appType: string
  platform?: string
  isActive: boolean
  isApproved: boolean
  createdAt: string
  stats: {
    totalTokensIssued: number
    totalUsersAuthorized: number
    lastUsedAt?: string
  }
}

interface Session {
  sessionToken: string
  deviceInfo: {
    browser?: string
    os?: string
    device?: string
  }
  ipAddress?: string
  lastActiveAt: string
  isActive: boolean
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '', location: '', company: '' })
  
  // Admin-only data
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [registeredApps, setRegisteredApps] = useState<RegisteredApp[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    description: '',
    appType: 'desktop',
    platform: '',
    redirectUris: [''],
    scopes: ['read', 'profile']
  })
  const [showNewAppForm, setShowNewAppForm] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      loadProfile()
      checkAdminStatus()
    }
  }, [session, status])

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'api-keys') loadApiKeys()
      if (activeTab === 'apps') loadRegisteredApps()
      if (activeTab === 'sessions') loadSessions()
    }
  }, [activeTab, isAdmin])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/user/permissions')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(data.data.user)
          setStats(data.data.stats)
          setEditForm({
            name: data.data.user.name || '',
            bio: data.data.user.bio || '',
            location: data.data.user.location || '',
            company: data.data.user.company || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/profile/api-keys')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApiKeys(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  const loadRegisteredApps = async () => {
    try {
      const response = await fetch('/api/apps/manage')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRegisteredApps(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading registered apps:', error)
    }
  }

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions/manage')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSessions(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const saveProfile = async () => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(prev => prev ? { ...prev, ...editForm } : null)
          setIsEditing(false)
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const createApp = async () => {
    try {
      const response = await fetch('/api/apps/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppForm)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRegisteredApps([...registeredApps, data.data])
          setShowNewAppForm(false)
          setNewAppForm({
            name: '',
            description: '',
            appType: 'desktop',
            platform: '',
            redirectUris: [''],
            scopes: ['read', 'profile']
          })
        }
      }
    } catch (error) {
      console.error('Error creating app:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Loading...">
        <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        </div>
      </Layout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  // Define available tabs based on admin status
  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    ...(isAdmin ? [
      { id: 'api-keys', label: 'API Keys', icon: Key },
      { id: 'apps', label: 'Registered Apps', icon: Monitor },
      { id: 'sessions', label: 'Sessions', icon: Shield }
    ] : [])
  ]

  return (
    <Layout title={`${profile?.name || 'User'} - Profile`}>
      <Head>
        <meta property="og:title" content={`${profile?.name} - Profile`} />
        <meta property="og:description" content="User profile and settings" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-600/50 p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  {profile?.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-24 h-24 rounded-full border-4 border-primary-400"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-4 border-primary-400">
                      <span className="text-2xl font-bold text-white">
                        {profile?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="absolute -top-2 -right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ADMIN
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-2xl font-bold bg-secondary-700 text-white rounded-lg px-4 py-2 w-full"
                        placeholder="Your name"
                      />
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="bg-secondary-700 text-secondary-300 rounded-lg px-4 py-2 w-full resize-none"
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="bg-secondary-700 text-white rounded-lg px-4 py-2"
                          placeholder="Location"
                        />
                        <input
                          type="text"
                          value={editForm.company}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          className="bg-secondary-700 text-white rounded-lg px-4 py-2"
                          placeholder="Company"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">{profile?.name}</h1>
                      <p className="text-secondary-300 text-lg mb-4">{profile?.email}</p>
                      {profile?.bio && (
                        <p className="text-secondary-400 mb-4">{profile.bio}</p>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-secondary-400">
                        {profile?.location && (
                          <span>📍 {profile.location}</span>
                        )}
                        {profile?.company && (
                          <span>🏢 {profile.company}</span>
                        )}
                        <span>📅 Member since {new Date(profile?.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveProfile}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => router.push('/settings')}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-secondary-700/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">{stats.totalLogins}</div>
                  <div className="text-secondary-400 text-sm">Total Logins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">{stats.totalDownloads}</div>
                  <div className="text-secondary-400 text-sm">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">{stats.activeSessions}</div>
                  <div className="text-secondary-400 text-sm">Active Sessions</div>
                </div>
                {isAdmin && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-400">{stats.apiKeys}</div>
                    <div className="text-secondary-400 text-sm">API Keys</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-600/50 overflow-hidden">
            <div className="border-b border-secondary-700/50">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {availableTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-primary-400 text-primary-400'
                          : 'border-transparent text-secondary-400 hover:text-secondary-300 hover:border-secondary-600'
                      } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-secondary-700/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-300">Email Verified</span>
                          <div className="flex items-center space-x-2">
                            {profile?.emailVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                            )}
                            <span className={profile?.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                              {profile?.emailVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-300">Account Status</span>
                          <span className={profile?.isActive ? 'text-green-400' : 'text-red-400'}>
                            {profile?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-300">Last Login</span>
                          <span className="text-secondary-400">
                            {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary-700/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => router.push('/settings')}
                          className="w-full flex items-center space-x-3 px-4 py-3 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Account Settings</span>
                        </button>
                        <button
                          onClick={() => router.push('/products')}
                          className="w-full flex items-center space-x-3 px-4 py-3 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Browse Downloads</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setActiveTab('apps')}
                            className="w-full flex items-center space-x-3 px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Register New App</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                  <div className="bg-secondary-700/50 rounded-lg p-6">
                    <p className="text-secondary-400 text-center py-8">
                      Activity tracking will be available soon
                    </p>
                  </div>
                </motion.div>
              )}

              {/* API Keys Tab (Admin Only) */}
              {activeTab === 'api-keys' && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">API Keys</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Create API Key</span>
                    </button>
                  </div>
                  
                  {apiKeys.length > 0 ? (
                    <div className="space-y-4">
                      {apiKeys.map((key) => (
                        <div key={key._id} className="bg-secondary-700/50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-white">{key.name}</h4>
                            <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 px-3 py-2 bg-secondary-800 rounded text-secondary-300 text-sm font-mono">
                                {key.keyId}
                              </code>
                            </div>
                            <div className="text-sm text-secondary-400">
                              Created: {new Date(key.createdAt).toLocaleDateString()}
                              {key.lastUsedAt && (
                                <> • Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Key className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                      <p className="text-secondary-400">No API keys created yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Registered Apps Tab (Admin Only) */}
              {activeTab === 'apps' && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Registered Apps</h3>
                    <button 
                      onClick={() => setShowNewAppForm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register New App</span>
                    </button>
                  </div>

                  {/* New App Form */}
                  {showNewAppForm && (
                    <div className="bg-secondary-700/50 rounded-lg p-6 border border-secondary-600">
                      <h4 className="text-lg font-medium text-white mb-4">Register New App</h4>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="App Name"
                          value={newAppForm.name}
                          onChange={(e) => setNewAppForm({ ...newAppForm, name: e.target.value })}
                          className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white"
                        />
                        <select
                          value={newAppForm.appType}
                          onChange={(e) => setNewAppForm({ ...newAppForm, appType: e.target.value })}
                          className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white"
                        >
                          <option value="desktop">Desktop App</option>
                          <option value="mobile">Mobile App</option>
                          <option value="web">Web App</option>
                          <option value="api">API Client</option>
                        </select>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={createApp}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                          Register App
                        </button>
                        <button
                          onClick={() => setShowNewAppForm(false)}
                          className="px-4 py-2 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Apps List */}
                  {registeredApps.length > 0 ? (
                    <div className="space-y-4">
                      {registeredApps.map((app) => (
                        <div key={app._id} className="bg-secondary-700/50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-medium text-white">{app.name}</h4>
                              <p className="text-secondary-400 text-sm">
                                {app.appType} • Created {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {app.isApproved ? 'Approved' : 'Pending'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {app.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-secondary-400">
                            Client ID: <code className="bg-secondary-800 px-2 py-1 rounded">{app.clientId}</code>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-secondary-600">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-primary-400">{app.stats.totalTokensIssued}</div>
                              <div className="text-xs text-secondary-400">Tokens Issued</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-primary-400">{app.stats.totalUsersAuthorized}</div>
                              <div className="text-xs text-secondary-400">Users Authorized</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-primary-400">
                                {app.stats.lastUsedAt ? new Date(app.stats.lastUsedAt).toLocaleDateString() : 'Never'}
                              </div>
                              <div className="text-xs text-secondary-400">Last Used</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Monitor className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                      <p className="text-secondary-400">No apps registered yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Sessions Tab (Admin Only) */}
              {activeTab === 'sessions' && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white">Active Sessions</h3>
                  
                  {sessions.length > 0 ? (
                    <div className="space-y-4">
                      {sessions.map((session, index) => (
                        <div key={index} className="bg-secondary-700/50 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Monitor className="w-5 h-5 text-primary-400" />
                              <div>
                                <p className="text-white font-medium">
                                  {session.deviceInfo?.browser || 'Unknown Browser'} on {session.deviceInfo?.os || 'Unknown OS'}
                                </p>
                                <p className="text-secondary-400 text-sm">
                                  {session.ipAddress} • Last active: {new Date(session.lastActiveAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {session.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                      <p className="text-secondary-400">No active sessions found</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
