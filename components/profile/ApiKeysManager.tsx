import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Plus, Trash2, Copy, EyeOff, Calendar, Shield, CheckCircle } from 'lucide-react'
import { useApiKeys } from '@/hooks/useProfile'

export default function ApiKeysManager() {
  const { apiKeys, isLoading, createApiKey, deleteApiKey, isCreating, isDeleting, actionError } = useApiKeys()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'],
    expiresInDays: 90
  })

  const handleCreateKey = async () => {
    try {
      const newKey = await createApiKey(formData)
      setShowNewKey(newKey.apiKey)
      setShowCreateForm(false)
      setFormData({ name: '', permissions: ['read'], expiresInDays: 90 })
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await deleteApiKey(keyId)
      } catch (error) {
        console.error('Failed to delete API key:', error)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Clipboard copy successful (silent in production)
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getExpirationStatus = (expiresAt?: string) => {
    if (!expiresAt) return { status: 'never', color: 'text-green-400', text: 'Never expires' }
    
    const expDate = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiration < 0) {
      return { status: 'expired', color: 'text-red-400', text: 'Expired' }
    } else if (daysUntilExpiration < 7) {
      return { status: 'expiring', color: 'text-yellow-400', text: `Expires in ${daysUntilExpiration} days` }
    } else {
      return { status: 'active', color: 'text-green-400', text: `Expires ${formatDate(expiresAt)}` }
    }
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
          <Key className="w-5 h-5 mr-2 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">API Keys</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary text-sm"
          disabled={isCreating}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Key
        </button>
      </div>

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{actionError}</p>
        </div>
      )}

      {/* New Key Display */}
      <AnimatePresence>
        {showNewKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <h3 className="text-green-400 font-semibold">API Key Created Successfully</h3>
            </div>
            <p className="text-green-300 text-sm mb-3">
              Please copy this key now. You won&apos;t be able to see it again.
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-secondary-800 rounded px-3 py-2 text-green-400 font-mono text-sm break-all">
                {showNewKey}
              </code>
              <button
                onClick={() => copyToClipboard(showNewKey)}
                className="btn-ghost text-sm"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowNewKey(null)}
                className="btn-ghost text-sm"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary-800/50 border border-secondary-700 rounded-lg p-4 mb-6"
          >
            <h3 className="text-white font-semibold mb-4">Create New API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Desktop App, Mobile Client, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {['read', 'write', 'delete', 'admin'].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissions: [...formData.permissions, permission]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              permissions: formData.permissions.filter(p => p !== permission)
                            })
                          }
                        }}
                        className="w-4 h-4 text-purple-500 bg-secondary-800 border-secondary-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="ml-2 text-white capitalize">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Expires In (Days)
                </label>
                <select
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                  <option value={0}>Never expires</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleCreateKey}
                  disabled={isCreating || !formData.name.trim()}
                  className="btn-primary text-sm"
                >
                  {isCreating ? 'Creating...' : 'Create Key'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
            <p className="text-secondary-400">No API keys created yet</p>
            <p className="text-secondary-500 text-sm">Create your first API key to access the equator API</p>
          </div>
        ) : (
          apiKeys.map((apiKey) => {
            const expirationStatus = getExpirationStatus(apiKey.expiresAt)
            
            return (
              <motion.div
                key={apiKey.keyId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-secondary-800/30 border border-secondary-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-white font-medium">{apiKey.name}</h3>
                      <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                        {apiKey.keyId}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-400">
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        <span>{apiKey.permissions.join(', ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Created {formatDate(apiKey.createdAt)}</span>
                      </div>
                      <span className={expirationStatus.color}>
                        {expirationStatus.text}
                      </span>
                    </div>
                    
                    {apiKey.lastUsedAt && (
                      <p className="text-xs text-secondary-500 mt-1">
                        Last used: {formatDate(apiKey.lastUsedAt)}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteKey(apiKey.keyId)}
                    disabled={isDeleting}
                    className="btn-ghost text-red-400 hover:text-red-300 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {apiKeys.length > 0 && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> Keep your API keys secure. They provide access to your account and should be treated like passwords.
          </p>
        </div>
      )}
    </motion.div>
  )
}
