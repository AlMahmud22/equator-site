import NextAuth, { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'

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
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
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
      }
      return session
    },
    async signIn({ user, account }) {
      try {
        // Allow sign in
        console.log('Sign in attempt:', { 
          provider: account?.provider, 
          email: user?.email,
          name: user?.name 
        })
        return true
      } catch (error) {
        console.error('Sign in error:', error)
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
