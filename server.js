#!/usr/bin/env node

/**
 * Production Server Entry Point with Enhanced Error Handling
 * Loads environment variables before any imports to ensure proper configuration
 */

// CRITICAL: Load environment variables FIRST with multiple fallbacks
const path = require('path');
const fs = require('fs');

// Enhanced logging utility
const log = {
  info: (msg, ...args) => console.log(`[${new Date().toISOString()}] INFO:`, msg, ...args),
  error: (msg, ...args) => console.error(`[${new Date().toISOString()}] ERROR:`, msg, ...args),
  warn: (msg, ...args) => console.warn(`[${new Date().toISOString()}] WARN:`, msg, ...args),
  debug: (msg, ...args) => process.env.DEBUG && console.log(`[${new Date().toISOString()}] DEBUG:`, msg, ...args)
};

// Load environment variables with multiple fallback paths
function loadEnvironmentVariables() {
  const possibleEnvFiles = [
    '.env.production',
    '.env.local',
    '.env'
  ];

  let loadedEnvFile = null;

  for (const envFile of possibleEnvFiles) {
    const envPath = path.resolve(process.cwd(), envFile);

    if (fs.existsSync(envPath)) {
      log.info(`📄 Found environment file: ${envPath}`);

      try {
        const result = require('dotenv').config({ path: envPath });

        if (result.error) {
          log.warn(`⚠️  Warning loading ${envFile}:`, result.error.message);
        } else {
          log.info(`✅ Successfully loaded ${Object.keys(result.parsed || {}).length} variables from ${envFile}`);
          loadedEnvFile = envFile;

          // Debug: Show which variables were loaded
          if (result.parsed) {
            const loadedVars = Object.keys(result.parsed);
            log.debug('📋 Loaded variables:', loadedVars.join(', '));

            // Check if critical variables are present
            const hasNextAuthSecret = loadedVars.includes('NEXTAUTH_SECRET');
            const hasMongoUri = loadedVars.includes('MONGODB_URI');
            log.info(`🔐 NEXTAUTH_SECRET loaded: ${hasNextAuthSecret}`);
            log.info(`🗄️  MONGODB_URI loaded: ${hasMongoUri}`);
          }
          break;
        }
      } catch (error) {
        log.error(`❌ Error loading ${envFile}:`, error.message);
      }
    } else {
      log.debug(`🔍 Environment file not found: ${envPath}`);
    }
  }

  if (!loadedEnvFile) {
    log.warn('⚠️  No environment file found, using system environment variables only');
  }

  return loadedEnvFile;
}

// Load environment variables first
const envFile = loadEnvironmentVariables();

