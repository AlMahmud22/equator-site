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
  role: 'student' | 'teacher' | 'employer' | 'developer' | 'other'
  shortName?: string // nickname or preferred name
  bio?: string
  company?: string
  location?: string
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system'
    newsletter: boolean
    notifications: boolean
  }
  
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
    enum: ['student', 'teacher', 'employer', 'developer', 'other'],
    default: 'student'
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
    }
  },
  
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
