import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Edit3, Save, X, Camera, Shield, Lock } from 'lucide-react'
import { useProfile, useProfileUpdate } from '@/hooks/useProfile'

interface ProfileSettingsProps {
  onClose?: () => void
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { profile, mutate } = useProfile()
  const { updateProfile, isUpdating, updateError } = useProfileUpdate()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: profile?.user?.displayName || profile?.user?.name || '',
    bio: profile?.user?.bio || '',
    preferences: {
      theme: profile?.user?.preferences?.theme || 'dark',
      newsletter: profile?.user?.preferences?.newsletter || false,
      notifications: profile?.user?.preferences?.notifications !== false,
      privacy: {
        showEmail: profile?.user?.preferences?.privacy?.showEmail || false,
        showActivity: profile?.user?.preferences?.privacy?.showActivity !== false
      }
    }
  })

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      await mutate() // Refresh profile data
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: profile?.user?.displayName || profile?.user?.name || '',
      bio: profile?.user?.bio || '',
      preferences: {
        theme: profile?.user?.preferences?.theme || 'dark',
        newsletter: profile?.user?.preferences?.newsletter || false,
        notifications: profile?.user?.preferences?.notifications !== false,
        privacy: {
          showEmail: profile?.user?.preferences?.privacy?.showEmail || false,
          showActivity: profile?.user?.preferences?.privacy?.showActivity !== false
        }
      }
    })
    setIsEditing(false)
  }

  if (!profile) {
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
            <button onClick={onClose} className="btn-ghost text-sm">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {updateError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{updateError}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profile.user.image ? (
              <img 
                src={profile.user.image} 
                alt={profile.user.name}
                className="w-20 h-20 rounded-full border-2 border-green-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold text-2xl">
                {profile.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{profile.user.name}</h3>
            <p className="text-secondary-300">{profile.user.email}</p>
            <div className="flex items-center mt-1">
              <Shield className="w-4 h-4 mr-1 text-green-400" />
              <span className="text-sm text-green-400 capitalize">{profile.user.provider} Account</span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-green-500 focus:outline-none"
                placeholder="Your display name"
              />
            ) : (
              <p className="text-white">{profile.user.displayName || profile.user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Email Address
            </label>
            <p className="text-white">{profile.user.email}</p>
            <p className="text-xs text-secondary-400 mt-1">Managed by {profile.user.provider}</p>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-green-500 focus:outline-none resize-none"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
          ) : (
            <p className="text-white">{profile.user.bio || 'No bio added yet.'}</p>
          )}
          {isEditing && (
            <p className="text-xs text-secondary-400 mt-1">
              {formData.bio.length}/500 characters
            </p>
          )}
        </div>

        {/* Preferences */}
        <div className="border-t border-secondary-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
          
          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Theme Preference
              </label>
              {isEditing ? (
                <select
                  value={formData.preferences.theme}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      theme: e.target.value as 'dark' | 'light' | 'system'
                    }
                  })}
                  className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              ) : (
                <p className="text-white capitalize">{profile.user.preferences.theme}</p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.newsletter}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      newsletter: e.target.checked
                    }
                  })}
                  disabled={!isEditing}
                  className="w-4 h-4 text-green-500 bg-secondary-800 border-secondary-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="ml-2 text-white">Subscribe to newsletter</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      notifications: e.target.checked
                    }
                  })}
                  disabled={!isEditing}
                  className="w-4 h-4 text-green-500 bg-secondary-800 border-secondary-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="ml-2 text-white">Enable notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="border-t border-secondary-700 pt-6">
          <div className="flex items-center mb-4">
            <Lock className="w-5 h-5 mr-2 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.privacy.showEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    privacy: {
                      ...formData.preferences.privacy,
                      showEmail: e.target.checked
                    }
                  }
                })}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-500 bg-secondary-800 border-secondary-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-white">Make email address public</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.privacy.showActivity}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    privacy: {
                      ...formData.preferences.privacy,
                      showActivity: e.target.checked
                    }
                  }
                })}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-500 bg-secondary-800 border-secondary-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-white">Show activity publicly</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
