#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Clean up expired data and optimize storage
 */

require('dotenv').config();

const { DatabaseOptimizer } = require('../modules/database/DatabaseOptimizer');

async function main() {
  console.log('🧹 Database Cleanup\n');
  
  try {
    // Connect to database
    const mongoose = require('mongoose');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');
    
    // Run cleanup
    console.log('🗑️  Cleaning up expired data...');
    const cleanupResults = await DatabaseOptimizer.cleanupExpiredData();
    
    console.log('📊 Cleanup Results:');
    console.log(`   Expired sessions removed: ${cleanupResults.expiredSessions}`);
    console.log(`   Expired tokens removed: ${cleanupResults.expiredTokens}`);
    console.log(`   Old logs removed: ${cleanupResults.oldLogs}`);
    
    // Analyze performance impact
    console.log('\n📈 Running performance analysis...');
    const performance = await DatabaseOptimizer.analyzePerformance();
    
    console.log('\n💾 Storage Analysis:');
    for (const [collection, stats] of Object.entries(performance.collections)) {
      console.log(`   ${collection}:`);
      console.log(`     Documents: ${stats.documentCount.toLocaleString()}`);
      console.log(`     Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`     Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
    if (performance.recommendations.length > 0) {
      console.log('\n💡 Performance Recommendations:');
      performance.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n✅ Database cleanup completed successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Database cleanup failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
