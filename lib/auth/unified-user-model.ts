import mongoose, { Document, Schema } from 'mongoose'

// Unified User interface for simplified authentication
export interface IUnifiedUser extends Document {
  // Basic info (from OAuth)
  name: string
  email: string
  image?: string
  
  // Authentication details
  provider: 'google' | 'github'
  providerId: string
  
  // User profile
  role: 'admin' | 'user' | 'visitor'
  shortName?: string // nickname or preferred name
  bio?: string
  company?: string
  location?: string
  
  // Email verification
  isEmailConfirmed?: boolean
  emailConfirmationToken?: string
  emailConfirmationSentAt?: Date
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system'
    newsletter: boolean
    notifications: boolean
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showActivity: boolean
    securityAlerts: boolean
    twoFactorEnabled: boolean
    loginAlerts: boolean
    emailNotifications: boolean
    language: string
  }

  // Privacy settings (admin only)
  privacy?: {
    dataCollection: boolean
    analytics: boolean
    marketing: boolean
  }

  // Profile information
  profile?: {
    bio: string
    visibility: 'public' | 'private'
    showEmail: boolean
    showActivity: boolean
  }
  
  // Admin-only features
  apiKeys: {
    keyId: string
    name: string
    keyHash: string
    permissions: string[]
    createdAt: Date
    lastUsedAt?: Date
    expiresAt?: Date
    isActive: boolean
  }[]
  
  sessions: {
    sessionToken: string
    deviceInfo?: {
      browser?: string
      os?: string
      device?: string
      ip?: string
    }
    createdAt: Date
    lastActiveAt: Date
    isActive: boolean
  }[]
  
  // Activity tracking (simplified)
  lastLoginAt: Date
  loginHistory: {
    timestamp: Date
    provider: string
    ipAddress?: string
  }[]
  
  downloadLogs: {
    projectId: string
    projectName: string
    downloadedAt: Date
    fileSize?: number
  }[]
  
  // Account status
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const UnifiedUserSchema = new Schema<IUnifiedUser>({
  // Basic info
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
  
  // Authentication
  provider: {
    type: String,
    enum: ['google', 'github'],
    required: true
  },
  providerId: {
    type: String,
    required: true
  },
  
  // Profile
  role: {
    type: String,
    enum: ['admin', 'user', 'visitor'],
    default: 'user'
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false
  },
  emailConfirmationToken: {
    type: String
  },
  emailConfirmationSentAt: {
    type: Date
  },
  shortName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  company: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
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
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: true
    },
    showActivity: {
      type: Boolean,
      default: true
    },
    securityAlerts: {
      type: Boolean,
      default: true
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },

  // Privacy settings (admin only)
  privacy: {
    dataCollection: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },

  // Profile information
  profile: {
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showActivity: {
      type: Boolean,
      default: true
    }
  },
  
  // API Keys (admin only)
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
    permissions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'admin']
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Sessions tracking
  sessions: [{
    sessionToken: {
      type: String,
      required: true
    },
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
      ip: String
    },
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
  
  // Activity
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    provider: String,
    ipAddress: String
  }],
  
  downloadLogs: [{
    projectId: String,
    projectName: String,
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    fileSize: Number
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: true // Auto-verified for OAuth users
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      // Remove sensitive data from JSON output
      delete (ret as any).__v
      ret.id = ret._id
      delete (ret as any)._id
      return ret
    }
  }
})

// Indexes for performance
UnifiedUserSchema.index({ email: 1 })
UnifiedUserSchema.index({ provider: 1, providerId: 1 })
UnifiedUserSchema.index({ createdAt: -1 })
UnifiedUserSchema.index({ lastLoginAt: -1 })
UnifiedUserSchema.index({ role: 1 })

// Methods
UnifiedUserSchema.methods.trackDownload = function(projectId: string, projectName: string, fileSize?: number) {
  this.downloadLogs.push({
    projectId,
    projectName,
    downloadedAt: new Date(),
    fileSize
  })
  
  // Keep only last 50 downloads
  if (this.downloadLogs.length > 50) {
    this.downloadLogs = this.downloadLogs.slice(-50)
  }
  
  return this.save()
}

UnifiedUserSchema.methods.updateProfile = function(updates: {
  name?: string
  shortName?: string
  bio?: string
  company?: string
  location?: string
  role?: string
}) {
  Object.assign(this, updates)
  return this.save()
}

export default mongoose.models.UnifiedUser || mongoose.model<IUnifiedUser>('UnifiedUser', UnifiedUserSchema)
