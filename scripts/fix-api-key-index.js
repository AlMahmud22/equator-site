/**
 * Fix for duplicate key error on apiKeys.keyId in EnhancedUser collection
 * This script drops the old index and creates a new sparse unique index
 * 
 * To run:
 * node scripts/fix-api-key-index.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixApiKeyIndex() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable is not defined');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  console.log(`🔗 URI: ${process.env.MONGODB_URI.substring(0, 20)}...`);
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    ssl: true,
    retryWrites: true,
    retryReads: true,
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('enhancedusers');
    
    // List existing indexes to find the one we need to drop
    console.log('📋 Listing current indexes...');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Find the index on apiKeys.keyId
    const indexToRemove = indexes.find(idx => 
      idx.key && idx.key['apiKeys.keyId'] === 1 && !idx.sparse
    );
    
    if (indexToRemove) {
      console.log(`🗑️ Found index to remove: ${indexToRemove.name}`);
      
      try {
        await collection.dropIndex(indexToRemove.name);
        console.log('✅ Successfully dropped the old index');
      } catch (dropError) {
        console.error('❌ Error dropping index:', dropError);
        console.log('Continuing to create the new index...');
      }
    } else {
      console.log('ℹ️ No problematic index found on apiKeys.keyId');
    }
    
    // Create new sparse unique index
    console.log('🔧 Creating new sparse unique index on apiKeys.keyId...');
    try {
      await collection.createIndex(
        { 'apiKeys.keyId': 1 },
        { unique: true, sparse: true }
      );
      console.log('✅ Successfully created sparse unique index on apiKeys.keyId');
    } catch (createError) {
      console.error('❌ Error creating sparse index:', createError);
      // If index already exists as sparse unique, this is fine
      if (createError.code === 85) { // Index with same name exists
        console.log('ℹ️ Index already exists. This is likely fine if it\'s properly configured as sparse.');
      }
    }
    
    // Verify the indexes again
    console.log('📋 Verifying updated indexes...');
    const updatedIndexes = await collection.indexes();
    
    const sparseIndex = updatedIndexes.find(idx => 
      idx.key && idx.key['apiKeys.keyId'] === 1 && idx.sparse === true
    );
    
    if (sparseIndex) {
      console.log('✅ Verification successful: sparse unique index exists on apiKeys.keyId');
    } else {
      console.error('❌ Verification failed: couldn\'t find sparse unique index');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

fixApiKeyIndex().catch(console.error);
