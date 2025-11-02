'use client';

/**
 * Electron-specific authentication utilities for desktop apps
 * This file provides helpers for Electron apps to integrate with the auth system
 */

import { AUTH_CONFIG } from "../auth-config";
import { TokenResponse } from "../types";

/**
 * Parse token from OAuth redirect URL
 * Used when Electron app receives the callback from web OAuth flow
 */
export function parseTokenFromRedirect(url: string): { 
  accessToken: string; 
  refreshToken?: string;
} | null {
  try {
    const parsedUrl = new URL(url);
    const accessToken = parsedUrl.searchParams.get("token");
    const refreshToken = parsedUrl.searchParams.get("refreshToken");
    
    if (!accessToken) return null;
    
    return { 
      accessToken, 
      refreshToken: refreshToken || undefined
    };
  } catch (error) {
    console.error("Failed to parse redirect URL:", error);
    return null;
  }
}

/**
 * Generate the OAuth URL for Electron apps
 */
export function getElectronOAuthUrl(provider: "github" | "google", protocol: string): string {
  // Ensure protocol is registered
  if (!AUTH_CONFIG.ELECTRON.PROTOCOLS.includes(protocol)) {
    throw new Error(`Unregistered protocol: ${protocol}`);
  }
  
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/oauth?provider=${provider}&redirect=${encodeURIComponent(`${protocol}://auth/callback`)}`;
}

/**
 * Get token exchange URL for Electron apps
 */
export function getTokenExchangeUrl(protocol: string): string {
  // Ensure protocol is registered
  if (!AUTH_CONFIG.ELECTRON.PROTOCOLS.includes(protocol)) {
    throw new Error(`Unregistered protocol: ${protocol}`);
  }
  
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/token/exchange?protocol=${protocol}`;
}

/**
 * Store auth tokens securely in Electron
 * Note: This is a placeholder - in real Electron app, use secure storage
 */
export function storeTokensSecurely(tokens: { 
  accessToken: string; 
  refreshToken?: string;
  expiresAt?: number;
}): void {
  if (typeof window !== 'undefined') {
    // In a real Electron app, use:
    // 1. Electron's safeStorage.encryptString to encrypt tokens
    // 2. Store in a secure location based on OS
    localStorage.setItem('eq_access_token', tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem('eq_refresh_token', tokens.refreshToken);
    }
    if (tokens.expiresAt) {
      localStorage.setItem('eq_token_expiry', tokens.expiresAt.toString());
    } else {
      // Default expiry is 7 days from now
      localStorage.setItem(
        'eq_token_expiry', 
        (Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)).toString()
      );
    }
  }
}

/**
 * Get stored auth tokens
 */
export function getStoredTokens(): TokenResponse | null {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem('eq_access_token');
  const refreshToken = localStorage.getItem('eq_refresh_token') || undefined;
  const expiresAt = localStorage.getItem('eq_token_expiry');
  
  if (!accessToken) return null;
  
  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAt ? parseInt(expiresAt) * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000,
    tokenType: "Bearer"
  };
}

/**
 * Clear stored auth tokens
 */
export function clearStoredTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('eq_access_token');
    localStorage.removeItem('eq_refresh_token');
    localStorage.removeItem('eq_token_expiry');
  }
}

/**
 * Check if token is expiring soon
 */
export function isTokenExpiringSoon(): boolean {
  if (typeof window === 'undefined') return false;
  
  const expiryStr = localStorage.getItem('eq_token_expiry');
  if (!expiryStr) return true;
  
  const expiry = parseInt(expiryStr) * 1000; // Convert to milliseconds
  const now = Date.now();
  
  // Check if token expires within buffer time (5 minutes by default)
  return (expiry - now) < (AUTH_CONFIG.ELECTRON.TOKEN_EXPIRY_BUFFER * 1000);
}

/**
 * Decode JWT token payload
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}
