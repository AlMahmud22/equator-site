import mongoose from 'mongoose';
import User from './models/User';
import UserSession from './models/UserSession';
import AppToken from './models/AppToken';
import AccessLog from './models/AccessLog';

/**
 * Database Schema Optimization and Migration Utility
 * Handles performance tuning, index creation, and data migrations
 */
export class DatabaseOptimizer {
  
  /**
   * Create all recommended indexes for optimal performance
   */
  static async createOptimizedIndexes() {
    console.log('🔧 Creating optimized database indexes...');
    
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database connection not available');

      // User collection indexes
      await this.createUserIndexes(db);
      
      // UserSession collection indexes
      await this.createUserSessionIndexes(db);
      
      // App collection indexes
      await this.createAppIndexes(db);
      
      // AppToken collection indexes
      await this.createAppTokenIndexes(db);
      
      // AppPermission collection indexes
      await this.createAppPermissionIndexes(db);
      
      // AccessLog collection indexes
      await this.createAccessLogIndexes(db);
      
      // TrainingLog collection indexes
      await this.createTrainingLogIndexes(db);

      console.log('✅ All database indexes created successfully');
      
      // Return index statistics
      return await this.getIndexStatistics();
      
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Create User collection indexes
   */
  private static async createUserIndexes(db: any) {
    const collection = db.collection('users');
    
    // Primary indexes
    await collection.createIndex({ email: 1 }, { unique: true, background: true });
    await collection.createIndex({ createdAt: -1 }, { background: true });
    await collection.createIndex({ lastLoginAt: -1 }, { background: true });
    
    // Security indexes
    await collection.createIndex({ isLocked: 1, lockedUntil: 1 }, { background: true });
    await collection.createIndex({ accountStatus: 1 }, { background: true });
    await collection.createIndex({ lastLoginIp: 1 }, { background: true });
    await collection.createIndex({ emailVerified: 1, accountStatus: 1 }, { background: true });
    
    // API usage indexes
    await collection.createIndex({ 'apiUsage.totalRequests': -1 }, { background: true });
    await collection.createIndex({ 'apiUsage.apiKeys.keyId': 1 }, { background: true });
    await collection.createIndex({ 'apiUsage.apiKeys.isActive': 1 }, { background: true });
    
    // Subscription indexes
    await collection.createIndex({ 'subscription.plan': 1, 'subscription.status': 1 }, { background: true });
    
    // Analytics indexes
    await collection.createIndex({ 'analytics.engagementScore': -1 }, { background: true });
    await collection.createIndex({ 'analytics.lastActiveDate': -1 }, { background: true });
    
    // Compound indexes for complex queries
    await collection.createIndex({ accountStatus: 1, 'subscription.plan': 1 }, { background: true });
    await collection.createIndex({ 'analytics.lastActiveDate': -1, accountStatus: 1 }, { background: true });
    await collection.createIndex({ createdAt: -1, emailVerified: 1 }, { background: true });
    
    // Text search index
    await collection.createIndex({
      fullName: 'text',
      'profile.displayName': 'text',
      'profile.bio': 'text',
      'profile.company': 'text'
    }, { background: true });
    
    console.log('✓ User collection indexes created');
  }

  /**
   * Create UserSession collection indexes
   */
  private static async createUserSessionIndexes(db: any) {
    const collection = db.collection('usersessions');
    
    await collection.createIndex({ userId: 1 }, { background: true });
    await collection.createIndex({ sessionToken: 1 }, { unique: true, background: true });
    await collection.createIndex({ ipAddress: 1 }, { background: true });
    await collection.createIndex({ createdAt: -1 }, { background: true });
    await collection.createIndex({ lastActive: -1 }, { background: true });
    await collection.createIndex({ isActive: 1 }, { background: true });
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
    
    // Compound indexes
    await collection.createIndex({ userId: 1, isActive: 1 }, { background: true });
    await collection.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await collection.createIndex({ ipAddress: 1, createdAt: -1 }, { background: true });
    await collection.createIndex({ isActive: 1, lastActive: -1 }, { background: true });
    await collection.createIndex({ riskScore: -1, isActive: 1 }, { background: true });
    
    console.log('✓ UserSession collection indexes created');
  }

  /**
   * Create App collection indexes
   */
  private static async createAppIndexes(db: any) {
    const collection = db.collection('apps');
    
    await collection.createIndex({ clientId: 1 }, { unique: true, background: true });
    await collection.createIndex({ ownerId: 1 }, { background: true });
    await collection.createIndex({ status: 1 }, { background: true });
    await collection.createIndex({ isVerified: 1 }, { background: true });
    await collection.createIndex({ createdAt: -1 }, { background: true });
    await collection.createIndex({ 'stats.lastUsed': -1 }, { background: true });
    
    // Compound indexes
    await collection.createIndex({ ownerId: 1, status: 1 }, { background: true });
    await collection.createIndex({ status: 1, isVerified: 1 }, { background: true });
    
    console.log('✓ App collection indexes created');
  }

  /**
   * Create AppToken collection indexes
   */
  private static async createAppTokenIndexes(db: any) {
    const collection = db.collection('apptokens');
    
    await collection.createIndex({ appId: 1 }, { background: true });
    await collection.createIndex({ userId: 1 }, { background: true });
    await collection.createIndex({ tokenType: 1 }, { background: true });
    await collection.createIndex({ accessToken: 1 }, { sparse: true, background: true });
    await collection.createIndex({ refreshToken: 1 }, { sparse: true, background: true });
    await collection.createIndex({ authorizationCode: 1 }, { sparse: true, background: true });
    await collection.createIndex({ status: 1 }, { background: true });
    await collection.createIndex({ issuedAt: -1 }, { background: true });
    await collection.createIndex({ lastUsed: -1 }, { background: true });
    
    // TTL indexes for expiration
    await collection.createIndex({ accessTokenExpiresAt: 1 }, { expireAfterSeconds: 0, background: true });
    await collection.createIndex({ refreshTokenExpiresAt: 1 }, { expireAfterSeconds: 0, background: true });
    await collection.createIndex({ authorizationCodeExpiresAt: 1 }, { expireAfterSeconds: 0, background: true });
    
    // Compound indexes
    await collection.createIndex({ appId: 1, userId: 1 }, { background: true });
    await collection.createIndex({ userId: 1, status: 1 }, { background: true });
    await collection.createIndex({ appId: 1, status: 1 }, { background: true });
    
    console.log('✓ AppToken collection indexes created');
  }

  /**
   * Create AppPermission collection indexes
   */
  private static async createAppPermissionIndexes(db: any) {
    const collection = db.collection('apppermissions');
    
    await collection.createIndex({ userId: 1 }, { background: true });
    await collection.createIndex({ appId: 1 }, { background: true });
    await collection.createIndex({ status: 1 }, { background: true });
    await collection.createIndex({ grantedAt: -1 }, { background: true });
    await collection.createIndex({ lastUsed: -1 }, { background: true });
    
    // Compound indexes
    await collection.createIndex({ userId: 1, appId: 1 }, { unique: true, background: true });
    await collection.createIndex({ appId: 1, status: 1 }, { background: true });
    await collection.createIndex({ userId: 1, status: 1 }, { background: true });
    
    console.log('✓ AppPermission collection indexes created');
  }

  /**
   * Create AccessLog collection indexes
   */
  private static async createAccessLogIndexes(db: any) {
    const collection = db.collection('accesslogs');
    
    await collection.createIndex({ userId: 1 }, { background: true });
    await collection.createIndex({ timestamp: -1 }, { background: true });
    await collection.createIndex({ ipAddress: 1 }, { background: true });
    await collection.createIndex({ action: 1 }, { background: true });
    await collection.createIndex({ riskLevel: 1 }, { background: true });
    
    // TTL index for log retention (keep logs for 1 year)
    await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000, background: true });
    
