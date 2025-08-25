#!/usr/bin/env node

/**
 * Emergency Environment Variable Checker
 * Debug environment loading issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Emergency Environment Variable Check');
console.log('=====================================');
console.log('');

// Check current working directory
console.log('📍 Current working directory:', process.cwd());
console.log('📍 Script directory:', __dirname);
console.log('');

// Check for environment files
const envFiles = ['.env.production', '.env.local', '.env'];

console.log('📄 Environment Files Check:');
envFiles.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✅' : '❌'} ${file} (${fullPath})`);

  if (exists) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      console.log(`      📊 Contains ${lines.length} environment variables`);

      // Check for critical variables
      const hasNextAuthSecret = content.includes('NEXTAUTH_SECRET=');
      const hasMongoUri = content.includes('MONGODB_URI=');
      console.log(`      🔐 Has NEXTAUTH_SECRET: ${hasNextAuthSecret}`);
      console.log(`      🗄️  Has MONGODB_URI: ${hasMongoUri}`);

      if (hasNextAuthSecret) {
        const match = content.match(/NEXTAUTH_SECRET=(.+)/);
        if (match) {
          const value = match[1].trim();
          console.log(`      🔐 NEXTAUTH_SECRET length: ${value.length} characters`);
        }
      }
    } catch (error) {
      console.log(`      ❌ Error reading file: ${error.message}`);
    }
  }
});

console.log('');

// Test dotenv loading
console.log('🔧 Testing dotenv loading:');
try {
  const dotenv = require('dotenv');

  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`   Testing ${file}...`);

      const result = dotenv.config({ path: fullPath });

      if (result.error) {
        console.log(`      ❌ Error: ${result.error.message}`);
      } else {
        const loadedVars = Object.keys(result.parsed || {});
        console.log(`      ✅ Loaded ${loadedVars.length} variables`);
        console.log(`      📋 Variables: ${loadedVars.join(', ')}`);

        // Check specific variables
        if (result.parsed) {
          const hasNextAuth = result.parsed.NEXTAUTH_SECRET;
          const hasMongo = result.parsed.MONGODB_URI;

          if (hasNextAuth) {
            console.log(`      🔐 NEXTAUTH_SECRET: ${hasNextAuth.length} chars`);
          }
          if (hasMongo) {
            console.log(`      🗄️  MONGODB_URI: ${hasMongo.substring(0, 20)}...`);
          }
        }
      }
      break; // Only test the first found file
    }
  }
} catch (error) {
  console.log(`   ❌ dotenv loading failed: ${error.message}`);
}

console.log('');

// Check current process.env
console.log('🌍 Current process.env check:');
const relevantEnvVars = Object.keys(process.env).filter(key =>
  key.includes('MONGO') ||
  key.includes('NEXTAUTH') ||
  key.includes('GITHUB') ||
  key.includes('GOOGLE') ||
  key.includes('NODE_ENV') ||
  key.includes('PORT')
);

if (relevantEnvVars.length > 0) {
  console.log('   📋 Available relevant variables:');
  relevantEnvVars.forEach(key => {
    const value = process.env[key];
    if (key.includes('SECRET') || key.includes('URI')) {
      console.log(`      ${key}: ${value ? `${value.length} characters` : 'NOT SET'}`);
    } else {
      console.log(`      ${key}: ${value || 'NOT SET'}`);
    }
  });
} else {
  console.log('   ❌ No relevant environment variables found');
}

console.log('');
console.log('🎯 RECOMMENDATIONS:');

const hasNextAuthSecret = process.env.NEXTAUTH_SECRET;
const hasMongoUri = process.env.MONGODB_URI;

if (!hasNextAuthSecret) {
  console.log('   ❌ NEXTAUTH_SECRET not found in process.env');
  console.log('   💡 Ensure .env.production contains: NEXTAUTH_SECRET=your-secret-here');
}

if (!hasMongoUri) {
  console.log('   ❌ MONGODB_URI not found in process.env');
  console.log('   💡 Ensure .env.production contains: MONGODB_URI=your-mongo-connection');
}

if (hasNextAuthSecret && hasMongoUri) {
  console.log('   ✅ All required environment variables are present');
  console.log('   🚀 Server should start successfully');
}

console.log('');
console.log('🔧 To fix PM2 issues:');
console.log('   1. pm2 stop equators-production');
console.log('   2. pm2 start ecosystem.config.js --env production');
console.log('   3. pm2 logs equators-production');
