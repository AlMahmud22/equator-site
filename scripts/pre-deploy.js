#!/usr/bin/env node

/**
 * Pre-startup script for production deployment
 * Ensures all required directories and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting pre-deployment setup...');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Created logs directory');
} else {
  console.log('✅ Logs directory exists');
}

// Check for required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

console.log('🔍 Checking environment variables...');
const missingVars = [];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    console.log(`✅ ${varName} is set`);
  }
}

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

// Validate MongoDB URI format
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  console.error('❌ Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

console.log('✅ MongoDB URI format is valid');

// Check if NextAuth secret is properly set
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (nextAuthSecret.length < 32) {
  console.warn('⚠️  NEXTAUTH_SECRET should be at least 32 characters long for security');
}

// Create .env.production.example if it doesn't exist
const envExamplePath = path.join(__dirname, '.env.production.example');
if (!fs.existsSync(envExamplePath)) {
  const envExample = `# Production Environment Variables
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters
NEXTAUTH_URL=https://your-domain.com

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional
ADMIN_EMAIL=admin@your-domain.com
RATE_LIMIT_ENABLED=true
TRUST_PROXY=true
`;

  fs.writeFileSync(envExamplePath, envExample);
  console.log('✅ Created .env.production.example');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

if (majorVersion < 18) {
  console.warn(`⚠️  Node.js version ${nodeVersion} detected. Recommended: Node.js 18+`);
} else {
  console.log(`✅ Node.js version ${nodeVersion} is compatible`);
}

// Check available memory
const totalMem = require('os').totalmem();
const freeMem = require('os').freemem();
const memGB = totalMem / (1024 * 1024 * 1024);

console.log(`💾 System memory: ${memGB.toFixed(1)}GB total, ${(freeMem / (1024 * 1024 * 1024)).toFixed(1)}GB free`);

if (memGB < 0.5) {
  console.warn('⚠️  Low system memory detected. Consider upgrading your server.');
}

// Check disk space
try {
  const stats = fs.statSync(__dirname);
  console.log('💿 Application directory is accessible');
} catch (error) {
  console.error('❌ Cannot access application directory:', error.message);
  process.exit(1);
}

console.log('🎉 Pre-deployment setup completed successfully!');
console.log('');
console.log('Next steps:');
console.log('1. pm2 start ecosystem.config.js --env production');
console.log('2. pm2 save');
console.log('3. pm2 startup');
console.log('');
console.log('Monitoring commands:');
console.log('- pm2 status');
console.log('- pm2 logs equator-production');
console.log('- pm2 monit');
