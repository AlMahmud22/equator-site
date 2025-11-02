import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  fullName: string
  email: string
  authType: 'google' | 'github'
  avatar?: string
  role: string // Default 'user', 'admin', 'app_developer', etc.
  
  // Profile preferences
  profile?: {
    displayName?: string
    bio?: string
    company?: string
    location?: string
    website?: string
    timezone?: string
    language?: string
    theme?: 'light' | 'dark' | 'auto'
    notifications?: {
      email: boolean
      push: boolean
      sms: boolean
      newsletter: boolean
    }
    privacy?: {
      profileVisibility: 'public' | 'private' | 'limited'
      showEmail: boolean
      showLocation: boolean
      allowDirectMessages: boolean
    }
  }
  
  // API usage tracking
  apiUsage?: {
    totalRequests: number
    requestsThisMonth: number
    lastRequestAt?: Date
    rateLimitExceeded: number
    favoriteEndpoints: string[]
    apiKeys: {
      keyId: string
      name: string
      createdAt: Date
      lastUsed?: Date
      permissions: string[]
      isActive: boolean
    }[]
    usage30Days: {
      date: Date
      requests: number
      errors: number
    }[]
  }
  
  // Enhanced security fields
  lastLoginAt?: Date
  lastLoginIp?: string
  loginAttempts?: number
  lockedUntil?: Date
  passwordChangedAt?: Date
  
  // Session management (keeping for backward compatibility, will migrate to UserSession)
  activeSessions?: {
    sessionId: string
    deviceInfo?: string
    ipAddress?: string
    createdAt: Date
    lastActiveAt: Date
    isActive: boolean
  }[]
  
  // Enhanced security preferences
  securitySettings?: {
    twoFactorEnabled: boolean
    emailNotifications: boolean
    suspiciousActivityAlerts: boolean
    allowedIpAddresses?: string[]
    sessionTimeout: number // minutes
    maxConcurrentSessions: number
    requireReauthForSensitive: boolean
    alertOnNewDevice: boolean
    alertOnNewLocation: boolean
  }
  
  // Enhanced activity tracking
  downloadLogs?: {
    projectId: string
    projectName: string
    downloadedAt: Date
    fileSize?: number
    ipAddress?: string
    userAgent?: string
  }[]
  
  // Account status and metadata
  isLocked?: boolean
  accountStatus: 'active' | 'suspended' | 'deactivated' | 'pending_verification'
  suspensionReason?: string
  suspendedUntil?: Date
  emailVerified?: boolean
  phoneVerified?: boolean
  
  // Subscription and billing (for future use)
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'cancelled' | 'past_due' | 'trialing'
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
  }
  
  // Analytics and insights
  analytics?: {
    totalLogins: number
    uniqueDevices: number
    countriesAccessed: string[]
    avgSessionDuration: number
    lastActiveDate?: Date
    engagementScore: number // 0-100
  }
  
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
    // Removed duplicate index: true - using schema.index instead
  },
  authType: {
    type: String,
    enum: ['google', 'github'],
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: true,
    default: 'user',
    index: true
  },
  
  // Profile preferences
  profile: {
    displayName: String,
    bio: {
      type: String,
      maxlength: 500
    },
    company: String,
    location: String,
    website: String,
    timezone: String,
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      sms: {
        type: Boolean,
        default: false
      },
      newsletter: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'limited'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showLocation: {
        type: Boolean,
        default: true
      },
      allowDirectMessages: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // API usage tracking
  apiUsage: {
    totalRequests: {
      type: Number,
      default: 0,
      index: true
    },
    requestsThisMonth: {
      type: Number,
      default: 0
    },
    lastRequestAt: Date,
    rateLimitExceeded: {
      type: Number,
      default: 0
    },
    favoriteEndpoints: [String],
    apiKeys: [{
      keyId: {
        type: String,
        required: true,
        index: true
      },
      name: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      lastUsed: Date,
      permissions: [String],
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    usage30Days: [{
      date: {
        type: Date,
        required: true
      },
      requests: {
        type: Number,
        default: 0
      },
      errorCount: { // Renamed from 'errors' to avoid reserved keyword
        type: Number,
        default: 0
      }
    }]
  },
  
  // Enhanced security fields
  lastLoginAt: {
    type: Date
    // Removed duplicate index: true - using schema.index instead
  },
  lastLoginIp: {
    type: String
    // Removed duplicate index: true - using schema.index instead
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  
  // Session management (keeping for backward compatibility)
  activeSessions: [{
    sessionId: {
      type: String,
      required: true
    },
    deviceInfo: String,
    ipAddress: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Enhanced security preferences
  securitySettings: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    suspiciousActivityAlerts: {
      type: Boolean,
      default: true
    },
    allowedIpAddresses: [String],
    sessionTimeout: {
      type: Number,
      default: 1440, // 24 hours in minutes
      min: 15,
      max: 10080 // 7 days
    },
    maxConcurrentSessions: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    requireReauthForSensitive: {
      type: Boolean,
      default: true
    },
    alertOnNewDevice: {
      type: Boolean,
      default: true
    },
    alertOnNewLocation: {
      type: Boolean,
      default: true
    }
  },
  
  // Enhanced activity tracking
  downloadLogs: [{
    projectId: String,
    projectName: String,
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    fileSize: Number,
    ipAddress: String,
    userAgent: String
  }],
  
  // Account status and metadata
  isLocked: {
    type: Boolean,
    default: false,
    index: true
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated', 'pending_verification'],
    default: 'active',
    index: true
  },
  suspensionReason: String,
  suspendedUntil: Date,
  emailVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing'],
      default: 'active'
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics and insights
  analytics: {
    totalLogins: {
      type: Number,
      default: 0
    },
    uniqueDevices: {
      type: Number,
      default: 0
    },
    countriesAccessed: [String],
    avgSessionDuration: {
      type: Number,
      default: 0 // in minutes
    },
    lastActiveDate: Date,
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      // Remove sensitive data from JSON output
      delete (ret as any).activeSessions
      delete (ret as any).loginAttempts
      delete (ret as any).lockedUntil
      delete (ret as any).apiUsage?.apiKeys
      return ret
    }
  }
})

// Enhanced indexes for performance and security queries - consolidated to remove duplicates
UserSchema.index({ email: 1 }, { unique: true }); // Consolidated email index
UserSchema.index({ createdAt: -1 })
UserSchema.index({ lastLoginAt: -1 })
UserSchema.index({ isLocked: 1, lockedUntil: 1 })
UserSchema.index({ accountStatus: 1 }) // Replaced duplicate field-level index
UserSchema.index({ 'activeSessions.sessionId': 1 })

// Performance indexes with duplicates removed
UserSchema.index({ 'apiUsage.totalRequests': -1 })
UserSchema.index({ 'apiUsage.apiKeys.keyId': 1 }, { sparse: true }) // Using sparse for better performance
UserSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 })
UserSchema.index({ 'analytics.engagementScore': -1 })
UserSchema.index({ 'analytics.lastActiveDate': -1 }) // Removed duplicate
UserSchema.index({ lastLoginIp: 1 }) // Replaced duplicate field-level index
UserSchema.index({ emailVerified: 1, accountStatus: 1 })

