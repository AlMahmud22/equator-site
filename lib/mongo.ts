import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached: MongooseCache = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'equators-tech'
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error)
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Import and export all models
export { default as User } from './models/User'
export { default as AccessLog } from './models/AccessLog'
export { default as TrainingLog } from './models/TrainingLog'

// Utility function to log user access
export async function logAccess(
  userId: string,
  provider: 'email' | 'google' | 'github',
  ip: string,
  userAgent: string
): Promise<void> {
  try {
    await connectDB()
    
    // Dynamic import to avoid circular dependencies
    const { default: AccessLog } = await import('./models/AccessLog')
    
    await new AccessLog({
      userId,
      loginProvider: provider,
      ipAddress: ip,
      userAgent
    }).save()
  } catch (error) {
    console.error('Failed to log access:', error)
    // Don't throw error to avoid disrupting the main flow
  }
}

export default connectDB
