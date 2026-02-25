import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI as string;

// Check if we have a connection string (warn but don't throw for development)
if (!MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI not defined - authentication features will be disabled");
  console.warn("💡 To enable auth, create a .env.local file with MONGODB_URI");
}

let cachedClient: MongoClient | null = null;

/**
 * Create a MongoDB client for NextAuth adapter
 */
export function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    return Promise.reject(new Error("MongoDB URI not configured"));
  }
  
  if (cachedClient) {
    return Promise.resolve(cachedClient);
  }

  return MongoClient.connect(MONGODB_URI).then((client) => {
    cachedClient = client;
    return client;
  });
}

/**
 * Export mongoose connection for backward compatibility with existing code
 */
export default async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }
  
  return mongoose.connect(MONGODB_URI);
}
