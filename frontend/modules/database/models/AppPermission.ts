import mongoose, { Schema, Document } from 'mongoose';

export interface IAppPermission extends Document {
  _id: string;
  appId: string;
  userId: string;
  scopes: string[];
  permissions: {
    [key: string]: {
      granted: boolean;
      grantedAt: Date;
      expiresAt?: Date;
      conditions?: {
        ipRestrictions?: string[];
        timeRestrictions?: {
          allowedHours: number[];
          timezone: string;
        };
        rateLimit?: {
          requestsPerMinute: number;
          requestsPerHour: number;
          requestsPerDay: number;
        };
      };
    };
  };
  
  // Approval tracking
  approvalStatus: 'pending' | 'approved' | 'denied' | 'revoked';
  approvedAt?: Date;
  approvedBy?: string; // Admin user ID who approved
  deniedAt?: Date;
  deniedReason?: string;
  revokedAt?: Date;
  revokedReason?: string;
  
  // Security settings
  requireReapproval: boolean;
  autoApprove: boolean;
  lastReviewedAt?: Date;
  
  // Usage tracking
  usage: {
    totalRequests: number;
    lastUsed?: Date;
    requestsByScope: {
      [scope: string]: {
        count: number;
        lastUsed?: Date;
      };
    };
  };
  
  // Audit trail
  auditLog: {
    action: 'granted' | 'modified' | 'revoked' | 'used';
    timestamp: Date;
    performedBy?: string;
    details?: any;
    ipAddress?: string;
  }[];
}

// Available permission scopes
export const AVAILABLE_SCOPES = {
  'profile:read': {
    name: 'Read Profile',
    description: 'Read basic profile information (name, avatar, etc.)',
    category: 'Profile',
    sensitive: false
  },
  'profile:write': {
    name: 'Write Profile',
    description: 'Update profile information',
    category: 'Profile',
    sensitive: true
  },
  'email:read': {
    name: 'Read Email',
    description: 'Access email address',
    category: 'Contact',
    sensitive: true
  },
  'models:read': {
    name: 'Read Models',
    description: 'View AI models and configurations',
    category: 'Models',
    sensitive: false
  },
  'models:write': {
    name: 'Write Models',
    description: 'Create and modify AI models',
    category: 'Models',
    sensitive: true
  },
  'analytics:read': {
    name: 'Read Analytics',
    description: 'View usage analytics and statistics',
    category: 'Analytics',
    sensitive: true
  },
  'admin:read': {
    name: 'Admin Read',
    description: 'Read administrative data (requires admin approval)',
    category: 'Administration',
    sensitive: true,
    requiresAdminApproval: true
  }
} as const;

const AppPermissionSchema = new Schema<IAppPermission>({
  appId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  scopes: [{
    type: String,
    enum: Object.keys(AVAILABLE_SCOPES),
    required: true
  }],
  permissions: {
    type: Map,
    of: {
      granted: {
        type: Boolean,
        required: true
      },
      grantedAt: {
        type: Date,
        required: true
      },
      expiresAt: Date,
      conditions: {
        ipRestrictions: [String],
        timeRestrictions: {
          allowedHours: [Number],
          timezone: String
        },
        rateLimit: {
          requestsPerMinute: Number,
          requestsPerHour: Number,
          requestsPerDay: Number
        }
      }
    }
  },
  
  // Approval tracking
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'revoked'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: String,
  deniedAt: Date,
  deniedReason: String,
  revokedAt: Date,
  revokedReason: String,
  
  // Security settings
  requireReapproval: {
    type: Boolean,
    default: false
  },
  autoApprove: {
    type: Boolean,
    default: false
  },
  lastReviewedAt: Date,
  
  // Usage tracking
  usage: {
    totalRequests: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    requestsByScope: {
      type: Map,
      of: {
        count: {
          type: Number,
          default: 0
        },
        lastUsed: Date
      }
    }
  },
  
  // Audit trail
  auditLog: [{
    action: {
      type: String,
      enum: ['granted', 'modified', 'revoked', 'used'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    performedBy: String,
    details: Schema.Types.Mixed,
    ipAddress: String
  }]
}, {
  timestamps: true
});

// Compound indexes
AppPermissionSchema.index({ appId: 1, userId: 1 }, { unique: true });
AppPermissionSchema.index({ userId: 1, approvalStatus: 1 });
AppPermissionSchema.index({ appId: 1, approvalStatus: 1 });
AppPermissionSchema.index({ approvalStatus: 1, createdAt: 1 });
AppPermissionSchema.index({ 'usage.lastUsed': 1 });

// Methods
AppPermissionSchema.methods.hasScope = function(scope: string): boolean {
  return this.scopes.includes(scope) && 
         this.permissions.get(scope)?.granted === true &&
         this.approvalStatus === 'approved';
};

AppPermissionSchema.methods.grantScope = function(scope: string, conditions?: any) {
  if (!this.scopes.includes(scope)) {
    this.scopes.push(scope);
  }
  
  this.permissions.set(scope, {
    granted: true,
    grantedAt: new Date(),
    conditions: conditions || {}
  });
  
  this.auditLog.push({
    action: 'granted',
    timestamp: new Date(),
    details: { scope, conditions }
  });
  
  return this.save();
};

AppPermissionSchema.methods.revokeScope = function(scope: string, reason?: string) {
  const permission = this.permissions.get(scope);
  if (permission) {
    permission.granted = false;
    this.permissions.set(scope, permission);
  }
  
  this.auditLog.push({
    action: 'revoked',
    timestamp: new Date(),
    details: { scope, reason }
  });
  
  return this.save();
};

AppPermissionSchema.methods.recordUsage = function(scope: string) {
  this.usage.totalRequests += 1;
  this.usage.lastUsed = new Date();
  
  const scopeUsage = this.usage.requestsByScope.get(scope) || { count: 0 };
  scopeUsage.count += 1;
  scopeUsage.lastUsed = new Date();
  this.usage.requestsByScope.set(scope, scopeUsage);
  
  this.auditLog.push({
    action: 'used',
    timestamp: new Date(),
    details: { scope }
  });
  
  return this.save();
};

AppPermissionSchema.methods.approve = function(approvedBy?: string) {
  this.approvalStatus = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = approvedBy;
  this.lastReviewedAt = new Date();
  
  this.auditLog.push({
    action: 'granted',
    timestamp: new Date(),
    performedBy: approvedBy,
    details: { approvalStatus: 'approved' }
  });
  
  return this.save();
};

AppPermissionSchema.methods.deny = function(reason: string, deniedBy?: string) {
  this.approvalStatus = 'denied';
  this.deniedAt = new Date();
  this.deniedReason = reason;
  this.lastReviewedAt = new Date();
  
  this.auditLog.push({
    action: 'revoked',
    timestamp: new Date(),
    performedBy: deniedBy,
    details: { approvalStatus: 'denied', reason }
  });
  
  return this.save();
};

AppPermissionSchema.methods.revoke = function(reason: string, revokedBy?: string) {
  this.approvalStatus = 'revoked';
  this.revokedAt = new Date();
  this.revokedReason = reason;
  
  this.auditLog.push({
    action: 'revoked',
    timestamp: new Date(),
    performedBy: revokedBy,
    details: { approvalStatus: 'revoked', reason }
  });
  
  return this.save();
};

export default mongoose.models.AppPermission || mongoose.model<IAppPermission>('AppPermission', AppPermissionSchema);
