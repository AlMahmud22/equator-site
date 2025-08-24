import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Globe, 
  Clock, 
  Eye,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'

interface SecurityAnalytics {
  totalLogins: number
  successfulLogins: number
  failedLogins: number
  suspiciousActivities: number
  rateLimitViolations: number
  uniqueIpAddresses: number
  topCountries: Array<{ country: string; count: number }>
  hourlyActivity: Array<{ hour: number; count: number }>
  riskScore: number
}

interface SecurityAlert {
  id: string
  userId?: string
  type: 'suspicious_login' | 'rate_limit_exceeded' | 'multiple_failed_attempts' | 'unusual_activity' | 'session_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metadata: any
  timestamp: Date
  resolved: boolean
}

interface ActivityLog {
  _id: string
  userId?: string
  action: string
  loginProvider: string
  ipAddress: string
  userAgent: string
  success: boolean
  metadata?: any
  location?: {
    country?: string
    city?: string
  }
  riskScore?: number
  flagged?: boolean
  timestamp: Date
}

export default function SecurityDashboard() {
  const [analytics, setAnalytics] = useState<SecurityAnalytics | null>(null)
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(7) // days

  useEffect(() => {
    fetchSecurityData()
  }, [timeRange])

  const fetchSecurityData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch analytics
      const analyticsRes = await fetch(`/api/security?action=analytics&days=${timeRange}`)
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData.data.analytics)
      }

      // Fetch alerts
      const alertsRes = await fetch('/api/security?action=alerts&limit=20')
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        setAlerts(alertsData.data.alerts)
      }

      // Fetch recent logs
      const logsRes = await fetch('/api/security?action=logs&limit=50')
      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setRecentLogs(logsData.data.logs)
      }

    } catch (err) {
      setError('Failed to fetch security data')
      console.error('Security dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-alert', alertId })
      })

      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ))
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  }

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskColor = (score: number = 0) => {
    if (score >= 70) return 'text-red-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-secondary-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-secondary-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h2 className="text-red-400 text-lg font-semibold mb-2">Security Dashboard Error</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchSecurityData}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-secondary-400">Monitor authentication activity and security events</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="bg-secondary-800 border border-secondary-700 rounded px-3 py-2 text-white"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button
            onClick={fetchSecurityData}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Total Logins</p>
                <p className="text-2xl font-bold text-white">{analytics.totalLogins}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {analytics.totalLogins > 0 
                    ? Math.round((analytics.successfulLogins / analytics.totalLogins) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Suspicious Activities</p>
                <p className="text-2xl font-bold text-red-400">{analytics.suspiciousActivities}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(analytics.riskScore)}`}>
                  {Math.round(analytics.riskScore)}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Security Alerts</h2>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-secondary-400">
              {alerts.filter(a => !a.resolved).length} unresolved
            </span>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-secondary-400">No security alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} ${
                  alert.resolved ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-secondary-400">
                        {formatDateTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-white text-sm">{alert.message}</p>
                    {alert.metadata && (
                      <p className="text-xs text-secondary-400 mt-1">
                        IP: {alert.metadata.ipAddress || 'Unknown'}
                      </p>
                    )}
                  </div>
                  
                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="btn-ghost text-xs"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <Activity className="w-5 h-5 text-blue-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="text-left py-2 text-secondary-400">Time</th>
                <th className="text-left py-2 text-secondary-400">Action</th>
                <th className="text-left py-2 text-secondary-400">Provider</th>
                <th className="text-left py-2 text-secondary-400">IP Address</th>
                <th className="text-left py-2 text-secondary-400">Status</th>
                <th className="text-left py-2 text-secondary-400">Risk</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.slice(0, 20).map((log) => (
                <tr key={log._id} className="border-b border-secondary-800/50">
                  <td className="py-2 text-secondary-300">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-2 text-white">
                    {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </td>
                  <td className="py-2 text-secondary-300 capitalize">
                    {log.loginProvider}
                  </td>
                  <td className="py-2 text-secondary-300">
                    {log.ipAddress}
                  </td>
                  <td className="py-2">
                    {log.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </td>
                  <td className="py-2">
                    <span className={`text-sm ${getRiskColor(log.riskScore)}`}>
                      {log.riskScore || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Hourly Activity Chart */}
      {analytics && analytics.hourlyActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Activity by Hour</h2>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>

          <div className="h-64 flex items-end space-x-1">
            {analytics.hourlyActivity.map((activity) => {
              const maxCount = Math.max(...analytics.hourlyActivity.map(a => a.count))
              const height = maxCount > 0 ? (activity.count / maxCount) * 100 : 0
              
              return (
                <div key={activity.hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-full transition-all duration-300"
                    style={{ height: `${height}%` }}
                    title={`${activity.hour}:00 - ${activity.count} activities`}
                  ></div>
                  <span className="text-xs text-secondary-400 mt-1">
                    {activity.hour}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
