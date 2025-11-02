/**
 * MongoDB connection utility for Next.js with Enhanced Error Handling
 * Uses singleton pattern to prevent connection issues during development hot reloads
 * Includes retry logic and comprehensive error handling for production stability
 */

import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// Enhanced connection options for production stability
const options: MongoClientOptions = {
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000, // Increased from 5s
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000, // Increased from 10s
  family: 4, // Use IPv4, skip trying IPv6
  
  // Retry logic
  retryWrites: true,
  retryReads: true,
  
  // Heartbeat and monitoring
  heartbeatFrequencyMS: 10000,
  
  // SSL/TLS settings for Atlas connections
  ...(uri.includes('mongodb+srv://') && {
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
  }),
};

let mongoClientPromise: Promise<MongoClient>;

// Enhanced connection function with retry logic
async function createMongoConnection(retryCount = 0): Promise<MongoClient> {
  try {
    console.log(`[MongoDB] Attempting connection (attempt ${retryCount + 1})...`);
    
    const client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db().admin().ping();
    console.log(`[MongoDB] ✅ Connection successful on attempt ${retryCount + 1}`);
    
    // Set up connection event listeners
    client.on('error', (error) => {
      console.error('[MongoDB] Connection error:', error);
    });
    
    client.on('close', () => {
      console.warn('[MongoDB] Connection closed');
    });
    
    client.on('reconnect', () => {
      console.log('[MongoDB] Reconnected successfully');
    });
    
    return client;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MongoDB] ❌ Connection failed on attempt ${retryCount + 1}:`, errorMessage);
    
    if (retryCount < 5) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
      console.log(`[MongoDB] 🔄 Retrying connection in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return createMongoConnection(retryCount + 1);
    } else {
      console.error('[MongoDB] ❌ Max retry attempts reached. Connection failed permanently.');
      throw new Error(`MongoDB connection failed after ${retryCount + 1} attempts: ${errorMessage}`);
    }
  }
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createMongoConnection();
  }
  mongoClientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  mongoClientPromise = createMongoConnection();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default mongoClientPromise;
export { mongoClientPromise };
