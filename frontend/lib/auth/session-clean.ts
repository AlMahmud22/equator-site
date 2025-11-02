import { ExtendedSession, ExtendedUser } from "./types";

/**
 * Get the server session with proper typing
 */
export async function getServerSessionSafe(): Promise<ExtendedSession | null> {
  return null; // Simplified for now - server-side auth needs proper NextAuth v5 setup
}

/**
 * Get the current user from the server session
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  const session = await getServerSessionSafe();
  return session?.user || null;
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSessionSafe();
  return !!session?.user;
}

/**
 * Check if the user has a specific role
 */
export async function hasRole(role: string | string[]): Promise<boolean> {
  const session = await getServerSessionSafe();
  if (!session?.user?.role) return false;
  
  if (Array.isArray(role)) {
    return role.includes(session.user.role);
  }
  
  return session.user.role === role;
}