    // Compound indexes
    await collection.createIndex({ userId: 1, timestamp: -1 }, { background: true });
    await collection.createIndex({ ipAddress: 1, timestamp: -1 }, { background: true });
    await collection.createIndex({ action: 1, timestamp: -1 }, { background: true });
    await collection.createIndex({ riskLevel: 1, timestamp: -1 }, { background: true });
    
    console.log('✓ AccessLog collection indexes created');
  }

  /**
   * Create TrainingLog collection indexes
   */
  private static async createTrainingLogIndexes(db: any) {
    const collection = db.collection('traininglogs');
    
    await collection.createIndex({ userId: 1 }, { background: true });
    await collection.createIndex({ timestamp: -1 }, { background: true });
    await collection.createIndex({ action: 1 }, { background: true });
    await collection.createIndex({ modelId: 1 }, { background: true });
    
    // Compound indexes
    await collection.createIndex({ userId: 1, timestamp: -1 }, { background: true });
    await collection.createIndex({ modelId: 1, timestamp: -1 }, { background: true });
    await collection.createIndex({ action: 1, timestamp: -1 }, { background: true });
    
    console.log('✓ TrainingLog collection indexes created');
  }

  /**
   * Get comprehensive index statistics
   */
  static async getIndexStatistics() {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not available');
    
    const collections = ['users', 'usersessions', 'apps', 'apptokens', 'apppermissions', 'accesslogs', 'traininglogs'];
    const stats: any = {};
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray();
        
        stats[collectionName] = {
          indexCount: indexes.length,
          indexes: indexes.map((idx: any) => ({
            name: idx.name,
            key: idx.key,
            unique: idx.unique || false,
            sparse: idx.sparse || false,
            background: idx.background || false
          })),
          usage: indexStats
        };
      } catch (error) {
        console.warn(`Could not get stats for collection ${collectionName}:`, error);
      }
    }
    
    return stats;
  }

  /**
   * Migrate user sessions from embedded to separate collection
   */
  static async migrateUserSessions() {
    console.log('🔄 Migrating user sessions to separate collection...');
    
    try {
      const users = await User.find({ 'activeSessions.0': { $exists: true } });
      let migratedCount = 0;
      
      for (const user of users) {
        if (user.activeSessions && user.activeSessions.length > 0) {
          for (const session of user.activeSessions) {
            const userSession = new UserSession({
              userId: user._id,
              sessionToken: session.sessionId,
              ipAddress: session.ipAddress || '0.0.0.0',
              userAgent: session.deviceInfo || 'Unknown',
              createdAt: session.createdAt,
              lastActive: session.lastActiveAt,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              isActive: session.isActive,
              loginMethod: 'web',
              authProvider: user.authType
            });
            
            await userSession.save();
            migratedCount++;
          }
          
          // Clear embedded sessions after migration
          user.activeSessions = [];
          await user.save();
        }
      }
      
      console.log(`✅ Migrated ${migratedCount} user sessions`);
      return { migratedSessions: migratedCount, migratedUsers: users.length };
      
    } catch (error) {
      console.error('❌ Error migrating user sessions:', error);
      throw error;
    }
  }

  /**
   * Clean up expired and old data
   */
  static async cleanupExpiredData() {
    console.log('🧹 Cleaning up expired data...');
    
    try {
      const results = {
        expiredSessions: 0,
        expiredTokens: 0,
        oldLogs: 0
      };
      
      // Clean up expired sessions
      const expiredSessions = await UserSession.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { isActive: false, terminatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      });
      results.expiredSessions = expiredSessions.deletedCount || 0;
      
      // Clean up expired tokens
      const expiredTokens = await AppToken.deleteMany({
        $or: [
          { accessTokenExpiresAt: { $lt: new Date() } },
          { refreshTokenExpiresAt: { $lt: new Date() } },
          { authorizationCodeExpiresAt: { $lt: new Date() } },
          { status: 'revoked', revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        ]
      });
      results.expiredTokens = expiredTokens.deletedCount || 0;
      
      // Clean up old access logs (older than 1 year)
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const oldLogs = await AccessLog.deleteMany({
        timestamp: { $lt: oneYearAgo }
      });
      results.oldLogs = oldLogs.deletedCount || 0;
      
      console.log('✅ Cleanup completed:', results);
      return results;
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Analyze and suggest performance optimizations
   */
  static async analyzePerformance() {
    console.log('📊 Analyzing database performance...');
    
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database connection not available');
      
      const analysis: any = {
        collections: {},
        recommendations: []
      };
      
      // Analyze each collection
      const collections = ['users', 'usersessions', 'apps', 'apptokens', 'apppermissions', 'accesslogs', 'traininglogs'];
      
      for (const collectionName of collections) {
        const stats = await db.command({ collStats: collectionName });
        
        analysis.collections[collectionName] = {
          documentCount: stats.count || 0,
          avgDocumentSize: stats.avgObjSize || 0,
          totalSize: stats.size || 0,
          indexSize: stats.totalIndexSize || 0,
          indexCount: stats.nindexes || 0
        };
        
        // Recommendations based on collection stats
        if (stats.count > 100000 && stats.nindexes < 5) {
          analysis.recommendations.push(`Consider adding more indexes to ${collectionName} for better query performance`);
        }
        
        if (stats.totalIndexSize > stats.size * 0.5) {
          analysis.recommendations.push(`${collectionName} has large indexes relative to data size - review index necessity`);
        }
      }
      
      // General recommendations
      analysis.recommendations.push('Run db.runCommand({planCacheClear: "*"}) periodically to clear query plan cache');
      analysis.recommendations.push('Monitor slow queries using db.setProfilingLevel(2, {slowms: 100})');
      analysis.recommendations.push('Consider sharding for collections with > 1M documents');
      
      console.log('📈 Performance analysis completed');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analyzing performance:', error);
      throw error;
    }
  }

  /**
   * Run complete database optimization
   */
  static async optimizeDatabase() {
    console.log('🚀 Starting complete database optimization...');
    
    try {
      const results = {
        indexStats: await this.createOptimizedIndexes(),
        migrationStats: await this.migrateUserSessions(),
        cleanupStats: await this.cleanupExpiredData(),
        performanceAnalysis: await this.analyzePerformance()
      };
      
      console.log('🎉 Database optimization completed successfully!');
      return results;
      
    } catch (error) {
      console.error('💥 Database optimization failed:', error);
      throw error;
    }
  }
}

export default DatabaseOptimizer;
