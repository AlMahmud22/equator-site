import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Save,
  Check,
  AlertCircle,
  Copy,
  Trash2,
  Plus,
  Eye,
  Monitor,
  Globe,
  Users,
  Briefcase,
  GraduationCap,
  Code,
  Heart
} from 'lucide-react'
import Layout from '@/components/Layout'

interface SettingsData {
  profile: {
    name: string
    shortName: string
    bio: string
    company: string
    location: string
    role: string
    email: string
    image: string
  }
  privacy?: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showActivity: boolean
  }
  notifications: {
    newsletter: boolean
    notifications: boolean
    securityAlerts: boolean
    loginAlerts: boolean
  }
  security: {
    twoFactorEnabled: boolean
    lastLoginAt: string
    loginHistory: Array<{
      timestamp: string
      provider: string
      ipAddress?: string
    }>
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
  }
  apiKeys?: Array<{
    keyId: string
    name: string
    permissions: string[]
    createdAt: string
    lastUsedAt?: string
    expiresAt?: string
    isActive: boolean
  }>
  sessions?: Array<{
    sessionToken: string
    deviceInfo?: any
    createdAt: string
    lastActiveAt: string
    isActive: boolean
  }>
  isAdmin: boolean
}

const roleIcons = {
  student: GraduationCap,
  teacher: Users,
  employer: Briefcase,
  developer: Code,
  other: Heart
}

