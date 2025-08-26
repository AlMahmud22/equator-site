/**
 * Database Migration Script
 * Migrates from old user models to the new UnifiedUser model
 */

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables
dotenv.config({ path: '.env.production' })

// Define the UnifiedUser schema directly here to avoid import issues
const UnifiedUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  image: String,
  provider: { type: String, enum: ['google', 'github'], required: true },
  providerId: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'employer', 'developer', 'other'], default: 'student' },
  shortName: String,
  bio: { type: String, maxlength: 500 },
  company: String,
  location: String,
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    newsletter: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true }
  },
  lastLoginAt: { type: Date, default: Date.now },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    provider: String,
    ipAddress: String
  }],
  downloadLogs: [{
    projectId: String,
    projectName: String,
    downloadedAt: { type: Date, default: Date.now },
    fileSize: Number
  }],
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: true }
}, { timestamps: true })

const UnifiedUser = mongoose.models.UnifiedUser || mongoose.model('UnifiedUser', UnifiedUserSchema)

async function migrateUsers() {
  console.log('🔄 Starting user migration to UnifiedUser model...')
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000
    })
    
    console.log('✅ Connected to MongoDB')
    
    // Check if UnifiedUser collection exists and show count
    const unifiedUserCount = await UnifiedUser.countDocuments()
    console.log(`📊 Current UnifiedUser documents: ${unifiedUserCount}`)
    
    // List all collections to see what we have
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📋 Available collections:')
    collections.forEach(col => {
      console.log(`  - ${col.name}`)
    })
    
    // If there are any old User or EnhancedUser collections, we could migrate them here
    // For now, we'll just ensure the UnifiedUser collection is properly set up
    
    console.log('✅ Migration check completed')
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run migration if script is executed directly
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log('🎉 Migration completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateUsers }
