import NextAuth, { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import UnifiedUser from '@/lib/auth/unified-user-model'
import connectDB from '@/modules/database/connection'

// Environment validation
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

// MongoDB connection
let client: MongoClient
let clientPromise: Promise<MongoClient>

try {
  client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  })
  clientPromise = client.connect()
} catch (error) {
  console.error('MongoDB client creation failed:', error)
  throw new Error('Failed to create MongoDB client')
}

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  
  // Use cookie-based sessions instead of JWT
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/',
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log('🔐 OAuth sign-in attempt:', { 
          provider: account?.provider, 
          email: user?.email,
          name: user?.name,
        })

        // Validate required data
        if (!user?.email || !account?.provider) {
          console.error('❌ Missing email or provider information')
          return false
        }
        
        // Connect to database
        await connectDB()
        
        // Find or create user in our unified model
        let unifiedUser = await UnifiedUser.findOne({ email: user.email })
        
        if (!unifiedUser) {
          console.log('👤 Creating new user for:', user.email)
          
          // Create new user with default role (will be updated in profile)
          unifiedUser = new UnifiedUser({
            name: user.name || 'Unknown User',
            email: user.email,
            image: user.image,
            provider: account.provider as 'google' | 'github',
            providerId: account.providerAccountId || user.id,
            role: 'student', // Default role, can be changed later
            preferences: {
              theme: 'dark',
              newsletter: false,
              notifications: true,
            },
            loginHistory: [],
            downloadLogs: [],
            isActive: true,
            emailVerified: true,
            lastLoginAt: new Date()
          })
          
          await unifiedUser.save()
          console.log('✅ New user created successfully')
        } else {
          console.log('👤 Existing user found:', user.email)
          
          // Update user info and login time
          unifiedUser.name = user.name || unifiedUser.name
          unifiedUser.image = user.image || unifiedUser.image
          unifiedUser.lastLoginAt = new Date()
          
          // Add to login history
          unifiedUser.loginHistory.push({
            timestamp: new Date(),
            provider: account.provider,
            ipAddress: 'unknown' // Will be improved with proper IP detection
          })
          
          // Keep only last 20 login entries
          if (unifiedUser.loginHistory.length > 20) {
            unifiedUser.loginHistory = unifiedUser.loginHistory.slice(-20)
          }
          
          await unifiedUser.save()
          console.log('✅ User info updated successfully')
        }
        
        return true
      } catch (error) {
        console.error('❌ OAuth sign-in error:', error)
        return false
      }
    },
    
    async session({ session }) {
      // Add user info to session from database
      if (session?.user?.email) {
        try {
          await connectDB()
          const unifiedUser = await UnifiedUser.findOne({ email: session.user.email })
          
          if (unifiedUser) {
            // Add custom user data to session
            ;(session.user as any).id = unifiedUser._id.toString()
            ;(session.user as any).role = unifiedUser.role
            ;(session.user as any).shortName = unifiedUser.shortName
            ;(session.user as any).provider = unifiedUser.provider
            ;(session.user as any).preferences = unifiedUser.preferences
            ;(session.user as any).isActive = unifiedUser.isActive
          }
        } catch (error) {
          console.error('Error adding user data to session:', error)
        }
      }
      
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // Handle OAuth errors
      if (url.includes('error=')) {
        console.warn('OAuth error detected in redirect:', url)
        return `${baseUrl}/auth/error?error=${new URL(url).searchParams.get('error')}`
      }
      
      // Always redirect to profile after successful login
      if (url === baseUrl || url === `${baseUrl}/` || url.includes('/callback')) {
        return `${baseUrl}/profile`
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Allow same origin URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Default to profile
      return `${baseUrl}/profile`
    },
  },
  
  events: {
    async createUser(message) {
      console.log(`✅ NextAuth user created: ${message.user.email}`)
    },
    
    async signOut({ session }) {
      console.log(`👋 User signed out: ${session?.user?.email || 'unknown'}`)
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