const roleColors = {
  student: 'text-blue-400',
  teacher: 'text-green-400',
  employer: 'text-purple-400',
  developer: 'text-orange-400',
  other: 'text-pink-400'
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // API Keys management
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: ['read'] })
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false)
  const [showNewApiKey, setShowNewApiKey] = useState<string | null>(null)

  const { status } = useSession()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/settings')
      return
    }
  }, [status, router])

  // Load settings
  useEffect(() => {
    if (status === 'authenticated') {
      loadSettings()
    }
  }, [status])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
      } else {
        setError(data.message || 'Failed to load settings')
      }
    } catch (err) {
      setError('Failed to load settings')
      console.error('Settings load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (section: string, updates: any) => {
    try {
      setIsSaving(true)
      setError('')
      
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ [section]: updates })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`)
        await loadSettings() // Reload to get updated data
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || `Failed to save ${section} settings`)
      }
    } catch (err) {
      setError(`Failed to save ${section} settings`)
      console.error(`${section} save error:`, err)
    } finally {
      setIsSaving(false)
    }
  }

  const createApiKey = async () => {
    try {
      setIsCreatingApiKey(true)
      const response = await fetch('/api/profile/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newApiKey)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowNewApiKey(data.data.apiKey)
        setNewApiKey({ name: '', permissions: ['read'] })
        await loadSettings()
      } else {
        setError(data.message || 'Failed to create API key')
      }
    } catch (err) {
      setError('Failed to create API key')
      console.error('API key creation error:', err)
    } finally {
      setIsCreatingApiKey(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/profile/api-keys?keyId=${keyId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadSettings()
        setSuccess('API key deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to delete API key')
      }
    } catch (err) {
      setError('Failed to delete API key')
      console.error('API key deletion error:', err)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Loading Settings...">
        <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
            <p className="text-secondary-300 mt-4">Loading settings...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!settings) {
    return (
      <Layout title="Error Loading Settings">
        <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Settings</h2>
            <p className="text-secondary-300">{error || 'Failed to load settings'}</p>
            <button 
              onClick={loadSettings}
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    ...(settings.isAdmin ? [{ id: 'privacy', label: 'Privacy', icon: Eye }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    ...(settings.isAdmin ? [{ id: 'apikeys', label: 'API Keys', icon: Key }] : [])
  ]

  return (
    <Layout
      title={`Settings - ${settings.isAdmin ? 'Admin' : 'User'} Dashboard`}
      description="Manage your profile settings, privacy, notifications, and security"
    >
      <Head>
        <meta property="og:title" content="Settings - equator" />
        <meta property="og:description" content="Manage your profile and account settings" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 py-12">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              {settings.isAdmin ? 'Admin' : 'User'} Settings
            </h1>
            <p className="text-secondary-300 text-lg">
              Manage your account preferences and security settings
            </p>
            {settings.isAdmin && (
              <div className="inline-flex items-center px-3 py-1 bg-primary-600/20 border border-primary-500/30 rounded-full text-primary-400 text-sm mt-2">
                <Shield className="w-4 h-4 mr-2" />
                Administrator Access
              </div>
            )}
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400 text-center mb-6"
            >
              <Check className="w-5 h-5 inline mr-2" />
              {success}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                            : 'text-secondary-300 hover:text-white hover:bg-secondary-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="card p-8"
              >
                {/* Profile Section */}
                {activeTab === 'profile' && (
                  <ProfileSection 
                    settings={settings} 
                    onSave={(updates: any) => saveSettings('profile', updates)}
                    isSaving={isSaving}
                  />
                )}

                {/* Privacy Section (Admin Only) */}
                {activeTab === 'privacy' && settings.isAdmin && (
                  <PrivacySection 
                    settings={settings} 
                    onSave={(updates: any) => saveSettings('privacy', updates)}
                    isSaving={isSaving}
                  />
                )}

                {/* Notifications Section */}
                {activeTab === 'notifications' && (
                  <NotificationsSection 
                    settings={settings} 
                    onSave={(updates: any) => saveSettings('notifications', updates)}
                    isSaving={isSaving}
                  />
                )}

                {/* Security Section */}
                {activeTab === 'security' && (
                  <SecuritySection 
                    settings={settings} 
                    onSave={(updates: any) => saveSettings('security', updates)}
                    isSaving={isSaving}
                  />
                )}

                {/* API Keys Section (Admin Only) */}
                {activeTab === 'apikeys' && settings.isAdmin && (
                  <ApiKeysSection 
                    settings={settings}
                    newApiKey={newApiKey}
                    setNewApiKey={setNewApiKey}
                    isCreatingApiKey={isCreatingApiKey}
                    showNewApiKey={showNewApiKey}
                    setShowNewApiKey={setShowNewApiKey}
                    onCreateApiKey={createApiKey}
                    onDeleteApiKey={deleteApiKey}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Profile Section Component
function ProfileSection({ settings, onSave, isSaving }: any) {
  const [formData, setFormData] = useState({
    name: settings.profile.name || '',
    shortName: settings.profile.shortName || '',
    bio: settings.profile.bio || '',
    company: settings.profile.company || '',
    location: settings.profile.location || '',
    role: settings.profile.role || 'student'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const roleOptions = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'teacher', label: 'Teacher', icon: Users },
    { value: 'employer', label: 'Employer', icon: Briefcase },
    { value: 'developer', label: 'Developer', icon: Code },
    { value: 'other', label: 'Other', icon: Heart }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary-300 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-secondary-300 text-sm font-medium mb-2">
              Preferred Name
            </label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              className="input-field"
              placeholder="How should we call you?"
            />
          </div>
        </div>

        <div>
          <label className="block text-secondary-300 text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="input-field h-24 resize-none"
            placeholder="Tell us about yourself..."
            maxLength={500}
          />
          <div className="text-xs text-secondary-400 mt-1">
            {formData.bio.length}/500 characters
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary-300 text-sm font-medium mb-2">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="input-field"
              placeholder="Your company or organization"
            />
          </div>
          
          <div>
            <label className="block text-secondary-300 text-sm font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <label className="block text-secondary-300 text-sm font-medium mb-3">
            Role
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roleOptions.map((option) => {
              const Icon = option.icon
              const isSelected = formData.role === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: option.value })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-600/20 text-primary-400'
                      : 'border-secondary-700 bg-secondary-800/50 text-secondary-300 hover:border-secondary-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${roleColors[option.value as keyof typeof roleColors]}`} />
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Privacy Section Component (Admin Only)
function PrivacySection({ settings, onSave, isSaving }: any) {
  const [formData, setFormData] = useState({
    profileVisibility: settings.privacy?.profileVisibility || 'public',
    showEmail: settings.privacy?.showEmail || false,
    showActivity: settings.privacy?.showActivity || true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-secondary-300 text-sm font-medium mb-3">
            Profile Visibility
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="public"
                checked={formData.profileVisibility === 'public'}
                onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.value as any })}
                className="mr-3 text-primary-600"
              />
              <div>
                <div className="text-white font-medium">Public</div>
                <div className="text-secondary-400 text-sm">Anyone can view your profile</div>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="private"
                checked={formData.profileVisibility === 'private'}
                onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.value as any })}
                className="mr-3 text-primary-600"
              />
              <div>
                <div className="text-white font-medium">Private</div>
                <div className="text-secondary-400 text-sm">Only you can view your profile</div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Show Email Address</div>
              <div className="text-secondary-400 text-sm">Display your email on your public profile</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.showEmail}
                onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Show Activity</div>
              <div className="text-secondary-400 text-sm">Display your login history and downloads</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.showActivity}
                onChange={(e) => setFormData({ ...formData, showActivity: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Notifications Section Component
function NotificationsSection({ settings, onSave, isSaving }: any) {
  const [formData, setFormData] = useState({
    newsletter: settings.notifications?.newsletter || false,
    notifications: settings.notifications?.notifications !== false,
    securityAlerts: settings.notifications?.securityAlerts !== false,
    loginAlerts: settings.notifications?.loginAlerts !== false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Newsletter</div>
              <div className="text-secondary-400 text-sm">Receive updates about new features and products</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.newsletter}
                onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">General Notifications</div>
              <div className="text-secondary-400 text-sm">Receive notifications about your account activity</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Security Alerts</div>
              <div className="text-secondary-400 text-sm">Get notified about important security events</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.securityAlerts}
                onChange={(e) => setFormData({ ...formData, securityAlerts: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Login Alerts</div>
              <div className="text-secondary-400 text-sm">Get notified when someone logs into your account</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.loginAlerts}
                onChange={(e) => setFormData({ ...formData, loginAlerts: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Security Section Component
function SecuritySection({ settings, onSave, isSaving }: any) {
  const [formData, setFormData] = useState({
    twoFactorEnabled: settings.security?.twoFactorEnabled || false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Two-Factor Authentication</div>
              <div className="text-secondary-400 text-sm">Add an extra layer of security to your account</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.twoFactorEnabled}
                onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="bg-secondary-800/50 border border-secondary-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Recent Login Activity</h3>
          <div className="space-y-2">
            {settings.security.loginHistory.slice(0, 5).map((login: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-secondary-300">
                  {new Date(login.timestamp).toLocaleString()}
                </span>
                <span className="text-secondary-400">
                  {login.provider} {login.ipAddress && `• ${login.ipAddress}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// API Keys Section Component (Admin Only)
function ApiKeysSection({ 
  settings, 
  newApiKey, 
  setNewApiKey, 
  isCreatingApiKey, 
  showNewApiKey, 
  setShowNewApiKey,
  onCreateApiKey, 
  onDeleteApiKey 
}: any) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">API Key Management</h2>
      
      {/* Create New API Key */}
      <div className="bg-secondary-800/50 border border-secondary-700 rounded-lg p-6 mb-6">
        <h3 className="text-white font-medium mb-4">Create New API Key</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-secondary-300 text-sm font-medium mb-2">
              Key Name
            </label>
            <input
              type="text"
              value={newApiKey.name}
              onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Production API, Test Key"
            />
          </div>
          <div>
            <label className="block text-secondary-300 text-sm font-medium mb-2">
              Permissions
            </label>
            <select
              value={newApiKey.permissions[0]}
              onChange={(e) => setNewApiKey({ ...newApiKey, permissions: [e.target.value] })}
              className="input-field"
            >
              <option value="read">Read Only</option>
              <option value="write">Read & Write</option>
              <option value="admin">Full Access</option>
            </select>
          </div>
        </div>
        <button
          onClick={onCreateApiKey}
          disabled={isCreatingApiKey || !newApiKey.name.trim()}
          className="btn-primary"
        >
          {isCreatingApiKey ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </>
          )}
        </button>
      </div>

      {/* Show New API Key */}
      {showNewApiKey && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-6"
        >
          <h3 className="text-green-400 font-medium mb-4">API Key Created Successfully!</h3>
          <div className="bg-secondary-900 border border-secondary-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-green-400 font-mono text-sm">{showNewApiKey}</code>
              <button
                onClick={() => copyToClipboard(showNewApiKey)}
                className="btn-secondary text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
          </div>
          <p className="text-green-300 text-sm">
            Please copy and save this API key now. You won&apos;t be able to see it again.
          </p>
          <button
            onClick={() => setShowNewApiKey(null)}
            className="mt-4 btn-secondary"
          >
            I&apos;ve saved the key
          </button>
        </motion.div>
      )}

      {/* Existing API Keys */}
      <div>
        <h3 className="text-white font-medium mb-4">Your API Keys</h3>
        {settings.apiKeys && settings.apiKeys.length > 0 ? (
          <div className="space-y-4">
            {settings.apiKeys.map((key: any) => (
              <div key={key.keyId} className="bg-secondary-800/50 border border-secondary-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{key.name}</h4>
                    <p className="text-secondary-400 text-sm">
                      Created {new Date(key.createdAt).toLocaleDateString()} • 
                      Permissions: {key.permissions.join(', ')} • 
                      ID: {key.keyId}
                    </p>
                    {key.lastUsedAt && (
                      <p className="text-secondary-500 text-xs">
                        Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteApiKey(key.keyId)}
                    className="btn-secondary text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
      </div>
    </div>
  )
}
