import mongoose, { Schema, Document } from 'mongoose';

export interface IApp extends Document {
  _id: string;
  name: string;
  description?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  website?: string;
  iconUrl?: string;
  scopes: string[];
  ownerId: string;
  status: 'active' | 'suspended' | 'pending';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Security settings
  rateLimit: {
    requestsPerHour: number;
    burstLimit: number;
  };
  
  // Usage statistics
  stats: {
    totalTokensIssued: number;
    activeTokens: number;
    lastUsed?: Date;
    totalRequests: number;
  };
  
  // Security flags
  security: {
    requirePKCE: boolean;
    allowedOrigins: string[];
    trustedApp: boolean;
    autoApprove: boolean;
  };
}

const AppSchema = new Schema<IApp>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  clientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clientSecret: {
    type: String,
    required: true,
    select: false // Don't include in regular queries
  },
  redirectUri: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Allow custom schemes for desktop apps
        return /^(https?:\/\/|[a-z][a-z0-9+.-]*:\/\/)/.test(v);
      },
      message: 'Invalid redirect URI format'
    }
  },
  website: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  iconUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Icon URL must be a valid URL'
    }
  },
  scopes: [{
    type: String,
    enum: [
      'profile:read',
      'profile:write',
      'email:read',
      'models:read',
      'models:write',
      'analytics:read',
      'admin:read'
    ]
  }],
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Security settings
  rateLimit: {
    requestsPerHour: {
      type: Number,
      default: 1000,
      min: 100,
      max: 10000
    },
    burstLimit: {
      type: Number,
      default: 100,
      min: 10,
      max: 1000
    }
  },
  
  // Usage statistics
  stats: {
    totalTokensIssued: {
      type: Number,
      default: 0
    },
    activeTokens: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    totalRequests: {
      type: Number,
      default: 0
    }
  },
  
  // Security flags
  security: {
    requirePKCE: {
      type: Boolean,
      default: true
    },
    allowedOrigins: [String],
    trustedApp: {
      type: Boolean,
      default: false
    },
    autoApprove: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
AppSchema.index({ ownerId: 1, status: 1 });
AppSchema.index({ clientId: 1 }, { unique: true });
AppSchema.index({ status: 1, isVerified: 1 });
AppSchema.index({ 'stats.lastUsed': 1 });
AppSchema.index({ createdAt: 1 });

// Generate client credentials before saving
AppSchema.pre('save', async function(next) {
  if (this.isNew) {
    const crypto = await import('crypto');
    this.clientId = `eq_${crypto.randomBytes(16).toString('hex')}`;
    this.clientSecret = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Virtual for public app info (without secrets)
AppSchema.virtual('publicInfo').get(function() {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    website: this.website,
    iconUrl: this.iconUrl,
    scopes: this.scopes,
    isVerified: this.isVerified,
    status: this.status,
    createdAt: this.createdAt,
    stats: {
      totalRequests: this.stats.totalRequests,
      lastUsed: this.stats.lastUsed
    }
  };
});

export default mongoose.models.App || mongoose.model<IApp>('App', AppSchema);