// Global error handlers for uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  log.error('UNCAUGHT EXCEPTION:', error);
  
  // Don't exit for mongoose warnings
  if (error.name === 'MongooseError' || error.message.includes('Mongoose')) {
    log.warn('Mongoose warning detected, continuing execution:', error.message);
    return;
  }
  
  // Try to gracefully close the server
  if (global.server) {
    global.server.close(() => {
      log.error('Server closed due to uncaught exception');
      process.exit(1);
    });

    // Force exit after 30 seconds if graceful shutdown fails
    setTimeout(() => {
      log.error('Force exit after uncaught exception timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  
  // Filter out non-critical mongoose/db warnings
  if (reason && (
    (reason.name === 'MongooseError' || 
     String(reason).includes('Mongoose') || 
     String(reason).includes('MongoDB'))
  )) {
    log.warn('Non-critical database warning detected:', String(reason).substring(0, 200));
    return;
  }
  
  // Don't exit for unhandled promises in production to maintain stability
  if (process.env.NODE_ENV === 'production') {
    log.error('Production mode - continuing despite unhandled rejection');
  }
});

// Graceful shutdown handling for PM2
process.on('SIGTERM', () => {
  log.info('SIGTERM received, starting graceful shutdown...');

  if (global.server) {
    global.server.close(() => {
      log.info('HTTP server closed');
      process.exit(0);
    });

    // Force exit after 30 seconds
    setTimeout(() => {
      log.error('Force exit after SIGTERM timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  log.info('SIGINT received, starting graceful shutdown...');

  if (global.server) {
    global.server.close(() => {
      log.info('HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      log.error('Force exit after SIGINT timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
});

// Enhanced environment variable validation with warnings instead of hard exits
function validateEnvironmentVariables() {
  const requiredEnvVars = ['MONGODB_URI', 'NEXTAUTH_SECRET'];
  const warnings = [];
  const errors = [];

  log.info('🔍 Validating environment variables...');

  // Show all available environment variables (filtered for security)
  const availableEnvVars = Object.keys(process.env).filter(key =>
    key.includes('MONGO') ||
    key.includes('NEXTAUTH') ||
    key.includes('GITHUB') ||
    key.includes('GOOGLE') ||
    key.includes('NODE_ENV') ||
    key.includes('PORT')
  );

  log.info('📋 Available relevant env vars:', availableEnvVars.join(', '));

  for (const varName of requiredEnvVars) {
    const value = process.env[varName];

    if (!value || value.trim() === '') {
      errors.push(varName);
      log.error(`❌ Missing required environment variable: ${varName}`);
    } else {
      log.info(`✅ ${varName} is configured`);

      // Additional validation for specific variables
      if (varName === 'NEXTAUTH_SECRET' && value.length < 32) {
        warnings.push(`NEXTAUTH_SECRET should be at least 32 characters (current: ${value.length})`);
      }
    }
  }

  // Log warnings
  warnings.forEach(warning => log.warn(`⚠️  ${warning}`));

  return { errors, warnings, hasErrors: errors.length > 0 };
}

// Validate environment variables
const validation = validateEnvironmentVariables();

if (validation.hasErrors) {
  log.error('❌ FATAL: Environment validation failed');
  log.error('❌ Missing variables:', validation.errors);
  log.error('❌ Environment file used:', envFile || 'none');
  log.error('❌ Current working directory:', process.cwd());

  // Check if .env.production exists
  const envProductionPath = path.resolve(process.cwd(), '.env.production');
  if (fs.existsSync(envProductionPath)) {
    log.error('❌ .env.production exists but variables not loaded properly');

    try {
      const envContent = fs.readFileSync(envProductionPath, 'utf8');
      const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET=');
      const hasMongoUri = envContent.includes('MONGODB_URI=');

      log.error(`❌ .env.production contains NEXTAUTH_SECRET: ${hasNextAuthSecret}`);
      log.error(`❌ .env.production contains MONGODB_URI: ${hasMongoUri}`);

      if (hasNextAuthSecret) {
        log.error('❌ NEXTAUTH_SECRET is in file but not in process.env - dotenv loading failed');
      }
    } catch (error) {
      log.error('❌ Could not read .env.production file:', error.message);
    }
  } else {
    log.error('❌ .env.production file does not exist!');
    log.error('❌ Create it with proper environment variables');
  }

  log.error('');
  log.error('🔧 TROUBLESHOOTING STEPS:');
  log.error('1. Ensure .env.production file exists in the project root');
  log.error('2. Verify all required environment variables are set');
  log.error('3. Check file permissions and ownership');
  log.error('4. Restart PM2 process after fixing environment variables');
  log.error('');

  process.exit(1);
}

log.info('✅ Environment variables loaded successfully');
log.info('✅ MONGODB_URI configured:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET');
log.info('✅ NEXTAUTH_SECRET configured:', process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.length} characters` : 'NOT SET');
log.info('✅ NODE_ENV:', process.env.NODE_ENV);

// Now start the Next.js server with enhanced error handling
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Validate port
if (isNaN(port) || port < 1 || port > 65535) {
  log.error('❌ FATAL: Invalid port number:', process.env.PORT);
  process.exit(1);
}

log.info(`🔧 Starting server on ${hostname}:${port} (dev: ${dev})`);

// Prepare the Next.js app with error handling
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Helper for safely handling proxy headers
const trustProxy = process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production';
log.info(`🔒 Proxy headers trusted: ${trustProxy}`);

// Enhanced server startup with retry logic
async function startServer(retryCount = 0) {
  try {
    log.info(`🚀 Preparing Next.js app (attempt ${retryCount + 1})...`);
    await app.prepare();

    const server = createServer(async (req, res) => {
      try {
        // Handle proxy headers for proper IP detection
        if (trustProxy && req.headers['x-forwarded-for']) {
          const realIp = req.headers['x-forwarded-for'].split(',')[0].trim();
          req.realIp = realIp;
          log.debug(`Proxy request from: ${realIp}`);
        }

        // Handle proxy protocol
        if (trustProxy && req.headers['x-forwarded-proto'] === 'https') {
          req.secure = true;
          req.protocol = 'https';
        }
        
        // Handle ECONNRESET and Parse Error warnings
        req.on('error', (err) => {
          if (err.code === 'ECONNRESET') {
            log.debug('Client connection reset:', err.message);
            // Just let the request terminate naturally
            return;
          }
          log.warn('Request error:', err.message);
        });
        
        // Handle PRI/Upgrade parse errors
        if (req.method === 'PRI' || req.headers.upgrade) {
          if (req.method === 'PRI') {
            log.debug('HTTP/2 PRI method detected, responding with 501');
            res.writeHead(501);
            res.end('HTTP/2 not supported');
            return;
          } else if (req.headers.upgrade && req.headers.upgrade.toLowerCase() !== 'websocket') {
            // Handle non-websocket upgrades
            log.debug(`Non-WebSocket upgrade requested: ${req.headers.upgrade}`);
            res.writeHead(426);
            res.end('Upgrade protocol not supported');
            return;
          }
        }

        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        log.error('Request handling error for', req.url, ':', err.message);

        // Ensure response is properly handled
        if (!res.headersSent) {
          try {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'Internal server error',
              timestamp: new Date().toISOString()
            }));
          } catch (resErr) {
            log.error('Error sending error response:', resErr.message);
            res.end();
          }
        }
      }
    });

    // Enhanced error handling for server
    server.on('error', (err) => {
      log.error('❌ Server error:', err.message);

      if (err.code === 'EADDRINUSE') {
        log.error(`❌ Port ${port} is already in use`);
        if (retryCount < 3) {
          log.info(`🔄 Retrying server start in 5 seconds...`);
          setTimeout(() => startServer(retryCount + 1), 5000);
          return;
        }
      }

      log.error('❌ Server failed to start, exiting...');
      process.exit(1);
    });

    server.on('clientError', (err, socket) => {
      log.warn('Client error:', err.message);
      if (!socket.destroyed) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      }
    });

    // Start listening
    server.listen(port, hostname, () => {
      log.info(`🚀 Server ready on http://${hostname}:${port}`);
      log.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      log.info(`🔗 Database: ${process.env.MONGODB_URI ? 'MongoDB Atlas Connected' : 'No Database'}`);
      log.info(`📊 Process ID: ${process.pid}`);
      log.info(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

      // Store server reference for graceful shutdown
      global.server = server;

      // Health check endpoint logging
      log.info('✅ Server startup completed successfully');
      
      // Signal to PM2 that the app is ready (used with wait_ready: true)
      if (process.send) {
        log.info('✉️ Sending ready signal to PM2');
        process.send('ready');
      }
    });

  } catch (error) {
    log.error('❌ Failed to start server:', error.message);

    if (retryCount < 3) {
      log.info(`🔄 Retrying server start in 10 seconds (attempt ${retryCount + 2})...`);
      setTimeout(() => startServer(retryCount + 1), 10000);
    } else {
      log.error('❌ Max retry attempts reached, exiting...');
      process.exit(1);
    }
  }
}

// Start the server
startServer();
