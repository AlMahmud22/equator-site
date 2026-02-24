import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  Monitor,
  Smartphone,
  Globe,
  Server,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Clock,
  Users,
  Key,
  Activity,
  Settings,
  RefreshCw,
  Copy,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Layout from '@/components/Layout'

interface RegisteredApp {
  _id: string
  clientId: string
  clientSecret: string
  name: string
  description: string
  appType: 'desktop' | 'mobile' | 'web' | 'api'
  platform?: string
  version?: string
  redirectUris: string[]
  scopes: string[]
  isActive: boolean
  isApproved: boolean
  isConfidential: boolean
  requiresPKCE: boolean
  allowedOrigins?: string[]
  webhookUrl?: string
  iconUrl?: string
  websiteUrl?: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  contact: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  stats: {
    totalTokensIssued: number
    totalUsersAuthorized: number
    totalAuthRequests: number
    totalActiveTokens: number
    lastUsedAt?: string
    averageDailyUsers: number
    lastWeekActiveUsers: number
  }
  security: {
    allowedIPs?: string[]
    rateLimitPerHour: number
    maxTokenLifetime: number
    requireSecureRedirect: boolean
  }
}

interface AppFormData {
  name: string
  description: string
  appType: 'desktop' | 'mobile' | 'web' | 'api'
  platform: string
  version: string
  redirectUris: string[]
  scopes: string[]
  isConfidential: boolean
  requiresPKCE: boolean
  allowedOrigins: string[]
  webhookUrl: string
  iconUrl: string
  websiteUrl: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  contactName: string
  contactEmail: string
  allowedIPs: string[]
  rateLimitPerHour: number
  maxTokenLifetime: number
  requireSecureRedirect: boolean
}

const defaultFormData: AppFormData = {
  name: '',
  description: '',
  appType: 'desktop',
  platform: '',
  version: '1.0.0',
  redirectUris: [''],
  scopes: ['read', 'profile'],
  isConfidential: true,
  requiresPKCE: true,
  allowedOrigins: [''],
  webhookUrl: '',
  iconUrl: '',
  websiteUrl: '',
  privacyPolicyUrl: '',
  termsOfServiceUrl: '',
  contactName: '',
  contactEmail: '',
  allowedIPs: [],
  rateLimitPerHour: 1000,
  maxTokenLifetime: 3600,
  requireSecureRedirect: true
}

