import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI as string;

// Check if we have a connection string
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cachedClient: MongoClient | null = null;

/**
 * Create a MongoDB client for NextAuth adapter
 */
export function getMongoClient(): Promise<MongoClient> {
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