// Compound indexes for complex queries
UserSchema.index({ accountStatus: 1, 'subscription.plan': 1 })
UserSchema.index({ 'analytics.lastActiveDate': -1, accountStatus: 1 })
UserSchema.index({ createdAt: -1, emailVerified: 1 })

// Text search index for profile data
UserSchema.index({
  fullName: 'text',
  'profile.displayName': 'text',
  'profile.bio': 'text',
  'profile.company': 'text'
})

// Virtual for checking if account is currently locked
UserSchema.virtual('isCurrentlyLocked').get(function() {
  return this.isLocked && this.lockedUntil && this.lockedUntil > new Date()
})

// Virtual for checking subscription status
UserSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscription?.status === 'active' || this.subscription?.status === 'trialing'
})

// Virtual for getting display name
UserSchema.virtual('displayName').get(function() {
  return this.profile?.displayName || this.fullName
})

// Method to clean up expired sessions
UserSchema.methods.cleanupExpiredSessions = function() {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  this.activeSessions = this.activeSessions.filter((session: any) => 
    session.lastActiveAt > oneMonthAgo
  )
  
  return this.save()
}

// Method to add new session
UserSchema.methods.addSession = function(sessionId: string, deviceInfo: string, ipAddress: string) {
  this.activeSessions = this.activeSessions || []
  
  // Remove existing session with same ID
  this.activeSessions = this.activeSessions.filter((session: any) => 
    session.sessionId !== sessionId
  )
  
  // Add new session
  this.activeSessions.push({
    sessionId,
    deviceInfo,
    ipAddress,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    isActive: true
  })
  
  // Keep only last sessions based on user preference
  const maxSessions = this.securitySettings?.maxConcurrentSessions || 5
  if (this.activeSessions.length > maxSessions) {
    this.activeSessions = this.activeSessions.slice(-maxSessions)
  }
  
  return this.save()
}

