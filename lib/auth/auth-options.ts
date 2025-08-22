import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import { getMongoClient } from "@/lib/auth/mongodb";
import { AUTH_CONFIG } from "./auth-config";

/**
 * Simplified NextAuth configuration for personal portfolio
 * OAuth-only authentication for basic user tracking and download analytics
 */
export const authOptions = {
  adapter: MongoDBAdapter(getMongoClient()),
  providers: [
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
    }),
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
    }),
  ],
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

      // Default to relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allow same-origin redirects
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
