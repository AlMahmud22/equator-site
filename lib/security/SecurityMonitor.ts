import { Types } from 'mongoose'
import AccessLog from '@/modules/database/models/AccessLog'
import EnhancedUser from '@/modules/database/models/EnhancedUser'
import connectDB from '@/modules/database/connection'

export interface SecurityAlert {
  id: string
  userId?: string
  type: 'suspicious_login' | 'rate_limit_exceeded' | 'multiple_failed_attempts' | 'unusual_activity' | 'session_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metadata: any
  timestamp: Date
  resolved: boolean
}

export interface SecurityAnalytics {
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

export class SecurityMonitor {
  private static instance: SecurityMonitor
  private alerts: SecurityAlert[] = []
  
  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }
  
  // Log security event
  async logSecurityEvent(
    userId: string | null,
    action: string,
    provider: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    metadata: any = {}
  ): Promise<void> {
    try {
      await connectDB()
      
      // Calculate risk score
      const riskScore = this.calculateRiskScore(
        ipAddress,
        userAgent,
        action,
        success,
        metadata
      )
      
      // Create access log entry
      const logEntry = new AccessLog({
        userId: userId ? new Types.ObjectId(userId) : undefined,
        action: action as any,
        loginProvider: provider as any,
        ipAddress,
        userAgent,
        success,
        metadata,
        riskScore,
        flagged: riskScore > 70,
        timestamp: new Date()
      })
      
      await logEntry.save()
      
      // Check for security alerts
      await this.checkForAlerts(logEntry)
      
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }
  
  // Calculate risk score for an event
  private calculateRiskScore(
    ipAddress: string,
    userAgent: string,
    action: string,
    success: boolean,
    metadata: any
  ): number {
    let score = 0
    
    // Base score for failed attempts
    if (!success) {
      score += 30
    }
    
    // Check for suspicious user agent patterns
    const suspiciousPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /postman/i
    ]
    
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      score += 40
    }
    
    // Check for missing or very short user agent
    if (!userAgent || userAgent.length < 20) {
      score += 25
    }
    
    // Check for private IP addresses in production
    if (process.env.NODE_ENV === 'production') {
      if (
        ipAddress.startsWith('192.168.') ||
        ipAddress.startsWith('10.') ||
        ipAddress.startsWith('172.') ||
        ipAddress === '127.0.0.1'
      ) {
        score += 20
      }
    }
    
    // Check for suspicious actions
    if (action.includes('suspicious') || action.includes('rate_limited')) {
      score += 50
    }
    
    // Check metadata for additional risk factors
    if (metadata.reason?.includes('suspicious')) {
      score += 30
    }
    
