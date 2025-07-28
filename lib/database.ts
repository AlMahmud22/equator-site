import mongoose from 'mongoose'

// Strict environment variable validation - NO FALLBACKS
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI || MONGODB_URI.trim() === '') {
  console.error('❌ FATAL: MONGODB_URI is not defined or empty');
  console.error('❌ Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
  console.error('❌ Current value:', MONGODB_URI);
  throw new Error('MONGODB_URI is not defined - cannot connect to database')
}

// Prevent localhost fallbacks in production
if (process.env.NODE_ENV === 'production' && (
  MONGODB_URI.includes('localhost') || 
  MONGODB_URI.includes('127.0.0.1') || 
  MONGODB_URI.includes(':27017')
)) {
  throw new Error('Production environment cannot use localhost MongoDB connection')
}

console.log('🔗 Database URI configured:', MONGODB_URI.substring(0, 30) + '...')

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
    console.log('🔄 Using cached MongoDB connection');
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'equators-tech',
      // Enhanced connection options for production stability
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    console.log('🔗 URI:', MONGODB_URI!.substring(0, 30) + '...');

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB Atlas');
      console.log('🏢 Database:', mongoose.connection.name);
      console.log('🌐 Host:', mongoose.connection.host);
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('❌ Connection string starts with:', MONGODB_URI!.substring(0, 30));
      
      // Clear the failed promise so it can be retried
      cached.promise = null;
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

export default connectDB
