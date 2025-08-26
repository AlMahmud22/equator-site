import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  LogOut, 
  User, 
  Shield, 
  Activity, 
  Clock,
  Globe,
  Monitor,
  Mail,
  ExternalLink,
  Edit,
  Save,
  X,
  GraduationCap,
  Users,
  Briefcase,
  Code,
  Heart
} from 'lucide-react'
import Layout from '@/components/Layout'

interface ProfileUpdateData {
  name?: string
  shortName?: string
  bio?: string
  company?: string
  location?: string
  role?: string
}

export default function ProfilePage() {
  const { data: session, status: sessionStatus, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    shortName: '',
    bio: '',
    company: '',
    location: '',
    role: 'student'
  })

  // Check if this is a new user (first login)
  const [isNewUser, setIsNewUser] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === 'loading') return
    
    if (sessionStatus === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to login page')
      router.push('/auth/login?callbackUrl=/profile')
      return
    }
    
    // User is authenticated, stop loading
    setIsLoading(false)
    
    // Check if this is a new user (no role set)
    if (session?.user && !(session.user as any).role) {
      setIsNewUser(true)
      setIsEditing(true)
    }
    
    // Initialize form data with current user info
    if (session?.user) {
      const user = session.user as any
      setFormData({
        name: user.name || '',
        shortName: user.shortName || '',
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        role: user.role || 'student'
      })
    }
  }, [sessionStatus, session, router])

  // Handle form input changes
  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Save profile updates
  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError('')
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        setIsNewUser(false)
        
        // Update the session to reflect changes
        await update()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred while updating your profile')
      console.error('Profile update error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Show loading spinner while checking authentication
  if (isLoading || sessionStatus === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-slate-300 mt-4">Loading profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Redirect if not authenticated (should be handled by useEffect, but safety check)
  if (!session?.user) {
    return null
  }

  const user = session.user as any
  const userInitials = user.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
    : user.email ? user.email[0].toUpperCase() : 'U'

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

  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || Heart

  return (
    <Layout>
      <Head>
        <title>Profile - Equators Tech</title>
        <meta name="description" content="Your profile information and account details" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Welcome Message for New Users */}
            {isNewUser && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8"
              >
                <h2 className="text-xl font-semibold text-blue-300 mb-2">
                  🎉 Welcome to Equators!
                </h2>
                <p className="text-blue-200">
                  Let&apos;s set up your profile to personalize your experience. You can always update this later.
                </p>
              </motion.div>
            )}

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 text-green-300 text-center"
              >
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User avatar'}
                        className="w-24 h-24 rounded-full border-4 border-purple-500/30"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-purple-500/30">
                        <span className="text-2xl font-bold text-white">{userInitials}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-slate-800"></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="text-2xl font-bold bg-slate-700 text-white rounded px-3 py-1 w-full"
                          placeholder="Your full name"
                        />
                        <input
                          type="text"
                          value={formData.shortName}
                          onChange={(e) => handleInputChange('shortName', e.target.value)}
                          className="text-lg bg-slate-700 text-slate-300 rounded px-3 py-1 w-full"
                          placeholder="Nickname or preferred name"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-white mb-2">
                          {user.shortName || user.name || 'Anonymous User'}
                        </h1>
                        {user.shortName && user.name !== user.shortName && (
                          <p className="text-slate-400 text-lg">({user.name})</p>
                        )}
                      </>
                    )}
                    
                    <p className="text-slate-300 text-lg mb-1">
                      {user.email}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-slate-400">Via {user.provider}</span>
                      </div>
                      
                      {!isEditing && user.role && (
                        <div className={`flex items-center space-x-2 ${roleColors[user.role as keyof typeof roleColors]}`}>
                          <RoleIcon className="w-4 h-4" />
                          <span className="capitalize">{user.role}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </button>
                      
                      {!isNewUser && (
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              {(isEditing || user.bio) && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 resize-none"
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                      maxLength={500}
                    />
                  ) : user.bio ? (
                    <p className="text-slate-300">{user.bio}</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-400" />
                  Personal Information
                </h2>

                <div className="space-y-4">
                  {/* Role Selection */}
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <RoleIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Role</span>
                    </div>
                    {isEditing ? (
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="employer">Employer</option>
                        <option value="developer">Developer</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <span className={`capitalize ${roleColors[user.role as keyof typeof roleColors]} flex items-center`}>
                        <RoleIcon className="w-4 h-4 mr-1" />
                        {user.role || 'Not set'}
                      </span>
                    )}
                  </div>

                  {/* Company */}
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Company</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm w-32"
                        placeholder="Your company"
                      />
                    ) : (
                      <span className="text-white">{user.company || 'Not specified'}</span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Location</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm w-32"
                        placeholder="Your location"
                      />
                    ) : (
                      <span className="text-white">{user.location || 'Not specified'}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Email</span>
                    </div>
                    <span className="text-white">{user.email}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Status</span>
                    </div>
                    <span className="text-green-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Account Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-400" />
                  Account Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Provider</span>
                    </div>
                    <span className="text-white capitalize">{user.provider}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Session Type</span>
                    </div>
                    <span className="text-white">Cookie-based</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Member Since</span>
                    </div>
                    <span className="text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Security</span>
                    </div>
                    <span className="text-green-400">Verified</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mt-8"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-purple-400" />
                Quick Actions
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/products')}
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <Code className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Browse Products</div>
                    <div className="text-slate-400 text-sm">Discover our tools</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <User className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Settings</div>
                    <div className="text-slate-400 text-sm">Manage preferences</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <Globe className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Back to Home</div>
                    <div className="text-slate-400 text-sm">Return to main site</div>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Debug Information (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mt-8"
              >
                <h3 className="text-lg font-semibold text-slate-300 mb-4">
                  Debug Information (Development)
                </h3>
                <pre className="bg-slate-900/50 p-4 rounded-lg text-xs text-slate-300 overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
