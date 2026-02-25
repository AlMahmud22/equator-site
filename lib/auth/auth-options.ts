import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

import { getMongoClient } from "@/lib/auth/mongodb";
import { AUTH_CONFIG } from "./auth-config";

// Check if auth is fully configured
const hasMongoDb = !!process.env.MONGODB_URI;
const hasGitHub = !!(AUTH_CONFIG.PROVIDERS.GITHUB.clientId && AUTH_CONFIG.PROVIDERS.GITHUB.clientSecret);
const hasGoogle = !!(AUTH_CONFIG.PROVIDERS.GOOGLE.clientId && AUTH_CONFIG.PROVIDERS.GOOGLE.clientSecret);

// Build providers array dynamically
const providers: any[] = [];

if (hasGitHub) {
  providers.push(
    GitHubProvider({
      clientId: AUTH_CONFIG.PROVIDERS.GITHUB.clientId,
      clientSecret: AUTH_CONFIG.PROVIDERS.GITHUB.clientSecret,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "user",
          authType: "github",
        };
      },
    })
  );
}

if (hasGoogle) {
  providers.push(
    GoogleProvider({
      clientId: AUTH_CONFIG.PROVIDERS.GOOGLE.clientId,
      clientSecret: AUTH_CONFIG.PROVIDERS.GOOGLE.clientSecret,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user",
          authType: "google",
        };
      },
    })
  );
}

// Log auth status
if (!hasMongoDb || providers.length === 0) {
  console.warn('⚠️  Authentication is not fully configured:');
  if (!hasMongoDb) console.warn('   - MONGODB_URI is missing');
  if (!hasGitHub) console.warn('   - GitHub OAuth credentials are missing');
  if (!hasGoogle) console.warn('   - Google OAuth credentials are missing');
  console.warn('💡 The site will run with auth features disabled');
}

/**
 * Simplified NextAuth configuration for personal portfolio
 * OAuth-only authentication for basic user tracking and download analytics
 */
export const authOptions: any = {
  // Only use MongoDB adapter if configured
  ...(hasMongoDb ? { adapter: MongoDBAdapter(getMongoClient()) } : {}),
  providers,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: AUTH_CONFIG.JWT.SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: AUTH_CONFIG.PAGES.SIGN_IN,
    error: AUTH_CONFIG.PAGES.ERROR,
  },
  callbacks: {
    /**
     * JWT callback - add basic user info to token
     */
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.authType = (user as any).authType;

        // Add access token from OAuth provider if available
        if (account?.access_token) {
          token.accessToken = account.access_token;
        }
      }
      return token;
    },
    
    /**
     * Session callback - expose basic user info to client
     */
    async session({ session, token }: any) {
      if (token && session.user) {
        const user = session.user as any;
        user.id = token.id as string;
        user.role = token.role as string;
        user.authType = token.authType as string;
      }
      return session;
    },
    
    /**
     * Redirect callback - handle custom protocol redirects for desktop apps
     */
    async redirect({ url, baseUrl }: any) {
      // Check for custom protocol redirects (Electron apps)
      for (const protocol of AUTH_CONFIG.ELECTRON.PROTOCOLS) {
        if (url.startsWith(`${protocol}://`)) {
          return url;
        }
      }

      // If redirecting from login, go to profile page
      if (url === baseUrl || url === `${baseUrl}/` || url.endsWith('/auth/login')) {
        return `${baseUrl}/profile`;
      }

      // Default to relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allow same-origin redirects
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return `${baseUrl}/profile`;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
