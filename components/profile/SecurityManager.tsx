import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Monitor, Trash2, AlertTriangle, Clock, MapPin, Smartphone, Chrome } from 'lucide-react'
import { useSessions, useProfile, useAccountDeletion } from '@/hooks/useProfile'

export default function SecurityManager() {
  const { profile } = useProfile()
  const { sessions, isLoading, terminateSession, isTerminating, actionError } = useSessions()
  const { deleteAccount, isDeleting, deleteError } = useAccountDeletion()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleTerminateSession = async (sessionToken: string) => {
    if (window.confirm('Are you sure you want to terminate this session?')) {
      try {
        await terminateSession(sessionToken)
      } catch (error) {
        console.error('Failed to terminate session:', error)
      }
    }
  }

  const handleTerminateAllSessions = async () => {
    if (window.confirm('Are you sure you want to terminate all other sessions? You will remain logged in on this device.')) {
      try {
        await terminateSession(undefined, true)
      } catch (error) {
        console.error('Failed to terminate sessions:', error)
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
      try {
        await deleteAccount()
        // Redirect to home page or show success message
        window.location.href = '/'
      } catch (error) {
        console.error('Failed to delete account:', error)
      }
    }
    setShowDeleteConfirm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return Monitor
    
    const device = deviceInfo.toLowerCase()
    if (device.includes('mobile') || device.includes('android') || device.includes('iphone')) {
      return Smartphone
    }
    return Monitor
  }

  const getBrowserIcon = (userAgent?: string) => {
    if (!userAgent) return Chrome
    // You could expand this to detect different browsers
    return Chrome
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="animate-pulse">
            <div className="h-4 bg-secondary-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-secondary-700 rounded"></div>
              <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Login History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center mb-6">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Recent Login Activity</h2>
        </div>

        <div className="space-y-3">
          {profile?.user?.loginHistory?.slice(0, 10).map((login, index) => {
            const DeviceIcon = getDeviceIcon(login.userAgent)
            const BrowserIcon = getBrowserIcon(login.userAgent)
            
            return (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 bg-secondary-800/30 border border-secondary-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <DeviceIcon className="w-4 h-4 text-secondary-400" />
                    <BrowserIcon className="w-4 h-4 text-secondary-400 ml-1" />
                  </div>
                  <div>
                    <p className="text-white text-sm">
                      Signed in via {login.provider}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-secondary-400">
                      <span>{formatDate(login.timestamp)}</span>
                      {login.ipAddress && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{login.ipAddress}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {index === 0 && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Current
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Active Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={handleTerminateAllSessions}
              disabled={isTerminating}
              className="btn-ghost text-red-400 hover:text-red-300 text-sm"
            >
              Terminate All Others
            </button>
          )}
        </div>

        {actionError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{actionError}</p>
          </div>
        )}

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-6">
              <Monitor className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
              <p className="text-secondary-400">No active sessions found</p>
            </div>
          ) : (
            sessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.deviceInfo)
              const isCurrentSession = index === 0 // Assume first session is current
              
              return (
                <div
                  key={session.sessionToken}
                  className="flex items-center justify-between py-3 px-4 bg-secondary-800/30 border border-secondary-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <DeviceIcon className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-white">
                          {session.deviceInfo || 'Unknown Device'}
                        </p>
                        {isCurrentSession && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-secondary-400">
                        <span>Last active: {formatDate(session.lastActiveAt)}</span>
                        {session.ipAddress && (
                          <>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{session.ipAddress}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!isCurrentSession && (
                    <button
                      onClick={() => handleTerminateSession(session.sessionToken)}
                      disabled={isTerminating}
                      className="btn-ghost text-red-400 hover:text-red-300 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center mb-6">
          <Shield className="w-5 h-5 mr-2 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Security Settings</h2>
        </div>

        <div className="space-y-4">
          {/* Account Information */}
          <div className="p-4 bg-secondary-800/30 border border-secondary-700 rounded-lg">
            <h3 className="text-white font-medium mb-2">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-400">Account Created:</span>
                <span className="text-white">{profile?.user?.createdAt ? formatDate(profile.user.createdAt) : 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-400">Last Login:</span>
                <span className="text-white">{profile?.user?.lastLoginAt ? formatDate(profile.user.lastLoginAt) : 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-400">Authentication Provider:</span>
                <span className="text-white capitalize">{profile?.user?.provider}</span>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-secondary-800/30 border border-secondary-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">{profile?.stats?.totalLogins || 0}</p>
              <p className="text-xs text-secondary-400">Total Logins</p>
            </div>
            <div className="p-3 bg-secondary-800/30 border border-secondary-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">{profile?.stats?.activeSessions || 0}</p>
              <p className="text-xs text-secondary-400">Active Sessions</p>
            </div>
            <div className="p-3 bg-secondary-800/30 border border-secondary-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-400">{profile?.stats?.apiKeys || 0}</p>
              <p className="text-xs text-secondary-400">API Keys</p>
            </div>
            <div className="p-3 bg-secondary-800/30 border border-secondary-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-400">{profile?.stats?.totalDownloads || 0}</p>
              <p className="text-xs text-secondary-400">Downloads</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card border-red-500/20"
      >
        <div className="flex items-center mb-6">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
          <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
        </div>

        {deleteError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{deleteError}</p>
          </div>
        )}

        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h3 className="text-red-400 font-medium mb-2">Delete Account</h3>
          <p className="text-red-300 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain. All your data, including 
            profile information, API keys, download history, and preferences will be permanently deleted.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-ghost border-red-500 text-red-400 hover:bg-red-500/20 text-sm"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-x-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
