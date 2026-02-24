import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    required: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// System roles that cannot be deleted or modified by users
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  APP_DEVELOPER: 'app_developer',
  MODERATOR: 'moderator',
};

// All available permissions in the system
export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Profile permissions
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',
  
  // App permissions
  APP_READ: 'app:read',
  APP_CREATE: 'app:create',
  APP_UPDATE: 'app:update',
  APP_DELETE: 'app:delete',
  
  // Token permissions
  TOKEN_READ: 'token:read',
  TOKEN_CREATE: 'token:create',
  TOKEN_REVOKE: 'token:revoke',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  ADMIN_USERS: 'admin:users',
  ADMIN_APPS: 'admin:apps',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_SYSTEM: 'admin:system',
};

// Default role configurations
export const DEFAULT_ROLES = [
  {
    name: SYSTEM_ROLES.ADMIN,
    description: 'Full administrative access',
    permissions: Object.values(PERMISSIONS),
    isSystem: true
  },
  {
    name: SYSTEM_ROLES.USER,
    description: 'Regular user with basic permissions',
    permissions: [
      PERMISSIONS.PROFILE_READ,
      PERMISSIONS.PROFILE_UPDATE
    ],
    isSystem: true
  },
  {
    name: SYSTEM_ROLES.APP_DEVELOPER,
    description: 'Can create and manage their own apps',
    permissions: [
      PERMISSIONS.PROFILE_READ,
      PERMISSIONS.PROFILE_UPDATE,
      PERMISSIONS.APP_READ,
      PERMISSIONS.APP_CREATE,
      PERMISSIONS.APP_UPDATE,
      PERMISSIONS.APP_DELETE,
      PERMISSIONS.TOKEN_READ,
      PERMISSIONS.TOKEN_CREATE,
      PERMISSIONS.TOKEN_REVOKE
    ],
    isSystem: true
  },
  {
    name: SYSTEM_ROLES.MODERATOR,
    description: 'Can moderate users and apps',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.APP_READ,
      PERMISSIONS.TOKEN_READ,
      PERMISSIONS.TOKEN_REVOKE,
      PERMISSIONS.ADMIN_ACCESS
    ],
    isSystem: true
  }
];

RoleSchema.statics.findByName = async function(name: string) {
  return this.findOne({ name });
};

RoleSchema.statics.ensureSystemRoles = async function() {
  const promises = DEFAULT_ROLES.map(role => 
    this.findOneAndUpdate(
      { name: role.name }, 
      { ...role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  );
  
  return Promise.all(promises);
};

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
