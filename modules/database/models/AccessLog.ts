import mongoose, { Schema, Document } from 'mongoose'

export interface IAccessLog extends Document {
  // userId may be a MongoDB ObjectId (for internal users) or a provider string id (Google account id)
  userId?: mongoose.Types.ObjectId | string
  action: 'sign_in_success' | 'sign_in_error' | 'sign_in_rate_limited' | 'sign_in_suspicious' | 'sign_out' | 'session_refresh' | 'api_access' | 'profile_update' | 'password_change' | 'account_deletion'
  loginProvider: 'email' | 'google' | 'github' | 'unknown'
  ipAddress: string
  userAgent: string
  success: boolean
  metadata?: {
    email?: string
    name?: string
    error?: string
    reason?: string
    sessionId?: string
    apiKeyId?: string
    endpoint?: string
    method?: string
    [key: string]: any
  }
  // Geographic data (can be populated by IP geolocation service)
  location?: {
    country?: string
    city?: string
    region?: string
    timezone?: string
  }
  // Security flags
  riskScore?: number // 0-100, higher is more risky
  flagged?: boolean
  timestamp: Date
}

const AccessLogSchema = new Schema<IAccessLog>({
  userId: {
    // Allow either ObjectId or string provider id. Use Mixed to avoid cast errors when provider id (string)
    type: Schema.Types.Mixed,
    ref: 'EnhancedUser',
    required: false,
    index: true
  },
  action: {
    type: String,
    enum: [
      'sign_in_success',
      'sign_in_error', 
      'sign_in_rate_limited',
      'sign_in_suspicious',
      'sign_out',
      'session_refresh',
      'api_access',
      'profile_update',
      'password_change',
      'account_deletion'
    ],
    required: true,
    index: true
  },
  loginProvider: {
    type: String,
    enum: ['email', 'google', 'github', 'unknown'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  location: {
    country: String,
    city: String,
    region: String,
    timezone: String
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  flagged: {
    type: Boolean,
    default: false,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // We're using our own timestamp field
})

// Compound indexes for efficient queries
AccessLogSchema.index({ userId: 1, timestamp: -1 })
AccessLogSchema.index({ ipAddress: 1, timestamp: -1 })
AccessLogSchema.index({ action: 1, success: 1, timestamp: -1 })
AccessLogSchema.index({ flagged: 1, timestamp: -1 })
AccessLogSchema.index({ timestamp: -1 }) // For general time-based queries

// TTL index to automatically delete old logs (optional - remove if you want to keep all logs)
// AccessLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }) // Keep for 1 year

export default mongoose.models.AccessLog || mongoose.model<IAccessLog>('AccessLog', AccessLogSchema)
