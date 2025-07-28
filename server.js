#!/usr/bin/env node

/**
 * Production Server Entry Point
 * Loads environment variables before any imports to ensure proper configuration
 */

// CRITICAL: Load environment variables FIRST before any imports
require('dotenv').config({ path: '.env.production' });

// Verify critical environment variables are loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ FATAL: MONGODB_URI is not defined in environment variables');
  console.error('❌ Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('✅ MONGODB_URI configured:', process.env.MONGODB_URI.substring(0, 20) + '...');
console.log('✅ NODE_ENV:', process.env.NODE_ENV);

// Now start the Next.js server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Database: ${process.env.MONGODB_URI ? 'MongoDB Atlas Connected' : 'No Database'}`);
    });
});