    return Math.min(score, 100) // Cap at 100
  }
  
  // Check for security alerts based on recent activity
  private async checkForAlerts(logEntry: any): Promise<void> {
    try {
      const now = new Date()
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000)
      
      // Check for multiple failed attempts from same IP
      const failedAttempts = await AccessLog.countDocuments({
        ipAddress: logEntry.ipAddress,
        success: false,
        timestamp: { $gte: lastHour }
      })
      
      if (failedAttempts >= 5) {
        this.createAlert({
          type: 'multiple_failed_attempts',
          severity: 'high',
          message: `Multiple failed login attempts (${failedAttempts}) from IP ${logEntry.ipAddress}`,
          metadata: { ipAddress: logEntry.ipAddress, attempts: failedAttempts },
          userId: logEntry.userId?.toString()
        })
      }
      
      // Check for suspicious activity patterns
      if (logEntry.riskScore > 80) {
        this.createAlert({
          type: 'suspicious_login',
          severity: 'critical',
          message: `High risk login attempt detected (score: ${logEntry.riskScore})`,
          metadata: { 
            ipAddress: logEntry.ipAddress,
            userAgent: logEntry.userAgent,
            riskScore: logEntry.riskScore
          },
          userId: logEntry.userId?.toString()
        })
      }
      
      // Check for unusual login times (if user has login history)
      if (logEntry.userId && logEntry.success) {
        await this.checkUnusualLoginTime(logEntry.userId.toString(), now)
      }
      
    } catch (error) {
      console.error('Failed to check for security alerts:', error)
    }
  }
  
  // Check for unusual login times based on user's historical patterns
  private async checkUnusualLoginTime(userId: string, loginTime: Date): Promise<void> {
    try {
      const user = await EnhancedUser.findById(userId)
      if (!user || user.loginHistory.length < 10) return // Need enough data
      
      const loginHour = loginTime.getHours()
      const historicalHours = user.loginHistory.map((login: any) => 
        new Date(login.timestamp).getHours()
      )
      
      // Calculate if this hour is unusual for the user
      const hourCounts = historicalHours.reduce((acc: any, hour: number) => {
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {})
      
      const thisHourCount = hourCounts[loginHour] || 0
      const totalLogins = historicalHours.length
      const hourPercentage = thisHourCount / totalLogins
      
      // If user rarely logs in at this hour (less than 5% of historical logins)
      if (hourPercentage < 0.05 && totalLogins > 20) {
        this.createAlert({
          type: 'unusual_activity',
          severity: 'medium',
          message: `User logged in at unusual time (${loginHour}:00, only ${Math.round(hourPercentage * 100)}% of historical logins)`,
          metadata: { 
            userId,
            loginHour,
            historicalPercentage: hourPercentage
          },
          userId
        })
      }
      
    } catch (error) {
      console.error('Failed to check unusual login time:', error)
    }
  }
  
  // Create a security alert
  private createAlert(alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    }
    
    this.alerts.push(alert)
    
    // Log alert
    console.warn(`SECURITY ALERT [${alert.severity.toUpperCase()}]:`, alert.message, alert.metadata)
    
    // In production, you might want to:
    // - Send email notifications
    // - Post to Slack/Discord
    // - Store in database for admin dashboard
    // - Trigger automated responses
    
    // Keep only last 1000 alerts in memory
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000)
    }
  }
  
  // Get security analytics for a time period
  async getSecurityAnalytics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SecurityAnalytics> {
    try {
      await connectDB()
      
      const query: any = {
        timestamp: { $gte: startDate, $lte: endDate }
      }
      
      if (userId) {
        query.userId = new Types.ObjectId(userId)
      }
      
      const logs = await AccessLog.find(query)
      
      const analytics: SecurityAnalytics = {
        totalLogins: logs.filter(log => log.action.includes('sign_in')).length,
        successfulLogins: logs.filter(log => log.action === 'sign_in_success').length,
        failedLogins: logs.filter(log => 
          log.action.includes('sign_in') && !log.success
        ).length,
        suspiciousActivities: logs.filter(log => log.flagged).length,
        rateLimitViolations: logs.filter(log => 
          log.action === 'sign_in_rate_limited'
        ).length,
        uniqueIpAddresses: new Set(logs.map(log => log.ipAddress)).size,
        topCountries: [],
        hourlyActivity: [],
        riskScore: 0
      }
      
      // Calculate hourly activity
      const hourlyMap = new Map<number, number>()
      logs.forEach(log => {
        const hour = new Date(log.timestamp).getHours()
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      })
      
      for (let hour = 0; hour < 24; hour++) {
        analytics.hourlyActivity.push({
          hour,
          count: hourlyMap.get(hour) || 0
        })
      }
      
      // Calculate overall risk score
      const riskScores = logs.map(log => log.riskScore || 0)
      analytics.riskScore = riskScores.length > 0 
        ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length
        : 0
      
      return analytics
      
    } catch (error) {
      console.error('Failed to get security analytics:', error)
      throw error
    }
  }
  
  // Get recent alerts
  getRecentAlerts(limit: number = 50): SecurityAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
  
  // Resolve an alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      return true
    }
    return false
  }
  
  // Clean up old logs (for maintenance)
  async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    try {
      await connectDB()
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      const result = await AccessLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      })
      
      return result.deletedCount || 0
      
    } catch (error) {
      console.error('Failed to cleanup old logs:', error)
      return 0
    }
  }
}

export default SecurityMonitor.getInstance()
