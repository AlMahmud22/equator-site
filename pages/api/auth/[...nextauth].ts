import NextAuth, { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import EnhancedUser from '@/modules/database/models/EnhancedUser'
import AccessLog from '@/modules/database/models/AccessLog'
import connectDB from '@/modules/database/connection'

// SIMPLIFIED: Removed complex rate limiting and IP detection that was causing OAuth issues

// Helper function to log authentication activities
async function logActivity(
  userId: string | null,
  action: string,
  provider: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  metadata?: any
) {
  try {
    if (!userId && !success) {
      return // Skip logging for failed attempts without user ID
    }
    
    const logEntry = new AccessLog({
      userId,
      action,
      loginProvider: provider,
      ipAddress,
      userAgent,
      success,
      metadata: metadata || {},
      timestamp: new Date()
    })
    
    await logEntry.save()
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

// Helper function to safely get user agent
function getUserAgent(req: any): string {
  if (!req) {
    console.warn('Request object is undefined in getUserAgent');
    return 'unknown-missing-request-object';
  }
  
  if (!req.headers) {
    console.warn('Request headers are undefined in getUserAgent');
    return 'unknown-missing-headers';
  }
  
  // Try multiple header variations to ensure we get the user agent
  return req.headers['user-agent'] || 
         req.headers['User-Agent'] || 
         req.headers['USER-AGENT'] || 
         req.headers['user_agent'] || 
         'unknown-user-agent';
}

// Helper function to check rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempts = authAttempts.get(ip)
  
  if (!attempts) {
    authAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset if cooldown period has passed
  if (now - attempts.lastAttempt > AUTH_COOLDOWN) {
    authAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }
  
  // Check if max attempts exceeded
  if (attempts.count >= MAX_AUTH_ATTEMPTS) {
    return false
  }
  
  // Increment attempt count
  attempts.count++
  attempts.lastAttempt = now
  return true
}

// Helper function to log activity
async function logActivity(
  userId: string | null,
  action: string,
  provider: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  metadata?: any
) {
  try {
    await connectDB()
    
    const logEntry = new AccessLog({
      userId,
      action,
      loginProvider: provider,
      ipAddress,
      userAgent,
      success,
      metadata: metadata || {},
      timestamp: new Date()
    })
    
    await logEntry.save()
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

// Helper function to detect suspicious activity
function detectSuspiciousActivity(
  ipAddress: string,
  userAgent: string
): { isSuspicious: boolean; reason?: string } {
  // Only check for obvious bot patterns, be more permissive
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i
  ]
  
  // Only block obvious bots, allow everything else
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    // Even for bots, just log but don't block in production for now
    return { isSuspicious: false, reason: 'Bot-like user agent detected (allowing)' }
  }
  
  // Be very permissive - allow unknown user agents and IPs
  // This prevents legitimate users from being blocked
  return { isSuspicious: false }
}
if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable')
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable')
}
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error('Missing GitHub OAuth credentials')
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials')
}

// MongoDB connection with proper error handling and SSL options
let client: MongoClient
let clientPromise: Promise<MongoClient>

try {
  client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Increased timeout
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    // Simple SSL configuration - only use one option
    ssl: true,
    retryWrites: true,
    retryReads: true,
  })
  clientPromise = client.connect()
} catch (error) {
  console.error('MongoDB client creation failed:', error)
  throw new Error('Failed to create MongoDB client')
}

