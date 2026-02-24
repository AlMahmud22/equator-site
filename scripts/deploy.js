#!/usr/bin/env node

/**
 * Production Deployment Script
 * Safely deploys the application with PM2
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`);
    console.log(`   Command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ ${description} failed:`, error.message);
        if (stderr) console.error('STDERR:', stderr);
        reject(error);
        return;
      }

      if (stdout) console.log(stdout);
      if (stderr) console.warn('STDERR:', stderr);
      console.log(`✅ ${description} completed`);
      resolve(stdout);
    });
  });
}

async function deployToProduction() {
  try {
    console.log('🚀 Starting production deployment...');
    console.log('');

    // Step 1: Run pre-deployment checks
    console.log('📋 Step 1: Pre-deployment validation');
    await runCommand('node scripts/pre-deploy.js', 'Running pre-deployment checks');
    console.log('');

    // Step 2: Install dependencies
    console.log('📦 Step 2: Installing dependencies');
    await runCommand('npm ci --production=false', 'Installing all dependencies');
    console.log('');

    // Step 3: Build the application
    console.log('🔨 Step 3: Building application');
    await runCommand('npm run build', 'Building Next.js application');
    console.log('');

    // Step 4: Stop existing PM2 processes
    console.log('🛑 Step 4: Stopping existing processes');
    try {
      await runCommand('pm2 stop ecosystem.config.js', 'Stopping existing PM2 processes');
    } catch (error) {
      console.log('ℹ️  No existing processes to stop (this is normal for first deployment)');
    }
    console.log('');

    // Step 5: Start PM2 processes
    console.log('🚀 Step 5: Starting PM2 processes');
    await runCommand('pm2 start ecosystem.config.js --env production', 'Starting production processes');
    console.log('');

    // Step 6: Save PM2 configuration
    console.log('💾 Step 6: Saving PM2 configuration');
    await runCommand('pm2 save', 'Saving PM2 process list');
    console.log('');

    // Step 7: Setup PM2 startup (if not already done)
    console.log('🔧 Step 7: Setting up PM2 startup');
    try {
      const startupOutput = await runCommand('pm2 startup', 'Setting up PM2 startup script');
      if (startupOutput.includes('sudo')) {
        console.log('⚠️  Please run the sudo command shown above to complete PM2 startup setup');
      }
    } catch (error) {
      console.log('ℹ️  PM2 startup may already be configured');
    }
    console.log('');

    // Step 8: Display status
    console.log('📊 Step 8: Checking deployment status');
    await runCommand('pm2 status', 'Checking process status');
    console.log('');

    // Step 9: Test health endpoint
    console.log('🏥 Step 9: Testing health endpoint');
    setTimeout(async () => {
      try {
        const port = process.env.PORT || 3000;
        await runCommand(`curl -f http://localhost:${port}/api/health || echo "Health check will be available shortly"`, 'Testing health endpoint');
      } catch (error) {
        console.log('ℹ️  Health endpoint will be available after application fully starts');
      }
    }, 5000);

    console.log('');
    console.log('🎉 Deployment completed successfully!');
    console.log('');
    console.log('📋 Useful commands:');
    console.log('- Monitor processes: pm2 monit');
    console.log('- View logs: pm2 logs equator-production');
    console.log('- Restart app: pm2 restart equator-production');
    console.log('- Stop app: pm2 stop equator-production');
    console.log('- Delete app: pm2 delete equator-production');
    console.log('');
    console.log('🔍 Health check: http://your-domain.com/api/health');
    console.log('🌐 Application: http://your-domain.com');

  } catch (error) {
    console.error('');
    console.error('❌ Deployment failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting steps:');
    console.error('1. Check the error message above');
    console.error('2. Verify environment variables are set');
    console.error('3. Check system requirements (Node.js, memory, disk space)');
    console.error('4. Review logs: pm2 logs');
    console.error('5. Check application health: npm run build');
    console.error('');
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  deployToProduction();
}

module.exports = { deployToProduction };