export default function AppManagementDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [apps, setApps] = useState<RegisteredApp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingApp, setEditingApp] = useState<string | null>(null)
  const [formData, setFormData] = useState<AppFormData>(defaultFormData)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')
  const [filterType, setFilterType] = useState<'all' | 'desktop' | 'mobile' | 'web' | 'api'>('all')
  const [selectedApp, setSelectedApp] = useState<RegisteredApp | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      checkAdminStatus()
    }
  }, [session, status])

  useEffect(() => {
    if (isAdmin) {
      loadApps()
    }
  }, [isAdmin])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/user/permissions')
      if (response.ok) {
        const data = await response.json()
        const adminStatus = data.isAdmin || false
        setIsAdmin(adminStatus)
        
        if (!adminStatus) {
          router.push('/profile')
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/profile')
    }
  }

  const loadApps = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/apps/manage')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApps(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading apps:', error)
      showNotification('error', 'Failed to load apps')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleCreateApp = async () => {
    try {
      const payload = {
        ...formData,
        redirectUris: formData.redirectUris.filter(uri => uri.trim()),
        allowedOrigins: formData.allowedOrigins.filter(origin => origin.trim()),
        allowedIPs: formData.allowedIPs.filter(ip => ip.trim()),
        contact: {
          name: formData.contactName,
          email: formData.contactEmail
        },
        security: {
          allowedIPs: formData.allowedIPs.filter(ip => ip.trim()),
          rateLimitPerHour: formData.rateLimitPerHour,
          maxTokenLifetime: formData.maxTokenLifetime,
          requireSecureRedirect: formData.requireSecureRedirect
        }
      }

      const response = await fetch('/api/apps/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApps([...apps, data.data])
          setShowCreateForm(false)
          setFormData(defaultFormData)
          showNotification('success', 'App registered successfully')
        }
      } else {
        const error = await response.json()
        showNotification('error', error.message || 'Failed to create app')
      }
    } catch (error) {
      console.error('Error creating app:', error)
      showNotification('error', 'Failed to create app')
    }
  }

  const handleUpdateApp = async (appId: string) => {
    try {
      const payload = {
        ...formData,
        redirectUris: formData.redirectUris.filter(uri => uri.trim()),
        allowedOrigins: formData.allowedOrigins.filter(origin => origin.trim()),
        allowedIPs: formData.allowedIPs.filter(ip => ip.trim()),
        contact: {
          name: formData.contactName,
          email: formData.contactEmail
        },
        security: {
          allowedIPs: formData.allowedIPs.filter(ip => ip.trim()),
          rateLimitPerHour: formData.rateLimitPerHour,
          maxTokenLifetime: formData.maxTokenLifetime,
          requireSecureRedirect: formData.requireSecureRedirect
        }
      }

      const response = await fetch('/api/apps/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, ...payload })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApps(apps.map(app => app._id === appId ? data.data : app))
          setEditingApp(null)
          setFormData(defaultFormData)
          showNotification('success', 'App updated successfully')
        }
      } else {
        const error = await response.json()
        showNotification('error', error.message || 'Failed to update app')
      }
    } catch (error) {
      console.error('Error updating app:', error)
      showNotification('error', 'Failed to update app')
    }
  }

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/apps/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId })
      })

      if (response.ok) {
        setApps(apps.filter(app => app._id !== appId))
        showNotification('success', 'App deleted successfully')
      } else {
        const error = await response.json()
        showNotification('error', error.message || 'Failed to delete app')
      }
    } catch (error) {
      console.error('Error deleting app:', error)
      showNotification('error', 'Failed to delete app')
    }
  }

  const handleToggleAppStatus = async (appId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/apps/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, isActive: !currentStatus })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApps(apps.map(app => app._id === appId ? { ...app, isActive: !currentStatus } : app))
          showNotification('success', `App ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        }
      }
    } catch (error) {
      console.error('Error toggling app status:', error)
      showNotification('error', 'Failed to update app status')
    }
  }

  const handleApproveApp = async (appId: string) => {
    try {
      const response = await fetch('/api/apps/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, isApproved: true })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApps(apps.map(app => app._id === appId ? { ...app, isApproved: true } : app))
          showNotification('success', 'App approved successfully')
        }
      }
    } catch (error) {
      console.error('Error approving app:', error)
      showNotification('error', 'Failed to approve app')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showNotification('info', 'Copied to clipboard')
  }

  const startEditing = (app: RegisteredApp) => {
    setEditingApp(app._id)
    setFormData({
      name: app.name,
      description: app.description,
      appType: app.appType,
      platform: app.platform || '',
      version: app.version || '1.0.0',
      redirectUris: app.redirectUris,
      scopes: app.scopes,
      isConfidential: app.isConfidential,
      requiresPKCE: app.requiresPKCE,
      allowedOrigins: app.allowedOrigins || [''],
      webhookUrl: app.webhookUrl || '',
      iconUrl: app.iconUrl || '',
      websiteUrl: app.websiteUrl || '',
      privacyPolicyUrl: app.privacyPolicyUrl || '',
      termsOfServiceUrl: app.termsOfServiceUrl || '',
      contactName: app.contact.name,
      contactEmail: app.contact.email,
      allowedIPs: app.security.allowedIPs || [],
      rateLimitPerHour: app.security.rateLimitPerHour,
      maxTokenLifetime: app.security.maxTokenLifetime,
      requireSecureRedirect: app.security.requireSecureRedirect
    })
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.clientId.includes(searchTerm)
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && app.isActive && app.isApproved) ||
                         (filterStatus === 'pending' && !app.isApproved) ||
                         (filterStatus === 'inactive' && !app.isActive)
    
    const matchesType = filterType === 'all' || app.appType === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getAppIcon = (appType: string) => {
    switch (appType) {
      case 'desktop': return Monitor
      case 'mobile': return Smartphone
      case 'web': return Globe
      case 'api': return Server
      default: return Monitor
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Loading...">
        <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        </div>
      </Layout>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Layout title="App Management Dashboard">
      <Head>
        <meta property="og:title" content="App Management Dashboard" />
        <meta property="og:description" content="Manage registered applications and OAuth clients" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">App Management Dashboard</h1>
            <p className="text-secondary-300">Manage registered applications and OAuth clients</p>
          </div>

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`mb-6 p-4 rounded-lg border ${
                notification.type === 'success' ? 'bg-green-900/50 border-green-500 text-green-300' :
                notification.type === 'error' ? 'bg-red-900/50 border-red-500 text-red-300' :
                'bg-blue-900/50 border-blue-500 text-blue-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                {notification.type === 'info' && <CheckCircle className="w-5 h-5" />}
                <span>{notification.message}</span>
              </div>
            </motion.div>
          )}

          {/* Filters and Search */}
          <div className="bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-600/50 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search apps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="web">Web</option>
                  <option value="api">API</option>
                </select>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={loadApps}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New App</span>
                </button>
              </div>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApps.map((app) => {
              const AppIcon = getAppIcon(app.appType)
              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-600/50 p-6 hover:border-primary-500/50 transition-colors"
                >
                  {/* App Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt={app.name} className="w-10 h-10 rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                          <AppIcon className="w-5 h-5 text-primary-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                        <p className="text-secondary-400 text-sm capitalize">{app.appType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!app.isApproved && (
                        <button
                          onClick={() => handleApproveApp(app._id)}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors"
                          title="Approve App"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => startEditing(app)}
                        className="p-1 text-secondary-400 hover:text-secondary-300 hover:bg-secondary-700 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app._id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* App Description */}
                  {app.description && (
                    <p className="text-secondary-300 text-sm mb-4 line-clamp-2">{app.description}</p>
                  )}

                  {/* Status Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {app.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {app.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {app.isConfidential && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        Confidential
                      </span>
                    )}
                  </div>

                  {/* Client Credentials */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <label className="text-xs text-secondary-400 block mb-1">Client ID</label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-xs bg-secondary-900 px-2 py-1 rounded font-mono text-secondary-300">
                          {app.clientId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(app.clientId)}
                          className="p-1 text-secondary-400 hover:text-secondary-300 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {app.isConfidential && (
                      <div>
                        <label className="text-xs text-secondary-400 block mb-1">Client Secret</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-xs bg-secondary-900 px-2 py-1 rounded font-mono text-secondary-300">
                            {showSecrets[app._id] ? app.clientSecret : '••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => setShowSecrets({ ...showSecrets, [app._id]: !showSecrets[app._id] })}
                            className="p-1 text-secondary-400 hover:text-secondary-300 transition-colors"
                          >
                            {showSecrets[app._id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(app.clientSecret)}
                            className="p-1 text-secondary-400 hover:text-secondary-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-secondary-700/50">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary-400">{app.stats.totalUsersAuthorized}</div>
                      <div className="text-xs text-secondary-400">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary-400">{app.stats.totalTokensIssued}</div>
                      <div className="text-xs text-secondary-400">Tokens</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAppStatus(app._id, app.isActive)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        app.isActive 
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {app.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-2 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <Monitor className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No apps found</h3>
              <p className="text-secondary-400 mb-6">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                  ? 'No apps match your current filters'
                  : 'Get started by registering your first app'}
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Register New App</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit App Modal would go here - implementation details omitted for brevity */}
      {/* App Details Modal would go here - implementation details omitted for brevity */}
    </Layout>
  )
}
