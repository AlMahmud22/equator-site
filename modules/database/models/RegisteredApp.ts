import mongoose, { Schema, Document } from 'mongoose';

export interface IRegisteredApp extends Document {
  name: string;
  description: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  allowedOrigins: string[];
  ownerId: mongoose.Types.ObjectId;
  ownerEmail: string;
  isVerified: boolean;
  status: 'active' | 'pending' | 'revoked' | 'suspended';
  appType: 'web' | 'native' | 'spa' | 'service';
  scopes: string[];
  webhookUrl?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    website?: string;
    privacyUrl?: string;
    tosUrl?: string;
    contactEmail?: string;
  };
  limits: {
    tokensPerUser: number;
    requestsPerDay: number;
    usersPerApp: number;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalLogins: number;
    lastUsed?: Date;
  };
}

const AppSchema = new Schema<IRegisteredApp>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  clientId: {
    type: String,
    required: true,
    unique: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  redirectUris: {
    type: [String],
    required: true,
    validate: [(uris: string[]) => uris.length > 0, 'At least one redirect URI is required']
  },
  allowedOrigins: {
    type: [String],
    default: []
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'revoked', 'suspended'],
    default: 'pending'
  },
  appType: {
    type: String,
    enum: ['web', 'native', 'spa', 'service'],
    default: 'web'
  },
  scopes: {
    type: [String],
    default: ['profile:read']
  },
  webhookUrl: String,
  logoUrl: String,
  metadata: {
    website: String,
    privacyUrl: String,
    tosUrl: String,
    contactEmail: String
  },
  limits: {
    tokensPerUser: {
      type: Number,
      default: 5
    },
    requestsPerDay: {
      type: Number,
      default: 10000
    },
    usersPerApp: {
      type: Number, 
      default: 1000
    }
  },
  stats: {
    totalUsers: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    totalLogins: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  }
}, {
  timestamps: true
});

// Efficient indexes for app querying
AppSchema.index({ ownerId: 1, status: 1 });
AppSchema.index({ clientId: 1 }, { unique: true });
AppSchema.index({ status: 1, isVerified: 1 });
AppSchema.index({ 'stats.lastUsed': 1 });

// Virtual methods
AppSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.isVerified;
});

// Instance methods
AppSchema.methods.recordLogin = async function() {
  this.stats.totalLogins += 1;
  this.stats.lastUsed = new Date();
  
  if (this.stats.totalLogins % 10 === 0) {
    // Only save every 10 logins to reduce DB writes
    return this.save();
  }
  
  return true;
};

AppSchema.methods.updateActiveUsers = async function(count: number) {
  this.stats.activeUsers = count;
  return this.save();
};

// Static methods
AppSchema.statics.findByClientId = async function(clientId: string) {
  return this.findOne({ clientId, status: 'active', isVerified: true });
};

// Pre-save hook to generate client ID and secret if not provided
AppSchema.pre('save', async function(next) {
  if (this.isNew && !this.clientId) {
    const crypto = require('crypto');
    this.clientId = `eq_${crypto.randomBytes(16).toString('hex')}`;
    this.clientSecret = crypto.randomBytes(32).toString('hex');
  }
  next();
});

export default mongoose.models.RegisteredApp || mongoose.model<IRegisteredApp>('RegisteredApp', AppSchema);
