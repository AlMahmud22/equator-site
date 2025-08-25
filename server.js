#!/usr/bin/env node

/**
 * Production Server Entry Point with Enhanced Error Handling
 * Loads environment variables before any imports to ensure proper configuration
 */

// CRITICAL: Load environment variables FIRST before any imports
require('dotenv').config({ path: '.env.production' });

// Enhanced logging utility
const log = {
  info: (msg, ...args) => console.log(`[${new Date().toISOString()}] INFO:`, msg, ...args),
  error: (msg, ...args) => console.error(`[${new Date().toISOString()}] ERROR:`, msg, ...args),
  warn: (msg, ...args) => console.warn(`[${new Date().toISOString()}] WARN:`, msg, ...args),
  debug: (msg, ...args) => process.env.DEBUG && console.log(`[${new Date().toISOString()}] DEBUG:`, msg, ...args)
};

// Global error handlers for uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  log.error('UNCAUGHT EXCEPTION - Server will attempt graceful shutdown:', error);

  // Try to gracefully close the server
  if (global.server) {
    global.server.close(() => {
      log.error('Server closed due to uncaught exception');
      process.exit(1);
    });

    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      log.error('Force exit after uncaught exception timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Don't exit immediately for unhandled rejections, just log them
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

// Verify critical environment variables are loaded
const requiredEnvVars = ['MONGODB_URI', 'NEXTAUTH_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  log.error('❌ FATAL: Missing required environment variables:', missingVars);
  log.error('❌ Available env vars:', Object.keys(process.env).filter(key =>
    key.includes('MONGO') || key.includes('NEXTAUTH') || key.includes('GITHUB') || key.includes('GOOGLE')
  ));
  process.exit(1);
}

log.info('✅ Environment variables loaded successfully');
log.info('✅ MONGODB_URI configured:', process.env.MONGODB_URI.substring(0, 20) + '...');
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
