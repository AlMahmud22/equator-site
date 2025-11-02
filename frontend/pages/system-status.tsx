import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Key, 
  Globe, 
  Monitor,
  Database,
  Server
} from 'lucide-react'
import Layout from '@/components/Layout'

interface SystemStatus {
  component: string
  status: 'healthy' | 'degraded' | 'down'
  description: string
  responseTime?: number
  lastChecked: string
}

export default function SystemStatusPage() {
  const { data: session, status } = useSession()
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    setLoading(true)
    
    const checks = [
      // Core authentication system
      {
        component: 'Authentication System',
        endpoint: '/api/auth/session',
        icon: Shield
      },
      // Profile management
      {
        component: 'Profile Management',
        endpoint: '/api/profile',
        icon: Monitor
      },
      // User permissions
      {
        component: 'User Permissions',
        endpoint: '/api/user/permissions',
        icon: Key
      },
      // App registration system
      {
        component: 'App Registration System',
        endpoint: '/api/apps/manage',
        icon: Globe
      },
      // Session management
      {
        component: 'Session Management',
        endpoint: '/api/sessions/manage',
        icon: Database
      },
      // Health check
      {
        component: 'API Health',
        endpoint: '/api/health',
        icon: Server
      }
    ]

    const results: SystemStatus[] = []

    for (const check of checks) {
      const startTime = Date.now()
      try {
        const response = await fetch(check.endpoint)
        const responseTime = Date.now() - startTime
        
        let status: 'healthy' | 'degraded' | 'down' = 'healthy'
        let description = 'All systems operational'

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            status = 'healthy' // Auth endpoints return 401/403 when not authenticated, which is expected
            description = 'Authentication required (expected behavior)'
          } else if (response.status >= 500) {
            status = 'down'
            description = `Server error (${response.status})`
          } else {
            status = 'degraded'
            description = `Response issue (${response.status})`
          }
        }

        if (responseTime > 2000) {
          status = status === 'healthy' ? 'degraded' : status
          description = `${description} - Slow response (${responseTime}ms)`
        }

        results.push({
          component: check.component,
          status,
          description,
          responseTime,
          lastChecked: new Date().toISOString()
        })
      } catch (error) {
        results.push({
          component: check.component,
          status: 'down',
          description: 'Connection failed',
          lastChecked: new Date().toISOString()
        })
      }
    }

    setSystemStatus(results)
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200'
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200'
      case 'down':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const overallStatus = systemStatus.length === 0 ? 'unknown' : 
    systemStatus.some(s => s.status === 'down') ? 'down' :
    systemStatus.some(s => s.status === 'degraded') ? 'degraded' : 'healthy'

  return (
    <Layout>
      <Head>
        <title>System Status - Equators</title>
        <meta name="description" content="Real-time status of Equators authentication and app registration systems" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              System Status
            </h1>
            <p className="text-lg text-gray-600">
              Real-time status of our central authentication and app registration systems
            </p>
          </motion.div>

          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-lg border-2 p-6 mb-8 ${getStatusColor(overallStatus)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Overall System Status
                  </h2>
                  <p className="text-gray-600">
                    {overallStatus === 'healthy' && 'All systems operational'}
                    {overallStatus === 'degraded' && 'Some services experiencing issues'}
                    {overallStatus === 'down' && 'Service disruption detected'}
                    {overallStatus === 'unknown' && 'Checking system status...'}
                  </p>
                </div>
              </div>
              <button
                onClick={checkSystemHealth}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Refresh'}
              </button>
            </div>
          </motion.div>

          {/* System Components */}
          <div className="space-y-4">
            {systemStatus.map((component, index) => (
              <motion.div
                key={component.component}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`rounded-lg border p-6 ${getStatusColor(component.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(component.status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {component.component}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {component.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {component.responseTime && (
                      <div>{component.responseTime}ms</div>
                    )}
                    <div>
                      {new Date(component.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Session Info */}
          {session && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 bg-white rounded-lg border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Session
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{session.user?.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-600">{session.user?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="ml-2 text-gray-600">
                    {session.user?.email === 'mahmud23k@gmail.com' || 
                     session.user?.email === 'almahmud2122@gmail.com' ? 'Admin' : 'User'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Session Status:</span>
                  <span className="ml-2 text-green-600">Active</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feature Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-12 bg-white rounded-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Central App Registration System Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">OAuth 2.0 Flow</h4>
                  <p className="text-sm text-gray-600">Complete authorization code flow with PKCE support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Key className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">JWT Tokens</h4>
                  <p className="text-sm text-gray-600">Secure access and refresh tokens with role information</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Globe className="h-6 w-6 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">App Dashboard</h4>
                  <p className="text-sm text-gray-600">GUI for dynamic app registration and management</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Monitor className="h-6 w-6 text-orange-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Role-Based Access</h4>
                  <p className="text-sm text-gray-600">Admin and user profile separation with secure APIs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Database className="h-6 w-6 text-teal-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Session Management</h4>
                  <p className="text-sm text-gray-600">Comprehensive session tracking and security monitoring</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Server className="h-6 w-6 text-red-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Backward Compatible</h4>
                  <p className="text-sm text-gray-600">Existing apps continue working without code changes</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
