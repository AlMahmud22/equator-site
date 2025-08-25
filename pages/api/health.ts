import { NextApiRequest, NextApiResponse } from 'next';
import { mongoClientPromise } from '../../modules/database/mongodb';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      latency?: number;
      error?: string;
    };
    memory: {
      used: number;
      free: number;
      total: number;
      percentage: number;
    };
    process: {
      pid: number;
      platform: string;
      nodeVersion: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResult>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { status: 'error', error: 'Method not allowed' },
        memory: { used: 0, free: 0, total: 0, percentage: 0 },
        process: { pid: 0, platform: '', nodeVersion: '' }
      }
    });
  }

  const startTime = Date.now();
  let isHealthy = true;
  
  // Memory usage
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const freeMem = totalMem - usedMem;
  const memPercentage = (usedMem / totalMem) * 100;

  // Database health check
  let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
  let dbLatency: number | undefined;
  let dbError: string | undefined;

  try {
    const dbCheckStart = Date.now();
    const client = await mongoClientPromise;
    
    // Ping the database
    await client.db().admin().ping();
    
    dbLatency = Date.now() - dbCheckStart;
    dbStatus = 'connected';
    
    console.log(`[Health Check] Database ping successful (${dbLatency}ms)`);
  } catch (error) {
    isHealthy = false;
    dbStatus = 'error';
    dbError = error instanceof Error ? error.message : 'Unknown database error';
    console.error('[Health Check] Database ping failed:', dbError);
  }

  // Check if memory usage is too high (>90%)
  if (memPercentage > 90) {
    isHealthy = false;
    console.warn(`[Health Check] High memory usage: ${memPercentage.toFixed(2)}%`);
  }

  const healthResult: HealthCheckResult = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: dbStatus,
        ...(dbLatency && { latency: dbLatency }),
        ...(dbError && { error: dbError })
      },
      memory: {
        used: Math.round(usedMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        percentage: Math.round(memPercentage * 100) / 100
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
      }
    }
  };

  const responseTime = Date.now() - startTime;
  console.log(`[Health Check] Completed in ${responseTime}ms, status: ${healthResult.status}`);

  // Set appropriate status code
  const statusCode = isHealthy ? 200 : 503;
  
  // Cache headers for health checks
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  return res.status(statusCode).json(healthResult);
}
