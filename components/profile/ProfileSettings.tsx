import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Edit3, Save, X, Camera, Shield, Lock, CheckCircle, AlertTriangle, Eye, EyeOff, Globe, Users } from 'lucide-react'
import { useSettings, useSettingsUpdate } from '@/hooks/useSettings'
import { useSession } from 'next-auth/react'
import { isAdminEmail } from '@/lib/auth/admin-utils'

interface ProfileSettingsProps {
  onClose?: () => void
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { data: session } = useSession()
  const { settings, mutate, isLoading } = useSettings()
  const { updateSettings, isUpdating, updateError, updateSuccess, clearMessages } = useSettingsUpdate()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    theme: 'dark' as 'dark' | 'light' | 'system',
    language: 'en',
    profileVisibility: 'public' as 'public' | 'private',
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

  const isAdmin = session?.user?.email ? isAdminEmail(session.user.email) : false

  // Update form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        displayName: settings.displayName || '',
        bio: settings.bio || '',
        theme: settings.theme || 'dark',
        language: settings.language || 'en',
        profileVisibility: settings.profileVisibility || 'public',
        emailNotifications: settings.emailNotifications !== false,
        securityAlerts: settings.securityAlerts !== false,
        showEmail: settings.showEmail || false,
        showActivity: settings.showActivity !== false,
        privacy: {
          dataCollection: settings.privacy?.dataCollection || false,
          analytics: settings.privacy?.analytics || false,
          marketing: settings.privacy?.marketing || false
        }
      })
    }
  }, [settings])

  const handleSave = async () => {
    try {
      clearMessages()
      await updateSettings(formData)
      await mutate() // Refresh settings data
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const handleCancel = () => {
    if (settings) {
      setFormData({
        displayName: settings.displayName || '',
        bio: settings.bio || '',
        theme: settings.theme || 'dark',
        language: settings.language || 'en',
        profileVisibility: settings.profileVisibility || 'public',
        emailNotifications: settings.emailNotifications !== false,
        securityAlerts: settings.securityAlerts !== false,
        showEmail: settings.showEmail || false,
        showActivity: settings.showActivity !== false,
        privacy: {
          dataCollection: settings.privacy?.dataCollection || false,
          analytics: settings.privacy?.analytics || false,
          marketing: settings.privacy?.marketing || false
        }
      })
    }
    setIsEditing(false)
    clearMessages()
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-secondary-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-secondary-700 rounded"></div>
            <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <User className="w-5 h-5 mr-2 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          {isAdmin && (
            <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              Admin
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-ghost text-sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="btn-primary text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="btn-ghost text-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {updateSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center"
        >
          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
          <span className="text-green-400 text-sm">Settings saved successfully!</span>
        </motion.div>
      )}

      {updateError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
          <span className="text-red-400 text-sm">{updateError}</span>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="input w-full"
                  placeholder="Your display name"
                />
              ) : (
                <p className="text-white">{formData.displayName || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="text-white">{formData.bio || 'No bio provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme
              </label>
              {isEditing ? (
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              ) : (
                <p className="text-white capitalize">{formData.theme}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Visibility
              </label>
              {isEditing ? (
                <select
                  value={formData.profileVisibility}
                  onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              ) : (
                <div className="flex items-center">
                  {formData.profileVisibility === 'public' ? (
                    <Globe className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2 text-yellow-400" />
                  )}
                  <span className="text-white capitalize">{formData.profileVisibility}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                disabled={!isEditing}
                className="mr-3 rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-white">Email Notifications</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.securityAlerts}
                onChange={(e) => setFormData({ ...formData, securityAlerts: e.target.checked })}
                disabled={!isEditing}
                className="mr-3 rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-white">Security Alerts</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showEmail}
                onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                disabled={!isEditing}
                className="mr-3 rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-white">Show Email Publicly</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showActivity}
                onChange={(e) => setFormData({ ...formData, showActivity: e.target.checked })}
                disabled={!isEditing}
                className="mr-3 rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-white">Show Activity</span>
            </label>
          </div>
        </div>

        {/* Admin-only Privacy Settings */}
        {isAdmin && (
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Privacy Controls (Admin)
            </h3>
            <div className="space-y-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-3">
                Admin-only privacy settings for data governance
              </p>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.privacy.dataCollection}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    privacy: { ...formData.privacy, dataCollection: e.target.checked }
                  })}
                  disabled={!isEditing}
                  className="mr-3 rounded border-gray-600 text-green-400 focus:ring-green-400"
                />
                <span className="text-white">Enable Data Collection</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.privacy.analytics}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    privacy: { ...formData.privacy, analytics: e.target.checked }
                  })}
                  disabled={!isEditing}
                  className="mr-3 rounded border-gray-600 text-green-400 focus:ring-green-400"
                />
                <span className="text-white">Enable Analytics Tracking</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.privacy.marketing}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    privacy: { ...formData.privacy, marketing: e.target.checked }
                  })}
                  disabled={!isEditing}
                  className="mr-3 rounded border-gray-600 text-green-400 focus:ring-green-400"
                />
                <span className="text-white">Enable Marketing Communications</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
