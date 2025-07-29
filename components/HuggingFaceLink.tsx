import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Link as LinkIcon, X, Eye, EyeOff, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface User {
  _id: string
  fullName: string
  email: string
  authType: 'email' | 'google' | 'github'
  avatar?: string
  phone?: string
  firstLogin: boolean
  huggingFace?: {
    linked: boolean
    username?: string
    linkedAt?: string
    fullName?: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
  preferences?: {
    newsletter: boolean
    notifications: boolean
  }
}

interface HuggingFaceLinkProps {
  user: User
  showFirstLoginModal?: boolean
}

export default function HuggingFaceLink({ user }: HuggingFaceLinkProps) {
  const { linkHuggingFace } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shouldPulse, setShouldPulse] = useState(false)

  // Auto-pulse animation every 3 seconds if not linked
  useEffect(() => {
    if (!user.huggingFace?.linked) {
      const interval = setInterval(() => {
        setShouldPulse(true)
        setTimeout(() => setShouldPulse(false), 1000)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [user.huggingFace?.linked])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await linkHuggingFace(token.trim())
      
      if (result.success) {
        setSuccess(`Successfully linked to @${result.username}!`)
        setToken('')
        setTimeout(() => {
          setShowModal(false)
          setSuccess('')
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Link Hugging Face error:', error)
      setError('Failed to link Hugging Face account')
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setShowModal(true)
    setError('')
    setSuccess('')
    setToken('')
  }

  const closeModal = () => {
    setShowModal(false)
    setError('')
    setSuccess('')
    setToken('')
  }

  return (
    <>
      <div id="hf-section" className="space-y-6">
        {/* Main Card */}
        <motion.div
          className={`bg-secondary-900/30 backdrop-blur-md rounded-2xl border border-orange-500/20 p-8 transition-all duration-300 ${
            shouldPulse ? 'shadow-lg shadow-orange-500/20 border-orange-500/40' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🤗</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Hugging Face</h2>
                <p className="text-sm text-secondary-300">AI Model Hub Integration</p>
              </div>
            </div>
            
            {user.huggingFace?.linked && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            )}
          </div>

          {user.huggingFace?.linked ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {user.huggingFace.avatarUrl ? (
                    <img
                      src={user.huggingFace.avatarUrl}
                      alt={user.huggingFace.username}
                      className="w-12 h-12 rounded-full border-2 border-green-400/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">
                        {user.huggingFace.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">@{user.huggingFace.username}</p>
                    <p className="text-sm text-secondary-300">
                      {user.huggingFace.fullName || 'Hugging Face User'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary-800/30 rounded-lg p-4 text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-300">Enhanced Models</p>
                  <p className="text-lg font-bold text-white">Unlocked</p>
                </div>
                <div className="bg-secondary-800/30 rounded-lg p-4 text-center">
                  <ExternalLink className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-300">Direct Access</p>
                  <p className="text-lg font-bold text-white">Enabled</p>
                </div>
              </div>

              <a
                href={`https://huggingface.co/${user.huggingFace.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Hugging Face Profile</span>
              </a>
            </div>
          ) : (
            /* Not Connected State */
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full ${
                    shouldPulse ? 'animate-pulse' : ''
                  }`}
                >
                  <LinkIcon className="w-8 h-8 text-white" />
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Connect Your Hugging Face Account</h3>
                  <p className="text-secondary-300">
                    Unlock enhanced AI models and seamless integration with your HF workflows
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary-800/30 rounded-lg p-4">
                  <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="text-sm font-medium text-white">Premium Models</p>
                  <p className="text-xs text-secondary-400">Access to gated and premium models</p>
                </div>
                <div className="bg-secondary-800/30 rounded-lg p-4">
                  <ExternalLink className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-sm font-medium text-white">Direct Integration</p>
                  <p className="text-xs text-secondary-400">Seamless model downloads and updates</p>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={openModal}
                className={`w-full btn-primary py-4 text-lg font-semibold transition-all duration-300 ${
                  shouldPulse ? 'shadow-lg shadow-orange-500/30' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LinkIcon className="w-5 h-5 mr-2" />
                Connect Hugging Face
              </motion.button>

              {/* Disclaimer */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Privacy & Security</p>
                    <p className="text-blue-200/80">
                      Your Hugging Face token is encrypted and stored securely. We only use it to authenticate 
                      API requests on your behalf. You can disconnect at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Connection Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-secondary-900/95 backdrop-blur-md rounded-2xl border border-secondary-700/50 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Connect Hugging Face</h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-secondary-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Hugging Face Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="hf_..."
                      className="w-full px-4 py-3 pr-12 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-white transition-colors"
                    >
                      {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-secondary-400 mt-2">
                    Get your token from{' '}
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Hugging Face Settings
                    </a>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-400">{success}</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 text-secondary-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !token.trim()}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
