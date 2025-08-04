import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Save, X, User, Mail, Phone, Calendar, ExternalLink } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'

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

interface ProfileCardProps {
  user: User
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const { updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    phone: user.phone || ''
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateProfile({
        fullName: formData.fullName,
        phone: formData.phone
      })
      
      if (result.success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName,
      phone: user.phone || ''
    })
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      className="bg-secondary-900/30 backdrop-blur-md rounded-2xl border border-blue-500/20 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
      }}
    >
      {/* Header with polygon pattern */}
      <div className="relative p-8 pb-6">
        {/* Glowing polygon background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <polygon
              points="50,50 150,30 250,80 350,60 380,120 320,170 220,180 120,160 80,110"
              fill="url(#polygonGradient)"
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="relative z-10 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-400">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Glowing ring effect */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-pulse"></div>
          </div>

          {/* Edit Button */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all duration-200 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-8 pb-8 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-300">
            <User className="w-4 h-4 mr-2" />
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-blue-500 focus:outline-none"
            />
          ) : (
            <p className="text-white font-medium text-lg">{user.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-300">
            <Mail className="w-4 h-4 mr-2" />
            Email Address
          </label>
          <div className="flex items-center space-x-2">
            <p className="text-white">{user.email}</p>
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              {user.authType}
            </span>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-300">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-blue-500 focus:outline-none"
            />
          ) : (
            <p className="text-white">{user.phone || 'Not provided'}</p>
          )}
        </div>

        {/* Account Created */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-300">
            <Calendar className="w-4 h-4 mr-2" />
            Member Since
          </label>
          <p className="text-white">{formatDate(user.createdAt)}</p>
        </div>

        {/* Hugging Face Status */}
        {user.huggingFace?.linked && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-secondary-300">
              <ExternalLink className="w-4 h-4 mr-2" />
              Hugging Face
            </label>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white">Connected as @{user.huggingFace.username}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-secondary-700/30">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">1</p>
            <p className="text-sm text-secondary-300">Active Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">0</p>
            <p className="text-sm text-secondary-300">Downloads</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
