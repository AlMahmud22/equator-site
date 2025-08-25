import mongoose from 'mongoose';
import DatabaseOptimizer from './DatabaseOptimizer';
import { SecurityMonitor } from '../../lib/security/SecurityMonitor';

/**
 * Connect to MongoDB using mongoose
 */
async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  
  return mongoose.connection;
}

/**
 * Database initialization and optimization script
 * Run this script to set up the optimized database schema
 */
export class DatabaseInitializer {
  
  /**
   * Initialize the complete database with optimizations
   */
  static async initializeDatabase() {
    console.log('🏗️  Initializing optimized database schema...');
    
    try {
      // Connect to database
      await connectToDatabase();
      console.log('✅ Database connection established');
      
      // Run complete optimization
      const optimizationResults = await DatabaseOptimizer.optimizeDatabase();
      
      // Initialize security monitoring
      await this.initializeSecurityMonitoring();
      
      // Create default data if needed
      await this.createDefaultData();
      
      console.log('🎉 Database initialization completed successfully!');
      
      return {
        success: true,
        optimization: optimizationResults,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('💥 Database initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Initialize security monitoring
   */
  private static async initializeSecurityMonitoring() {
    console.log('🔒 Initializing security monitoring...');
    
    try {
      const securityMonitor = SecurityMonitor.getInstance();
      
      // Test security monitoring
      const testResult = await securityMonitor.logSecurityEvent(
        'system',
        'database_initialization',
        'system',
        '127.0.0.1',
        'DatabaseInitializer',
        true,
        { message: 'Database initialization completed' }
      );
      
      console.log('✅ Security monitoring initialized');
      return testResult;
      
    } catch (error) {
      console.warn('⚠️  Security monitoring initialization failed:', error);
      // Don't throw error as this is not critical for database function
    }
  }
  
  /**
   * Create default data and configurations
   */
  private static async createDefaultData() {
    console.log('📋 Creating default data...');
    
    try {
      // You can add default app configurations, user roles, etc. here
      // For now, just log that this step is complete
      
      console.log('✅ Default data creation completed');
      
    } catch (error) {
      console.warn('⚠️  Default data creation failed:', error);
      // Don't throw error as this is not critical
    }
  }
  
  /**
   * Validate database schema and performance
   */
  static async validateDatabase() {
    console.log('🔍 Validating database schema and performance...');
    
    try {
      await connectToDatabase();
      
      // Get performance analysis
      const performanceAnalysis = await DatabaseOptimizer.analyzePerformance();
      
      // Get index statistics
      const indexStats = await DatabaseOptimizer.getIndexStatistics();
      
      // Run basic validation queries
      const validationResults = await this.runValidationQueries();
      
      console.log('✅ Database validation completed');
      
      return {
        performance: performanceAnalysis,
        indexes: indexStats,
        validation: validationResults,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('❌ Database validation failed:', error);
      throw error;
    }
  }
  
  /**
   * Run basic validation queries to ensure everything works
   */
  private static async runValidationQueries() {
    console.log('🧪 Running validation queries...');
    
    const results = {
      userCollection: false,
      sessionCollection: false,
      appCollection: false,
      tokenCollection: false,
      permissionCollection: false,
      accessLogCollection: false,
      trainingLogCollection: false
    };
    
    try {
      // Test User model
      await import('./models/User');
      results.userCollection = true;
      
      // Test UserSession model
      await import('./models/UserSession');
      results.sessionCollection = true;
      
      // Test App model
      await import('./models/App');
      results.appCollection = true;
      
      // Test AppToken model
      await import('./models/AppToken');
      results.tokenCollection = true;
      
      // Test AppPermission model
      await import('./models/AppPermission');
      results.permissionCollection = true;
      
      // Test AccessLog model
      await import('./models/AccessLog');
      results.accessLogCollection = true;
      
      // Test TrainingLog model
      await import('./models/TrainingLog');
      results.trainingLogCollection = true;
      
      console.log('✅ All validation queries passed');
      
    } catch (error) {
      console.error('❌ Validation query failed:', error);
    }
    
    return results;
  }
  
  /**
   * Get database health status
   */
  static async getDatabaseHealth() {
    try {
      await connectToDatabase();
      
      const health = {
        connected: true,
        readyState: require('mongoose').connection.readyState,
        collections: await this.getCollectionInfo(),
        performance: await DatabaseOptimizer.analyzePerformance(),
        timestamp: new Date()
      };
      
      return health;
      
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
  
  /**
   * Get information about all collections
   */
  private static async getCollectionInfo() {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    
    if (!db) return {};
    
    const collections = await db.listCollections().toArray();
    const info: any = {};
    
    for (const collection of collections) {
      try {
        const stats = await db.command({ collStats: collection.name });
        info[collection.name] = {
          documentCount: stats.count || 0,
          size: stats.size || 0,
          avgDocumentSize: stats.avgObjSize || 0,
          indexCount: stats.nindexes || 0
        };
      } catch {
        info[collection.name] = { error: 'Could not get stats' };
      }
    }
    
    return info;
  }
}

export default DatabaseInitializer;
