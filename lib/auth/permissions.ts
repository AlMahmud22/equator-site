import { Session } from 'next-auth';
import mongoose from 'mongoose';
import { PERMISSIONS, SYSTEM_ROLES } from '@/modules/database/models/Role';

// Define types for extended session
export interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export interface ExtendedSession extends Session {
  user: ExtendedUser;
}

/**
 * Check if user has a specific permission based on their role
 * @param session User session
 * @param permission Permission to check
 * @returns Boolean indicating whether user has permission
 */
export async function checkUserPermission(
  session: Session | ExtendedSession | null, 
  permission: string
): Promise<boolean> {
  if (!session?.user) {
    return false;
  }
  
  // Ensure the user has an ID
  const userId = (session.user as any).id;
  if (!userId) {
    return false;
  }
  
  try {
    // Get user's role
    let userRole = (session.user as any).role || SYSTEM_ROLES.USER;
    
    // If no role in session, try to get it from database
    if (!userRole) {
      const { default: User } = await import('@/modules/database/models/User');
      const user = await User.findById(userId);
      
      if (!user) {
        return false;
      }
      
      userRole = user.role || SYSTEM_ROLES.USER;
    }
    
    // Admin has all permissions
    if (userRole === SYSTEM_ROLES.ADMIN) {
      return true;
    }
    
    // Get role permissions from database
    const { default: Role } = await import('@/modules/database/models/Role');
    const role = await Role.findOne({ name: userRole });
    
    if (!role) {
      return false;
    }
    
    // Check if role has the requested permission
    return role.permissions.includes(permission);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param userId User ID
 * @returns Array of permissions
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // Get user from database
    const { default: User } = await import('@/modules/database/models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return [];
    }
    
    const userRole = user.role || SYSTEM_ROLES.USER;
    
    // Admin has all permissions
    if (userRole === SYSTEM_ROLES.ADMIN) {
      return Object.values(PERMISSIONS);
    }
    
    // Get role permissions from database
    const { default: Role } = await import('@/modules/database/models/Role');
    const role = await Role.findOne({ name: userRole });
    
    if (!role) {
      return [];
    }
    
    return role.permissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if user has admin access
 * @param session User session
 * @returns Boolean indicating whether user is an admin
 */
export function isAdmin(session: Session | ExtendedSession | null): boolean {
  if (!session?.user) {
    return false;
  }
  
  return (session.user as ExtendedUser).role === SYSTEM_ROLES.ADMIN;
}

/**
 * Create a middleware to check for specific permissions
 * @param permissions Required permissions (any of these)
 * @returns Middleware function
 */
export function withPermission(permissions: string[]) {
  return async (
    req: any, 
    res: any, 
    next: () => void
  ) => {
    const session = req.session;
    
    if (!session?.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Check each permission
    for (const permission of permissions) {
      const hasPermission = await checkUserPermission(session, permission);
      
      if (hasPermission) {
        return next();
      }
    }
    
    // If we get here, user doesn't have any of the required permissions
    return res.status(403).json({ 
      success: false, 
      message: 'You do not have permission to perform this action' 
    });
  };
}
