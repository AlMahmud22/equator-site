import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  appId: mongoose.Types.ObjectId;
  issuedAt: Date;
  expiresAt: Date;
  refreshExpiresAt?: Date;
  scopes: string[];
  isActive: boolean;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  };
  lastUsed?: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

const TokenSchema = new Schema<IToken>({
  accessToken: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    unique: true,
    sparse: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegisteredApp',
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  refreshExpiresAt: {
    type: Date
  },
  scopes: {
    type: [String],
    default: ['profile:read']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  },
  lastUsed: Date,
  revokedAt: Date,
  revokedReason: String
}, {
  timestamps: true
});

// TTL index to automatically remove expired tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for efficient token management
TokenSchema.index({ userId: 1, isActive: 1 });
TokenSchema.index({ clientId: 1, isActive: 1 });
TokenSchema.index({ userId: 1, clientId: 1, isActive: 1 });

// Virtual methods
TokenSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

TokenSchema.virtual('isRefreshExpired').get(function() {
  if (!this.refreshExpiresAt) return true;
  return new Date() > this.refreshExpiresAt;
});

// Instance methods
TokenSchema.methods.revoke = async function(reason: string = 'manually_revoked') {
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

TokenSchema.methods.updateLastUsed = async function() {
  this.lastUsed = new Date();
  // Use model to avoid updating the entire document
  return mongoose.models.Token.updateOne(
    { _id: this._id },
    { $set: { lastUsed: this.lastUsed } }
  );
};

// Static methods
TokenSchema.statics.findByAccessToken = async function(accessToken: string) {
  return this.findOne({ 
    accessToken, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

TokenSchema.statics.findByRefreshToken = async function(refreshToken: string) {
  return this.findOne({ 
    refreshToken, 
    isActive: true,
    refreshExpiresAt: { $gt: new Date() }
  });
};

TokenSchema.statics.revokeAllForUser = async function(userId: mongoose.Types.ObjectId, reason: string = 'user_request') {
  return this.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false, revokedAt: new Date(), revokedReason: reason } }
  );
};

TokenSchema.statics.revokeAllForApp = async function(appId: mongoose.Types.ObjectId, reason: string = 'app_disabled') {
  return this.updateMany(
    { appId, isActive: true },
    { $set: { isActive: false, revokedAt: new Date(), revokedReason: reason } }
  );
};

// Pre-save hook to generate tokens
TokenSchema.pre('save', function(next) {
  if (this.isNew) {
    const crypto = require('crypto');
    if (!this.accessToken) {
      this.accessToken = crypto.randomBytes(32).toString('hex');
    }
    if (!this.refreshToken && this.refreshExpiresAt) {
      this.refreshToken = crypto.randomBytes(40).toString('hex');
    }
  }
  next();
});

export default mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);
