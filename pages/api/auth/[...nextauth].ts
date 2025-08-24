import NextAuth, { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import EnhancedUser from '@/modules/database/models/EnhancedUser'
import AccessLog from '@/modules/database/models/AccessLog'
import connectDB from '@/modules/database/connection'

// Rate limiting map for authentication attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_AUTH_ATTEMPTS = 5
const AUTH_COOLDOWN = 15 * 60 * 1000 // 15 minutes

// Helper function to get client IP
function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  )
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
  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return { isSuspicious: true, reason: 'Bot-like user agent detected' }
  }
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    return { isSuspicious: true, reason: 'Missing or suspicious user agent' }
  }
  
  // Check for private/internal IP addresses (basic check)
  if (
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.') ||
    ipAddress === '127.0.0.1' ||
    ipAddress === 'localhost'
  ) {
    // Allow local development
    if (process.env.NODE_ENV === 'development') {
      return { isSuspicious: false }
    }
  }
  
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
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
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
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
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
        // Get request info for security logging
        const req = (this as any).req || {}
        const ipAddress = getClientIp(req)
        const userAgent = req.headers?.['user-agent'] || 'Unknown'
        
        // Rate limiting check
        if (!checkRateLimit(ipAddress)) {
          console.warn(`Rate limit exceeded for IP: ${ipAddress}`)
          await logActivity(
            user.id || null,
            'sign_in_rate_limited',
            account?.provider || 'unknown',
            ipAddress,
            userAgent,
            false,
            { email: user.email }
          )
          return false
        }
        
        // Suspicious activity detection
        const suspiciousCheck = detectSuspiciousActivity(
          ipAddress,
          userAgent
        )
        
        if (suspiciousCheck.isSuspicious) {
          console.warn(`Suspicious activity detected: ${suspiciousCheck.reason}`, {
            ip: ipAddress,
            userAgent,
            email: user.email
          })
          
          await logActivity(
            user.id || null,
            'sign_in_suspicious',
            account?.provider || 'unknown',
            ipAddress,
            userAgent,
            false,
            { 
              email: user.email,
              reason: suspiciousCheck.reason
            }
          )
          
          // In production, you might want to block suspicious attempts
          // For now, we'll allow but log them
          if (process.env.NODE_ENV === 'production') {
            // return false // Uncomment to block suspicious attempts
          }
        }
        
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
        
        // Update login history
        enhancedUser.loginHistory.push({
          timestamp: new Date(),
          provider: account?.provider || 'unknown',
          ipAddress,
          userAgent
        })
        
        // Limit login history to last 50 entries
        if (enhancedUser.loginHistory.length > 50) {
          enhancedUser.loginHistory = enhancedUser.loginHistory.slice(-50)
        }
        
        // Update last login time
        enhancedUser.lastLoginAt = new Date()
        
        // Save enhanced user
        await enhancedUser.save()
        
        // Log successful sign in
        await logActivity(
          enhancedUser._id.toString(),
          'sign_in_success',
          account?.provider || 'unknown',
          ipAddress,
          userAgent,
          true,
          { 
            email: user.email,
            name: user.name
          }
        )
        
        console.log('Successful sign in:', { 
          provider: account?.provider, 
          email: user?.email,
          name: user?.name,
          ip: ipAddress
        })
        
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        
        // Log failed sign in
        const req = (this as any).req || {}
        const ipAddress = getClientIp(req)
        const userAgent = req.headers?.['user-agent'] || 'Unknown'
        
        await logActivity(
          user.id || null,
          'sign_in_error',
          account?.provider || 'unknown',
          ipAddress,
          userAgent,
          false,
          { 
            email: user.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        )
        
        return false
      }
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
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
