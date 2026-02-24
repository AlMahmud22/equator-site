import { DefaultSession } from "next-auth";

/**
 * Simplified user type for personal portfolio
 */
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  authType?: "google" | "github";
}

/**
 * Simplified session type
 */
export interface ExtendedSession extends DefaultSession {
  user: ExtendedUser;
  expires: string;
  accessToken?: string;
  error?: string;
}

/**
 * Simple JWT payload
 */
export interface JWTPayload {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  authType?: "google" | "github";
  iat?: number;
  exp?: number;
  jti?: string;
}

/**
 * Token response for client-side consumption
 * Particularly useful for Electron apps
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
}

/**
 * Simplified user data structure for frontend context
 */
export interface UserData {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  authType?: "google" | "github";
}

declare module "next-auth" {
  interface Session extends ExtendedSession {}
  interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends JWTPayload {}
}
