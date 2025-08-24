#!/usr/bin/env node

/**
 * Database Health Check Script
 * Check the health and performance of the MongoDB database
 */

require('dotenv').config();

const { DatabaseInitializer } = require('../modules/database/DatabaseInitializer');
const { DatabaseOptimizer } = require('../modules/database/DatabaseOptimizer');

async function main() {
  console.log('🏥 Database Health Check\n');
  
  try {
    // Get database health
    const health = await DatabaseInitializer.getDatabaseHealth();
    
    console.log('📊 Connection Status:');
    console.log(`   Status: ${health.connected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Ready State: ${health.readyState}`);
    console.log(`   Timestamp: ${health.timestamp}\n`);
    
    if (health.connected) {
      // Show collection information
      console.log('📚 Collections:');
      for (const [name, info] of Object.entries(health.collections || {})) {
        if (typeof info === 'object' && 'documentCount' in info) {
          console.log(`   ${name}:`);
          console.log(`     Documents: ${info.documentCount.toLocaleString()}`);
          console.log(`     Size: ${(info.size / 1024 / 1024).toFixed(2)} MB`);
          console.log(`     Indexes: ${info.indexCount}`);
        }
      }
      
      // Performance analysis
      console.log('\n⚡ Performance Analysis:');
      const performance = health.performance;
      if (performance && performance.recommendations) {
        console.log(`   Collections analyzed: ${Object.keys(performance.collections).length}`);
        console.log(`   Recommendations: ${performance.recommendations.length}`);
        
        if (performance.recommendations.length > 0) {
          console.log('\n💡 Recommendations:');
          performance.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
          });
        }
      }
      
      // Get index statistics
      console.log('\n📇 Index Statistics:');
      const indexStats = await DatabaseOptimizer.getIndexStatistics();
      for (const [collection, stats] of Object.entries(indexStats)) {
        console.log(`   ${collection}: ${stats.indexCount} indexes`);
      }
      
    } else {
      console.log('❌ Cannot perform detailed analysis - database not connected');
      if (health.error) {
        console.log(`   Error: ${health.error}`);
      }
    }
    
    process.exit(health.connected ? 0 : 1);
    
  } catch (error) {
    console.error('\n💥 Health check failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
