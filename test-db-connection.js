#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Use this to verify MongoDB Atlas connection before deploying
 */

// Load environment variables
require('dotenv').config({ path: '.env.production' });

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
  console.log('   URI starts with:', process.env.MONGODB_URI?.substring(0, 30) + '...\n');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    process.exit(1);
  }
  
  try {
    // Import and test connection using require for JavaScript compatibility
    console.log('🔌 Attempting to connect to MongoDB Atlas...');
    
    // Test connection using mongoose directly
    const mongoose = require('mongoose');
    
    const opts = {
      bufferCommands: false,
      dbName: 'equators-tech',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
    };
    
    await mongoose.connect(process.env.MONGODB_URI, opts);
    
    console.log('✅ Connection successful!');
    console.log('🏢 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('📊 Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 This suggests the app is trying to connect to localhost instead of Atlas');
    }
    
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
