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
  X
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
  _id: string
  ipAddress: string
  userAgent: string
  location?: {
    city?: string
    country?: string
  }
  lastActive: string
  current: boolean
}

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'security' | 'api-keys' | 'sessions'>('profile')
  
  // Form states
  const [settings, setSettings] = useState<SettingsData>({
    displayName: '',
    bio: '',
    theme: 'dark',
    language: 'en',
    profileVisibility: 'public',
    emailNotifications: true,
    securityAlerts: true,
    showEmail: false,
    showActivity: true
  })
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [generatedApiKey, setGeneratedApiKey] = useState('')
  const [showDeleteSessionConfirm, setShowDeleteSessionConfirm] = useState<string | null>(null)

  // Authentication check
  const isAuthenticated = session?.user && sessionStatus === 'authenticated'

  // Loading state management
  useEffect(() => {
    if (sessionStatus !== 'loading') {
      setIsLoading(false)
    }
  }, [sessionStatus])

  // Fetch user settings and data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return
      
      try {
        // Fetch user profile/settings
        const profileResponse = await fetch('/api/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setSettings({
            displayName: profileData.displayName || profileData.name || '',
            bio: profileData.bio || '',
            theme: profileData.preferences?.theme || 'dark',
            language: 'en',
            profileVisibility: profileData.preferences?.privacy?.showEmail ? 'public' : 'private',
            emailNotifications: profileData.preferences?.notifications || true,
            securityAlerts: true,
            showEmail: profileData.preferences?.privacy?.showEmail || false,
            showActivity: profileData.preferences?.privacy?.showActivity || true
          })
        }

        // Fetch API keys
        const apiKeysResponse = await fetch('/api/profile/api-keys')
        if (apiKeysResponse.ok) {
          const apiKeysData = await apiKeysResponse.json()
          setApiKeys(apiKeysData.apiKeys || [])
        }

        // Fetch active sessions
        const sessionsResponse = await fetch('/api/profile/sessions')
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json()
          setActiveSessions(sessionsData.sessions || [])
        }
      } catch (error) {
        console.error('Error fetching settings data:', error)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Handle settings save
  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: settings.displayName,
          bio: settings.bio,
          preferences: {
            theme: settings.theme,
            notifications: settings.emailNotifications,
            privacy: {
              showEmail: settings.showEmail,
              showActivity: settings.showActivity
            }
          }
        })
      })

      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle API key generation
  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) return

    try {
      const response = await fetch('/api/profile/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newApiKeyName,
          permissions: ['desktop_auth'] // Default permissions
        })
      })

      if (response.ok) {
        const result = await response.json()
        setGeneratedApiKey(result.apiKey) // The actual key (only shown once)
        setApiKeys(prev => [...prev, result.keyData]) // The stored key data
        setNewApiKeyName('')
      }
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }

  // Handle API key deletion
  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/profile/api-keys`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      })

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.keyId !== keyId))
      }
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  // Handle session termination
  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/profile/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        setActiveSessions(prev => prev.filter(session => session._id !== sessionId))
        setShowDeleteSessionConfirm(null)
      }
    } catch (error) {
      console.error('Failed to terminate session:', error)
    }
  }

  const updateSetting = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Show loading state
  if (isLoading) {
    return (
      <Layout title="Settings - Equators">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-secondary-300">Loading settings...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'sessions', label: 'Sessions', icon: Monitor }
  ]

  return (
    <Layout title="Settings - Equators">
      <Head>
        <title>Settings - Equators</title>
        <meta name="description" content="Manage your account settings, privacy, and security preferences" />
        <meta property="og:title" content="Settings - Equators" />
        <meta property="og:description" content="Manage your account settings, privacy, and security preferences" />
      </Head>

      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
              <p className="text-secondary-300">
                Manage your account preferences, security settings, and API access
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-secondary-900/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            activeTab === tab.id
                              ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                              : 'text-secondary-300 hover:text-white hover:bg-secondary-800/50'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {tab.label}
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                <div className="bg-secondary-900/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-6">
                  
                  {/* Profile Settings */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-300 mb-2">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={settings.displayName}
                            onChange={(e) => updateSetting('displayName', e.target.value)}
                            className="w-full bg-secondary-800 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Your display name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-300 mb-2">
                            Bio
                          </label>
                          <textarea
                            value={settings.bio}
                            onChange={(e) => updateSetting('bio', e.target.value)}
                            rows={3}
                            className="w-full bg-secondary-800 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Tell us about yourself..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-300 mb-2">
                            Theme
                          </label>
                          <select
                            value={settings.theme}
                            onChange={(e) => updateSetting('theme', e.target.value)}
                            className="w-full bg-secondary-800 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="system">System</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-300 mb-2">
                            Language
                          </label>
                          <select
                            value={settings.language}
                            onChange={(e) => updateSetting('language', e.target.value)}
                            className="w-full bg-secondary-800 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Privacy Settings */}
                  {activeTab === 'privacy' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-white mb-4">Privacy Settings</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-secondary-700/30">
                          <div>
                            <h3 className="font-medium text-white">Show Email Address</h3>
                            <p className="text-sm text-secondary-400">
                              Make your email address visible to other users
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showEmail}
                              onChange={(e) => updateSetting('showEmail', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-secondary-700/30">
                          <div>
                            <h3 className="font-medium text-white">Show Activity</h3>
                            <p className="text-sm text-secondary-400">
                              Display your recent login activity
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showActivity}
                              onChange={(e) => updateSetting('showActivity', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-yellow-500 mb-1">Data Usage Notice</h4>
                              <p className="text-sm text-yellow-200/80">
                                We collect minimal data necessary for authentication and service provision. 
                                Your data is never sold to third parties.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-secondary-700/30">
                          <div>
                            <h3 className="font-medium text-white">Email Notifications</h3>
                            <p className="text-sm text-secondary-400">
                              Receive email updates about your account
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.emailNotifications}
                              onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-secondary-700/30">
                          <div>
                            <h3 className="font-medium text-white">Security Alerts</h3>
                            <p className="text-sm text-secondary-400">
                              Get notified about security events
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.securityAlerts}
                              onChange={(e) => updateSetting('securityAlerts', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="flex items-start">
                            <Key className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-blue-500 mb-1">OAuth Authentication</h4>
                              <p className="text-sm text-blue-200/80">
                                You&apos;re currently signed in with {session?.user?.email ? 'OAuth' : 'social'} authentication. 
                                This is already quite secure!
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                          <div className="flex items-start">
                            <Shield className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-green-500 mb-1">Account Security</h4>
                              <p className="text-sm text-green-200/80 mb-3">
                                Your account is protected by industry-standard OAuth 2.0 authentication.
                              </p>
                              <ul className="text-sm text-green-200/80 space-y-1">
                                <li>• Encrypted session tokens</li>
                                <li>• Secure HTTP-only cookies</li>
                                <li>• CSRF protection</li>
                                <li>• Regular security monitoring</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* API Keys */}
                  {activeTab === 'api-keys' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">API Keys</h2>
                        <button
                          onClick={() => setShowApiKeyModal(true)}
                          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create API Key
                        </button>
                      </div>

                      <p className="text-secondary-300">
                        API keys allow your desktop applications to authenticate with Equators services.
                      </p>
                      
                      {apiKeys.length > 0 ? (
                        <div className="space-y-4">
                          {apiKeys.map((apiKey) => (
                            <div key={apiKey.keyId} className="bg-secondary-800/30 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-white">{apiKey.name}</h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-sm text-secondary-300">
                                      Created {formatDate(apiKey.createdAt)}
                                    </span>
                                    {apiKey.lastUsedAt && (
                                      <span className="text-sm text-secondary-300">
                                        Last used {formatDate(apiKey.lastUsedAt)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteApiKey(apiKey.keyId)}
                                  className="text-red-400 hover:text-red-300 p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Key className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                          <p className="text-secondary-300 mb-4">No API keys created yet</p>
                          <button
                            onClick={() => setShowApiKeyModal(true)}
                            className="btn-primary"
                          >
                            Create Your First API Key
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Sessions */}
                  {activeTab === 'sessions' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-white mb-4">Active Sessions</h2>
                      <p className="text-secondary-300">
                        Manage your active login sessions across different devices and browsers.
                      </p>
                      
                      {activeSessions.length > 0 ? (
                        <div className="space-y-4">
                          {activeSessions.map((session) => (
                            <div key={session._id} className="bg-secondary-800/30 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Monitor className="w-8 h-8 text-blue-400" />
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h3 className="font-medium text-white">
                                        {session.userAgent?.includes('Chrome') ? 'Chrome Browser' : 
                                         session.userAgent?.includes('Firefox') ? 'Firefox Browser' : 
                                         session.userAgent?.includes('Safari') ? 'Safari Browser' : 'Browser'}
                                      </h3>
                                      {session.current && (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <span className="text-sm text-secondary-300">
                                        {session.ipAddress}
                                      </span>
                                      {session.location && (
                                        <span className="text-sm text-secondary-300">
                                          {session.location.city}, {session.location.country}
                                        </span>
                                      )}
                                      <span className="text-sm text-secondary-300">
                                        Last active {formatDate(session.lastActive)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {!session.current && (
                                  <button
                                    onClick={() => setShowDeleteSessionConfirm(session._id)}
                                    className="text-red-400 hover:text-red-300 p-2"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Monitor className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                          <p className="text-secondary-300">No active sessions found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Button (shown for profile, privacy, notifications) */}
                  {(activeTab === 'profile' || activeTab === 'privacy' || activeTab === 'notifications') && (
                    <div className="pt-6 border-t border-secondary-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {saveStatus === 'success' && (
                            <div className="flex items-center text-green-400 text-sm">
                              <Check className="w-4 h-4 mr-1" />
                              Settings saved successfully
                            </div>
                          )}
                          {saveStatus === 'error' && (
                            <div className="flex items-center text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Failed to save settings
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleSaveSettings}
                          disabled={isSaving}
                          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Creation Modal */}
      {showApiKeyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-secondary-900 rounded-xl p-6 max-w-md w-full mx-4 border border-secondary-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Create API Key</h3>
              <button
                onClick={() => {
                  setShowApiKeyModal(false)
                  setGeneratedApiKey('')
                  setNewApiKeyName('')
                }}
                className="text-secondary-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedApiKey ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-400 mb-2">API Key Created</h4>
                  <p className="text-sm text-green-300 mb-3">
                    Copy this key now - it won&apos;t be shown again!
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-secondary-800 text-green-400 px-3 py-2 rounded text-sm font-mono">
                      {generatedApiKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(generatedApiKey)}
                      className="p-2 text-secondary-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false)
                    setGeneratedApiKey('')
                    setNewApiKeyName('')
                  }}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    className="w-full bg-secondary-800 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Desktop App Auth"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="flex-1 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateApiKey}
                    disabled={!newApiKeyName.trim()}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Create Key
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Session Termination Confirmation */}
      {showDeleteSessionConfirm && (
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
              <AlertCircle className="w-6 h-6 mr-2 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Terminate Session</h3>
            </div>
            <p className="text-secondary-300 mb-6">
              Are you sure you want to terminate this session? The user will be logged out from that device.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteSessionConfirm(null)}
                className="flex-1 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTerminateSession(showDeleteSessionConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Terminate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  )
}
