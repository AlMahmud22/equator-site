#!/usr/bin/env node

/**
 * Database Setup Script
 * Run this script to initialize and optimize the MongoDB schema
 * 
 * Usage:
 *   npm run db:setup
 *   or
 *   node scripts/setup-database.js
 */

require('dotenv').config();

const { DatabaseInitializer } = require('../modules/database/DatabaseInitializer');

async function main() {
  console.log('🚀 Starting database setup...\n');
  
  try {
    // Check environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI environment variable is required');
    }
    
    console.log('📋 Environment configuration:');
    console.log(`   Database URI: ${process.env.MONGODB_URI.substring(0, 20)}...`);
    console.log(`   Node Environment: ${process.env.NODE_ENV || 'development'}\n`);
    
    // Initialize database
    const initResult = await DatabaseInitializer.initializeDatabase();
    
    console.log('\n📊 Initialization Results:');
    console.log('   ✅ Database connection: OK');
    console.log(`   ✅ Sessions migrated: ${initResult.optimization.migrationStats.migratedSessions}`);
    console.log(`   ✅ Data cleaned: ${initResult.optimization.cleanupStats.expiredSessions} expired sessions removed`);
    console.log(`   ✅ Performance analysis: ${Object.keys(initResult.optimization.performanceAnalysis.collections).length} collections analyzed`);
    
    // Validate setup
    console.log('\n🔍 Validating database setup...');
    const validationResult = await DatabaseInitializer.validateDatabase();
    
    console.log('\n📈 Database Health:');
    const health = await DatabaseInitializer.getDatabaseHealth();
    console.log(`   Connection: ${health.connected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Collections: ${Object.keys(health.collections || {}).length}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start your application: npm run dev');
    console.log('   2. Check database health: npm run db:health');
    console.log('   3. Monitor performance: npm run db:analyze');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Database setup failed:');
    console.error(error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your MONGODB_URI in .env.local');
    console.log('   2. Ensure MongoDB Atlas/server is accessible');
    console.log('   3. Verify network connectivity');
    console.log('   4. Check database permissions');
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the setup
main();
