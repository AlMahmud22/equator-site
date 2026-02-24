import mongoose, { Document, Schema } from 'mongoose'

export interface IRegisteredApp extends Document {
  // App identification
  clientId: string
  clientSecret: string
  name: string
  description?: string
  
  // Authentication settings
  redirectUris: string[]
  allowedOrigins: string[]
  scopes: string[]
  
  // App metadata
  appType: 'desktop' | 'mobile' | 'web' | 'api'
  platform?: string // windows, macos, linux, ios, android, etc.
  version?: string
  
  // Security settings
  pkceRequired: boolean
  confidential: boolean // public or confidential client
  
  // Token settings
  accessTokenTtl: number // seconds
  refreshTokenTtl: number // seconds
  
  // App management
  ownerId: string // user who registered the app
  isActive: boolean
  isApproved: boolean // admin approval required
  
  // Usage statistics
  stats: {
    totalTokensIssued: number
    totalUsersAuthorized: number
    lastUsedAt?: Date
    activeUsers: number
  }
  
  // Audit trail
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy?: string
}

const RegisteredAppSchema = new Schema<IRegisteredApp>({
  clientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Authentication settings
  redirectUris: [{
    type: String,
    required: true,
    validate: {
      validator: function(uri: string) {
        // Allow custom protocols for desktop apps and standard URLs
        return /^(https?:\/\/|[a-z][a-z0-9+.-]*:\/\/)/.test(uri)
      },
      message: 'Invalid redirect URI format'
    }
  }],
  allowedOrigins: [{
    type: String
  }],
  scopes: [{
    type: String,
    enum: ['read', 'write', 'profile', 'downloads', 'admin']
  }],
  
  // App metadata
  appType: {
    type: String,
    enum: ['desktop', 'mobile', 'web', 'api'],
    required: true
  },
  platform: {
    type: String,
    enum: ['windows', 'macos', 'linux', 'ios', 'android', 'web', 'api', 'cross-platform']
  },
  version: {
    type: String,
    trim: true
  },
  
  // Security settings
  pkceRequired: {
    type: Boolean,
    default: true // PKCE is recommended for all app types
  },
  confidential: {
    type: Boolean,
    default: false // Most desktop/mobile apps are public clients
  },
  
  // Token settings
  accessTokenTtl: {
    type: Number,
    default: 3600, // 1 hour
    min: 300, // 5 minutes minimum
    max: 86400 // 24 hours maximum
  },
  refreshTokenTtl: {
    type: Number,
    default: 2592000, // 30 days
    min: 86400, // 1 day minimum
    max: 31536000 // 1 year maximum
  },
  
  // App management
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false // Requires admin approval
  },
  
  // Usage statistics
  stats: {
    totalTokensIssued: {
      type: Number,
      default: 0
    },
    totalUsersAuthorized: {
      type: Number,
      default: 0
    },
    lastUsedAt: {
      type: Date
    },
    activeUsers: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  collection: 'registered_apps'
})

// Indexes for performance
RegisteredAppSchema.index({ ownerId: 1, isActive: 1 })
RegisteredAppSchema.index({ appType: 1, isApproved: 1 })
RegisteredAppSchema.index({ 'stats.lastUsedAt': -1 })

// Pre-save middleware to generate client credentials
RegisteredAppSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate client ID and secret
    const crypto = require('crypto')
    
    if (!this.clientId) {
      this.clientId = `eq_${crypto.randomBytes(16).toString('hex')}`
    }
    
    if (!this.clientSecret) {
      this.clientSecret = crypto.randomBytes(32).toString('hex')
    }
    
    this.createdBy = this.ownerId
  }
  
  next()
})

// Methods
RegisteredAppSchema.methods.updateStats = function(operation: 'token_issued' | 'user_authorized' | 'user_active') {
  switch (operation) {
    case 'token_issued':
      this.stats.totalTokensIssued += 1
      break
    case 'user_authorized':
      this.stats.totalUsersAuthorized += 1
      break
    case 'user_active':
      this.stats.activeUsers += 1
      break
  }
  this.stats.lastUsedAt = new Date()
}

RegisteredAppSchema.methods.isValidRedirectUri = function(uri: string): boolean {
  return this.redirectUris.includes(uri)
}

RegisteredAppSchema.methods.hasScope = function(scope: string): boolean {
  return this.scopes.includes(scope)
}

const RegisteredApp = mongoose.models.RegisteredApp || mongoose.model<IRegisteredApp>('RegisteredApp', RegisteredAppSchema)

export default RegisteredApp
