'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ExtendedSession, UserData } from "./types";
import { AUTH_CONFIG } from "./auth-config";

/**
 * Custom hook for authentication in client components
 */
export function useAuth() {
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(status === "loading");
  const isAuthenticated = status === "authenticated";
  
  useEffect(() => {
    setIsLoading(status === "loading");
  }, [status]);
  
  // Auto-refresh token when session has error
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      // Force sign in to get a new session
      signIn();
    }
  }, [session]);
  
  const login = async (provider: string, callbackUrl?: string) => {
    setIsLoading(true);
    try {
      return await signIn(provider, { 
        callbackUrl: callbackUrl || window.location.href,
        redirect: true
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return null;
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      
      setIsLoading(false);
      return {
        success: !result?.error,
        message: result?.error || "Login successful",
        result
      };
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return {
        success: false,
        message: "An unexpected error occurred"
      };
    }
  };

  const logout = async (callbackUrl?: string) => {
    setIsLoading(true);
    try {
      await signOut({ 
        callbackUrl: callbackUrl || "/",
        redirect: true
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  };

  const hasRole = (role: string | string[]): boolean => {
    const user = session?.user as UserData | undefined;
    // Check if user exists and has role property
    if (!user || !user.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return {
    user: session?.user as UserData | undefined,
    isAuthenticated,
    isLoading,
    login,
    loginWithCredentials,
    loginWithGoogle: () => login("google"),
    loginWithGithub: () => login("github"),
    logout,
    refreshSession,
    hasRole,
    session: session as ExtendedSession | null,
  };
}

/**
 * Hook to protect client-side routes that require authentication
 */
export function useProtectedRoute(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const loginPath = redirectTo || `${AUTH_CONFIG.PAGES.SIGN_IN}?callbackUrl=${encodeURIComponent(pathname || '')}`;
      router.push(loginPath);
    }
  }, [isAuthenticated, isLoading, router, pathname, redirectTo]);
  
  return { isAuthenticated, isLoading };
}

/**
 * Hook to redirect authenticated users away from auth pages
 */
export function useRedirectAuthenticated(redirectTo: string = "/") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);
  
  return { isAuthenticated, isLoading };
}
