import mongoose, { Schema, Document } from 'mongoose';

export interface IAppToken extends Document {
  _id: string;
  appId: string;
  userId: string;
  tokenType: 'access' | 'refresh' | 'authorization_code';
  
  // Token data
  accessToken?: string;
  refreshToken?: string;
  authorizationCode?: string;
  
  // Scopes and permissions
  scopes: string[];
  grantedPermissions: string[];
  
  // Expiration
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  authorizationCodeExpiresAt?: Date;
  
  // PKCE for security
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  
  // Security tracking
  issuedAt: Date;
  lastUsed?: Date;
  ipAddress?: string;
  userAgent?: string;
  
  // Status
  status: 'active' | 'revoked' | 'expired';
  revokedAt?: Date;
  revokedReason?: string;
  
  // Usage tracking
  usage: {
    requestCount: number;
    lastRequest?: Date;
    errorCount: number;
    lastError?: Date;
  };
}

const AppTokenSchema = new Schema<IAppToken>({
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
  tokenType: {
    type: String,
    enum: ['access', 'refresh', 'authorization_code'],
    required: true
  },
  
  // Token data
  accessToken: {
    type: String,
    select: false // Sensitive data
  },
  refreshToken: {
    type: String,
    select: false // Sensitive data
  },
  authorizationCode: {
    type: String,
    select: false // Sensitive data
  },
  
  // Scopes and permissions
  scopes: [{
    type: String,
    required: true
  }],
  grantedPermissions: [{
    type: String
  }],
  
  // Expiration
  accessTokenExpiresAt: Date,
  refreshTokenExpiresAt: Date,
  authorizationCodeExpiresAt: Date,
  
  // PKCE for security
  codeChallenge: String,
  codeChallengeMethod: {
    type: String,
    enum: ['S256', 'plain']
  },
  
  // Security tracking
  issuedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  lastUsed: Date,
  ipAddress: String,
  userAgent: String,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  revokedAt: Date,
  revokedReason: String,
  
  // Usage tracking
  usage: {
    requestCount: {
      type: Number,
      default: 0
    },
    lastRequest: Date,
    errorCount: {
      type: Number,
      default: 0
    },
    lastError: Date
  }
}, {
  timestamps: true
});

// Compound indexes for performance
AppTokenSchema.index({ appId: 1, userId: 1 });
AppTokenSchema.index({ appId: 1, tokenType: 1, status: 1 });
AppTokenSchema.index({ userId: 1, status: 1 });
AppTokenSchema.index({ accessToken: 1 }, { unique: true, sparse: true });
AppTokenSchema.index({ refreshToken: 1 }, { unique: true, sparse: true });
AppTokenSchema.index({ authorizationCode: 1 }, { unique: true, sparse: true });
AppTokenSchema.index({ accessTokenExpiresAt: 1 });
AppTokenSchema.index({ refreshTokenExpiresAt: 1 });
AppTokenSchema.index({ authorizationCodeExpiresAt: 1 });
AppTokenSchema.index({ issuedAt: 1 });

// TTL indexes for automatic cleanup
AppTokenSchema.index({ accessTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });
AppTokenSchema.index({ refreshTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });
AppTokenSchema.index({ authorizationCodeExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Automatic status update based on expiration
AppTokenSchema.pre('find', function() {
  this.where({
    $or: [
      { status: { $ne: 'expired' } },
      {
        $and: [
          { status: 'expired' },
          {
            $or: [
              { accessTokenExpiresAt: { $gt: new Date() } },
              { refreshTokenExpiresAt: { $gt: new Date() } },
              { authorizationCodeExpiresAt: { $gt: new Date() } }
            ]
          }
        ]
      }
    ]
  });
});

AppTokenSchema.pre('findOne', function() {
  this.where({
    $or: [
      { status: { $ne: 'expired' } },
      {
        $and: [
          { status: 'expired' },
          {
            $or: [
              { accessTokenExpiresAt: { $gt: new Date() } },
              { refreshTokenExpiresAt: { $gt: new Date() } },
              { authorizationCodeExpiresAt: { $gt: new Date() } }
            ]
          }
        ]
      }
    ]
  });
});

// Methods
AppTokenSchema.methods.isExpired = function(): boolean {
  const now = new Date();
  
  if (this.tokenType === 'access' && this.accessTokenExpiresAt) {
    return this.accessTokenExpiresAt < now;
  }
  
  if (this.tokenType === 'refresh' && this.refreshTokenExpiresAt) {
    return this.refreshTokenExpiresAt < now;
  }
  
  if (this.tokenType === 'authorization_code' && this.authorizationCodeExpiresAt) {
    return this.authorizationCodeExpiresAt < now;
  }
  
  return false;
};

AppTokenSchema.methods.revoke = function(reason?: string) {
  this.status = 'revoked';
  this.revokedAt = new Date();
  if (reason) this.revokedReason = reason;
  return this.save();
};

AppTokenSchema.methods.updateUsage = function() {
  this.usage.requestCount += 1;
  this.usage.lastRequest = new Date();
  this.lastUsed = new Date();
  return this.save();
};

AppTokenSchema.methods.recordError = function() {
  this.usage.errorCount += 1;
  this.usage.lastError = new Date();
  return this.save();
};

export default mongoose.models.AppToken || mongoose.model<IAppToken>('AppToken', AppTokenSchema);
