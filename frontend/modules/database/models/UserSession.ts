import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  _id: string;
  userId: string;
  sessionToken: string;
  
  // Session metadata
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os?: string;
    browser?: string;
    device?: string;
  };
  
  // Location tracking (optional)
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  
  // Session lifecycle
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
  isActive: boolean;
  
  // Security tracking
  loginMethod: 'oauth' | 'api' | 'web';
  authProvider?: 'google' | 'github';
  riskScore?: number; // 0-100, higher = more risky
  
  // Session termination
  terminatedAt?: Date;
  terminationReason?: 'logout' | 'timeout' | 'security' | 'admin' | 'device_limit';
  
  // API usage for this session
  apiUsage?: {
    requestCount: number;
    lastRequest?: Date;
    rateLimitHits: number;
  };
}

const UserSessionSchema = new Schema<IUserSession>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Session metadata
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  deviceInfo: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    os: String,
    browser: String,
    device: String
  },
  
  // Location tracking
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  
  // Session lifecycle
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActive: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Security tracking
  loginMethod: {
    type: String,
    enum: ['oauth', 'api', 'web'],
    required: true
  },
  authProvider: {
    type: String,
    enum: ['google', 'github']
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Session termination
  terminatedAt: Date,
  terminationReason: {
    type: String,
    enum: ['logout', 'timeout', 'security', 'admin', 'device_limit']
  },
  
  // API usage tracking
  apiUsage: {
    requestCount: {
      type: Number,
      default: 0
    },
    lastRequest: Date,
    rateLimitHits: {
      type: Number,
      default: 0
    }
  }
});

// Compound indexes for performance
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ userId: 1, createdAt: -1 });
UserSessionSchema.index({ ipAddress: 1, createdAt: -1 });
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
UserSessionSchema.index({ isActive: 1, lastActive: -1 });
UserSessionSchema.index({ riskScore: -1, isActive: 1 });

// Geospatial index for location-based queries (if needed)
UserSessionSchema.index({ 'location.country': 1, 'location.region': 1 });

// Virtual for checking if session is expired
UserSessionSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for session duration
UserSessionSchema.virtual('duration').get(function() {
  return this.lastActive.getTime() - this.createdAt.getTime();
});

// Method to refresh session
UserSessionSchema.methods.refreshSession = function() {
  this.lastActive = new Date();
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return this.save();
};

// Method to terminate session
UserSessionSchema.methods.terminate = function(reason: string) {
  this.isActive = false;
  this.terminatedAt = new Date();
  this.terminationReason = reason;
  return this.save();
};

// Method to increment API usage
UserSessionSchema.methods.incrementApiUsage = function() {
  this.apiUsage = this.apiUsage || { requestCount: 0, rateLimitHits: 0 };
  this.apiUsage.requestCount += 1;
  this.apiUsage.lastRequest = new Date();
  this.lastActive = new Date();
  return this.save();
};

// Static method to cleanup expired sessions
UserSessionSchema.statics.cleanupExpiredSessions = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, terminatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    ]
  });
};

// Static method to get active sessions for user
UserSessionSchema.statics.getActiveSessions = function(userId: string) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastActive: -1 });
};

// Static method to get session analytics
UserSessionSchema.statics.getSessionAnalytics = function(userId: string, days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        sessionCount: { $sum: 1 },
        totalRequests: { $sum: "$apiUsage.requestCount" },
        uniqueIPs: { $addToSet: "$ipAddress" },
        avgRiskScore: { $avg: "$riskScore" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export default mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema);
