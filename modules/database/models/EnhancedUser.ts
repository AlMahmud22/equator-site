import mongoose, { Document, Schema } from 'mongoose'

// Enhanced User interface for comprehensive profile management
export interface IEnhancedUser extends Document {
  // Basic profile info (from OAuth)
  name: string
  email: string
  image?: string
  
  // Authentication info
  provider: 'google' | 'github'
  providerId: string
  
  // Profile settings
  displayName?: string
  bio?: string
  preferences: {
    theme: 'dark' | 'light' | 'system'
    newsletter: boolean
    notifications: boolean
    privacy: {
      showEmail: boolean
      showActivity: boolean
    }
  }
  
  // Activity tracking
  loginHistory: {
    timestamp: Date
    provider: string
    ipAddress?: string
    userAgent?: string
  }[]
  
  downloadLogs: {
    projectId: string
    projectName: string
    downloadedAt: Date
    fileSize?: number
    version?: string
  }[]
  
  // API access
  apiKeys: {
    keyId: string
    name: string
    keyHash: string // Store hash, not actual key
    permissions: string[]
    createdAt: Date
    lastUsedAt?: Date
    expiresAt?: Date
    isActive: boolean
  }[]
  
  // Security
  sessions: {
    sessionToken: string
    deviceInfo?: string
    ipAddress?: string
    createdAt: Date
    lastActiveAt: Date
    isActive: boolean
  }[]
  
  // Account status
  isActive: boolean
  emailVerified?: Date
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const EnhancedUserSchema = new Schema<IEnhancedUser>({
  // Basic profile info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  image: {
    type: String,
    required: false
  },
  
  // Authentication info
  provider: {
    type: String,
    enum: ['google', 'github'],
    required: true
  },
  providerId: {
    type: String,
    required: true
  },
  
  // Profile settings
  displayName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark'
    },
    newsletter: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    privacy: {
      showEmail: {
        type: Boolean,
        default: false
      },
      showActivity: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Activity tracking
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    provider: String,
    ipAddress: String,
    userAgent: String
  }],
  
  downloadLogs: [{
    projectId: String,
    projectName: String,
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    fileSize: Number,
    version: String
  }],
  
  // API access
  apiKeys: [{
    keyId: {
  type: String,
  required: true
    },
    name: {
      type: String,
      required: true
    },
    keyHash: {
      type: String,
      required: true
    },
    permissions: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: Date,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Security
  sessions: [{
    sessionToken: String,
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
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: Date,
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      // Remove sensitive data from JSON output
      delete (ret as any).sessions
      delete (ret as any).apiKeys
      return ret
    }
  }
})

// Indexes for performance
EnhancedUserSchema.index({ email: 1 })
EnhancedUserSchema.index({ provider: 1, providerId: 1 })
EnhancedUserSchema.index({ createdAt: -1 })
EnhancedUserSchema.index({ lastLoginAt: -1 })
// Ensure apiKeys.keyId is unique only when present. sparse: true makes the unique constraint ignore documents
// where the indexed field is missing or null, preventing duplicate key errors for empty arrays.
EnhancedUserSchema.index({ 'apiKeys.keyId': 1 }, { unique: true, sparse: true })

export default mongoose.models.EnhancedUser || mongoose.model<IEnhancedUser>('EnhancedUser', EnhancedUserSchema)