// Method to track API usage
UserSchema.methods.trackApiUsage = function(endpoint: string) {
  this.apiUsage = this.apiUsage || {
    totalRequests: 0,
    requestsThisMonth: 0,
    rateLimitExceeded: 0,
    favoriteEndpoints: [],
    apiKeys: [],
    usage30Days: []
  }
  
  this.apiUsage.totalRequests += 1
  this.apiUsage.requestsThisMonth += 1
  this.apiUsage.lastRequestAt = new Date()
  
  // Track favorite endpoints
  if (!this.apiUsage.favoriteEndpoints.includes(endpoint)) {
    this.apiUsage.favoriteEndpoints.push(endpoint)
    if (this.apiUsage.favoriteEndpoints.length > 10) {
      this.apiUsage.favoriteEndpoints = this.apiUsage.favoriteEndpoints.slice(-10)
    }
  }
  
  // Update daily usage
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let todayUsage = this.apiUsage.usage30Days.find((usage: any) => 
    usage.date.getTime() === today.getTime()
  )
  
  if (!todayUsage) {
    todayUsage = { date: today, requests: 0, errors: 0 }
    this.apiUsage.usage30Days.push(todayUsage)
  }
  
  todayUsage.requests += 1
  
  // Keep only last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  this.apiUsage.usage30Days = this.apiUsage.usage30Days.filter((usage: any) =>
    usage.date > thirtyDaysAgo
  )
  
  return this.save()
}

// Method to create API key
UserSchema.methods.createApiKey = function(name: string, permissions: string[]) {
  this.apiUsage = this.apiUsage || {
    totalRequests: 0,
    requestsThisMonth: 0,
    rateLimitExceeded: 0,
    favoriteEndpoints: [],
    apiKeys: [],
    usage30Days: []
  }
  
  const keyId = 'eq_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  this.apiUsage.apiKeys.push({
    keyId,
    name,
    createdAt: new Date(),
    permissions,
    isActive: true
  })
  
  return this.save().then(() => keyId)
}

// Method to update analytics
UserSchema.methods.updateAnalytics = function(sessionDuration: number, country?: string) {
  this.analytics = this.analytics || {
    totalLogins: 0,
    uniqueDevices: 0,
    countriesAccessed: [],
    avgSessionDuration: 0,
    engagementScore: 0
  }
  
  this.analytics.totalLogins += 1
  this.analytics.lastActiveDate = new Date()
  
  // Update average session duration
  this.analytics.avgSessionDuration = 
    (this.analytics.avgSessionDuration * (this.analytics.totalLogins - 1) + sessionDuration) / this.analytics.totalLogins
  
  // Track countries
  if (country && !this.analytics.countriesAccessed.includes(country)) {
    this.analytics.countriesAccessed.push(country)
  }
  
  // Calculate engagement score (simple algorithm)
  const daysSinceCreation = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  const loginFrequency = this.analytics.totalLogins / Math.max(daysSinceCreation, 1)
  const avgSessionHours = this.analytics.avgSessionDuration / 60
  
  this.analytics.engagementScore = Math.min(100, Math.round(
    (loginFrequency * 20) + 
    (avgSessionHours * 10) + 
    (this.analytics.countriesAccessed.length * 5) +
    (this.apiUsage?.totalRequests || 0) / 100
  ))
  
  return this.save()
}

// Static method for user analytics
UserSchema.statics.getUserAnalytics = function(timeframe: 'week' | 'month' | 'year' = 'month') {
  const now = new Date()
  let startDate: Date
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [
              { $gt: ['$analytics.lastActiveDate', startDate] },
              1,
              0
            ]
          }
        },
        avgEngagement: { $avg: '$analytics.engagementScore' },
        totalApiRequests: { $sum: '$apiUsage.totalRequests' }
      }
    }
  ])
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