const authOptions: NextAuthOptions = {
  // Essential for production deployment
  secret: process.env.NEXTAUTH_SECRET,
  
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // SECURITY FIX: Remove dangerous email linking in production
      allowDangerousEmailAccountLinking: process.env.NODE_ENV === 'development',
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // SECURITY FIX: Remove dangerous email linking in production
      allowDangerousEmailAccountLinking: process.env.NODE_ENV === 'development',
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/',
    newUser: '/profile',
  },
  
  // Enhanced for production reliability
  debug: process.env.NODE_ENV === 'development',
  
  // Production-ready configuration for reverse proxy setup
  useSecureCookies: process.env.NODE_ENV === 'production',
  // COOKIE FIX: Use more compatible cookie settings for OAuth
  cookies: {
    sessionToken: {
      name: `${process.env.COOKIE_PREFIX || ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // More compatible than 'none' for OAuth flows
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    },
    callbackUrl: {
      name: `${process.env.COOKIE_PREFIX || ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax', // More compatible than 'none'
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `${process.env.COOKIE_PREFIX || ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // More compatible than 'none'
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    
    async jwt({ token, account, user, trigger }) {
      // Handle session refresh
      if (trigger === 'update') {
        // Update last activity timestamp
        token.lastActivity = Date.now()
      }
      
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
        token.sessionStart = Date.now()
        token.lastActivity = Date.now()
      }
      
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      
      // Auto-extend session for active users
      const now = Date.now()
      const lastActivity = token.lastActivity as number || now
      const timeSinceActivity = now - lastActivity
      
      // If user has been active within last 24 hours, extend session
      if (timeSinceActivity < 24 * 60 * 60 * 1000) {
        token.lastActivity = now
      }
      
      return token
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (session?.user) {
        ;(session.user as any).id = token.id as string
        ;(session as any).accessToken = token.accessToken
        ;(session as any).provider = token.provider
        ;(session as any).providerAccountId = token.providerAccountId
        ;(session as any).sessionStart = token.sessionStart
        ;(session as any).lastActivity = token.lastActivity
      }
      
      return session
    },
    
    async signIn({ user, account }) {
      try {
        // SIMPLIFIED: Remove complex IP detection and rate limiting that might block legitimate users
        console.log('OAuth sign-in attempt:', { 
          provider: account?.provider, 
          email: user?.email,
          name: user?.name
        })
        
        // Connect to database and update user record
        await connectDB()
        
        // Find or create enhanced user record
        let enhancedUser = await EnhancedUser.findOne({ email: user.email })
        
        if (!enhancedUser) {
          // Create new enhanced user
          enhancedUser = new EnhancedUser({
            name: user.name || 'Unknown User',
            email: user.email!,
            image: user.image,
            provider: account?.provider || 'unknown',
            providerId: account?.providerAccountId || user.id || 'unknown',
            displayName: user.name,
            preferences: {
              theme: 'dark',
              newsletter: false,
              notifications: true,
              privacy: {
                showEmail: false,
                showActivity: true
              }
            },
            loginHistory: [],
            downloadLogs: [],
            apiKeys: [],
            sessions: [],
            isActive: true,
            lastLoginAt: new Date()
          })
        }
        
        // Update login history (simplified)
        enhancedUser.loginHistory.push({
          timestamp: new Date(),
          provider: account?.provider || 'unknown',
          ipAddress: 'unknown', // Simplified to avoid IP detection issues
          userAgent: 'unknown'
        })
        
        // Limit login history to last 50 entries
        if (enhancedUser.loginHistory.length > 50) {
          enhancedUser.loginHistory = enhancedUser.loginHistory.slice(-50)
        }
        
        // Update last login time
        enhancedUser.lastLoginAt = new Date()
        
        // Save enhanced user
        await enhancedUser.save()
        
        // Simple success logging
        await logActivity(
          enhancedUser._id.toString(),
          'sign_in_success',
          account?.provider || 'unknown',
          'unknown',
          'unknown',
          true,
          {
            email: user.email,
            name: user.name
          }
        )
        
        console.log('✅ Successful OAuth sign in:', { 
          provider: account?.provider, 
          email: user?.email,
          name: user?.name
        })
        
        return true
      } catch (error) {
        console.error('❌ OAuth sign in error:', error)
        
        // Log failed sign in with safe fallbacks
        await logActivity(
          user?.id || null,
          'sign_in_error',
          account?.provider || 'unknown',
          'unknown',
          'unknown',
          false,
          {
            email: user?.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        )
        
        return false
      }
    },
    
    async redirect({ url, baseUrl }) {
      // Handle OAuth protocol errors like "access_denied"
      const urlObj = url.startsWith('http') ? new URL(url) : null;
      const hasError = urlObj?.searchParams?.get('error') || url.includes('error=');
      
      if (hasError) {
        console.warn(`OAuth error detected in redirect: ${hasError}`);
        // Redirect to error page with error information
        return `${baseUrl}/auth/error?error=${hasError}`;
      }
      
      // For successful logins without specific target, redirect to profile
      if (url === baseUrl || url === `${baseUrl}/` || url.endsWith('/callback')) {
        console.log('Redirecting to profile page after successful login');
        return `${baseUrl}/profile`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allows callback URLs on the same origin
      else if (urlObj && urlObj.origin === baseUrl) {
        return url;
      }
      
      // Default to profile for successful OAuth flows
      return `${baseUrl}/profile`;
    },
  },
  
  // Enhanced events for logging
  events: {
    async createUser(message) {
      console.log(`✅ New user created: ${message.user.email}`)
    },
    
    async signOut({ token }) {
      console.log(`👋 User signed out: ${token?.email || 'unknown'}`)
      
      // Log sign-out
      try {
        // NextAuth callback doesn't provide the raw req in v4/v5 callbacks reliably.
        // Use safe fallbacks instead of trying to access (this as any).req
        const ipAddress = 'unknown' // Fallback when request object isn't available
        const userAgent = 'unknown'
        
        await logActivity(
          token?.id as string || null,
          'sign_out',
          'system',
          ipAddress,
          userAgent,
          true,
          { 
            email: token?.email as string,
            timestamp: new Date().toISOString()
          }
        )
      } catch (error) {
        console.error('Failed to log sign-out event:', error)
      }
    },
  },
  
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, metadata)
      }
    },
  },
}

export default NextAuth(authOptions)
export { authOptions }
