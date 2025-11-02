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
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      family: 4, // Use IPv4, skip trying IPv6
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    console.log('🔗 URI:', MONGODB_URI!.substring(0, 20) + '...');

    // Implement connection retry logic
    const maxRetries = 5;
    let retries = 0;
    
    const connectWithRetry = async (): Promise<typeof mongoose> => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI!, opts);
        console.log('✅ Successfully connected to MongoDB Atlas');
        console.log('🏢 Database:', mongooseInstance.connection.name);
        console.log('🌐 Host:', mongooseInstance.connection.host);
        
        // Setup connection error handler for runtime reconnection
        mongooseInstance.connection.on('error', (err) => {
          console.error('Runtime MongoDB connection error:', err);
          if (process.env.NODE_ENV === 'production') {
            console.log('Attempting to reconnect to MongoDB...');
            setTimeout(() => {
              mongoose.connect(MONGODB_URI!, opts).catch(console.error);
            }, 5000);
          }
        });
        
        return mongooseInstance;
      } catch (error: any) {
        console.error(`❌ MongoDB connection error (attempt ${retries + 1}/${maxRetries}):`, error.message);
        
        if (retries < maxRetries) {
          retries++;
          const delay = Math.min(1000 * Math.pow(2, retries), 30000); // Exponential backoff with 30s max
          console.log(`Retrying connection in ${delay/1000} seconds...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return connectWithRetry();
        }
        
        console.error(`❌ Failed to connect to MongoDB after ${maxRetries} attempts`);
        throw error;
      }
    };
    
    cached.promise = connectWithRetry();
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
