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
  Eye, 
  Save,
  Check,
  AlertCircle,
  Copy,
  Trash2,
  Plus,
  Monitor,
  X,
  Settings,
  Lock,
  Globe
} from 'lucide-react'
import Layout from '@/components/Layout'

interface SettingsData {
  displayName: string
  bio: string
  theme: 'dark' | 'light' | 'system'
  language: string
  profileVisibility: 'public' | 'private'
  emailNotifications: boolean
  securityAlerts: boolean
  showEmail: boolean
  showActivity: boolean
  privacy?: {
    dataCollection: boolean
    analytics: boolean
    marketing: boolean
  }
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

interface ActiveSession {
  sessionToken: string
  deviceInfo?: {
    browser?: string
    os?: string
    device?: string
  }
  ipAddress?: string
  location?: string
  lastActiveAt: string
  isActive: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState<SettingsData>({
    displayName: '',
    bio: '',
    theme: 'dark',
    language: 'en',
    profileVisibility: 'public',
    emailNotifications: true,
    securityAlerts: true,
    showEmail: false,
    showActivity: true,
    privacy: {
      dataCollection: false,
      analytics: false,
      marketing: false
    }
  })

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [showNewApiKey, setShowNewApiKey] = useState(false)

  // Security state
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])

  // Check admin status and load settings on mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      checkAdminStatus()
      loadSettings()
    }
  }, [session, status])

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

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(prev => ({ ...prev, ...data.data }))
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaveStatus('saving')
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSaveStatus('success')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } else {
          throw new Error(data.message || 'Failed to save settings')
        }
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const loadApiKeys = async () => {
    if (!isAdmin) return
    
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

  const createApiKey = async () => {
    if (!newApiKeyName.trim() || !isAdmin) return

    try {
      const response = await fetch('/api/profile/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newApiKeyName,
          permissions: ['read', 'write']
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApiKeys([...apiKeys, data.data])
          setNewApiKeyName('')
          setShowNewApiKey(false)
        }
      }
    } catch (error) {
      console.error('Error creating API key:', error)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!isAdmin) return

    try {
      const response = await fetch('/api/profile/api-keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.keyId !== keyId))
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const loadActiveSessions = async () => {
    try {
      const response = await fetch('/api/sessions/manage')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setActiveSessions(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'api-keys' && isAdmin) {
      loadApiKeys()
    } else if (activeTab === 'security') {
      loadActiveSessions()
    }
  }, [activeTab, isAdmin])

  if (status === 'loading') {
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
    { id: 'profile', label: 'Profile', icon: User },
    ...(isAdmin ? [{ id: 'privacy', label: 'Privacy', icon: Shield }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    ...(isAdmin ? [{ id: 'api-keys', label: 'API Keys', icon: Key }] : [])
  ]

  return (
    <Layout title="Settings - Equators">
      <Head>
        <meta property="og:title" content="Settings - Equators" />
        <meta property="og:description" content="Manage your account settings and preferences" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Settings{isAdmin && <span className="text-primary-400 ml-2">(Admin)</span>}
            </h1>
            <p className="text-secondary-300 text-lg">
              Manage your account preferences and security settings
            </p>
          </div>

          <div className="bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-600/50 overflow-hidden">
            {/* Tab Navigation */}
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
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={settings.displayName}
                        onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Your display name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={settings.bio}
                      onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Visibility Settings</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Profile Visibility</p>
                        <p className="text-secondary-400 text-sm">Control who can see your profile</p>
                      </div>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value as 'public' | 'private' })}
                        className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Show Email</p>
                        <p className="text-secondary-400 text-sm">Display email on public profile</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, showEmail: !settings.showEmail })}
                        className={`${
                          settings.showEmail ? 'bg-primary-500' : 'bg-secondary-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-800`}
                      >
                        <span
                          className={`${
                            settings.showEmail ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Show Activity</p>
                        <p className="text-secondary-400 text-sm">Display recent activity on profile</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, showActivity: !settings.showActivity })}
                        className={`${
                          settings.showActivity ? 'bg-primary-500' : 'bg-secondary-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-800`}
                      >
                        <span
                          className={`${
                            settings.showActivity ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Privacy Tab (Admin Only) */}
              {activeTab === 'privacy' && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Data Collection</p>
                        <p className="text-secondary-400 text-sm">Allow collection of usage analytics</p>
                      </div>
                      <button
                        onClick={() => setSettings({ 
                          ...settings, 
                          privacy: { ...settings.privacy!, dataCollection: !settings.privacy?.dataCollection }
                        })}
                        className={`${
                          settings.privacy?.dataCollection ? 'bg-primary-500' : 'bg-secondary-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-800`}
                      >
                        <span
                          className={`${
                            settings.privacy?.dataCollection ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Analytics</p>
                        <p className="text-secondary-400 text-sm">Share anonymized usage data</p>
                      </div>
                      <button
                        onClick={() => setSettings({ 
                          ...settings, 
                          privacy: { ...settings.privacy!, analytics: !settings.privacy?.analytics }
                        })}
                        className={`${
                          settings.privacy?.analytics ? 'bg-primary-500' : 'bg-secondary-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-800`}
                      >
                        <span
                          className={`${
                            settings.privacy?.analytics ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Marketing Communications</p>
                        <p className="text-secondary-400 text-sm">Receive updates about new features</p>
                      </div>
                      <button
                        onClick={() => setSettings({ 
                          ...settings, 
                          privacy: { ...settings.privacy!, marketing: !settings.privacy?.marketing }
                        })}
                        className={`${
                          settings.privacy?.marketing ? 'bg-primary-500' : 'bg-secondary-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-800`}
                      >
                        <span
                          className={`${
                            settings.privacy?.marketing ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-secondary-400 text-sm">Receive important updates via email</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        className={`${
                          settings.emailNotifications ? 'bg-primary-500' : 'bg-secondary-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-800`}
                      >
                        <span
                          className={`${
                            settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Security Alerts</p>
                        <p className="text-secondary-400 text-sm">Get notified about security events</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, securityAlerts: !settings.securityAlerts })}
                        className={`${
                          settings.securityAlerts ? 'bg-primary-500' : 'bg-secondary-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-800`}
                      >
                        <span
                          className={`${
                            settings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Security & Sessions</h3>
                  
                  {activeSessions.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Active Sessions</h4>
                      {activeSessions.map((session, index) => (
                        <div key={index} className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
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
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                      <p className="text-secondary-400">No active sessions found</p>
                    </div>
                  )}
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
                    <button
                      onClick={() => setShowNewApiKey(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Key</span>
                    </button>
                  </div>

                  {showNewApiKey && (
                    <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
                      <h4 className="text-lg font-medium text-white mb-4">Create New API Key</h4>
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={newApiKeyName}
                          onChange={(e) => setNewApiKeyName(e.target.value)}
                          placeholder="API Key Name"
                          className="flex-1 px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          onClick={createApiKey}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => {
                            setShowNewApiKey(false)
                            setNewApiKeyName('')
                          }}
                          className="px-4 py-2 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {apiKeys.length > 0 ? (
                    <div className="space-y-4">
                      {apiKeys.map((apiKey) => (
                        <div key={apiKey.keyId} className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-white">{apiKey.name}</h4>
                            <button
                              onClick={() => deleteApiKey(apiKey.keyId)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete API Key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-secondary-400 text-sm mb-2">
                            Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                            {apiKey.lastUsedAt && (
                              <> • Last used: {new Date(apiKey.lastUsedAt).toLocaleDateString()}</>
                            )}
                          </p>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 px-3 py-2 bg-secondary-800 rounded text-secondary-300 text-sm font-mono">
                              {apiKey.keyId}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(apiKey.keyId)}
                              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-600 rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-secondary-400 text-sm">Permissions:</span>
                            {apiKey.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Key className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                      <p className="text-secondary-400">No API keys created yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-between pt-6 border-t border-secondary-700/50">
                <div className="flex items-center space-x-2">
                  {saveStatus === 'saving' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
                      <span className="text-secondary-300">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'success' && (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Settings saved successfully!</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">Failed to save settings. Please try again.</span>
                    </>
                  )}
                </div>
                
                <button
                  onClick={saveSettings}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
