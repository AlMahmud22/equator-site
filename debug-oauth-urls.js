#!/usr/bin/env node

/**
 * OAuth URL Debug Script
 * 
 * This script helps debug OAuth redirect URI issues by showing
 * what URLs will be generated with current environment variables.
 */

console.log('🔍 OAuth URL Debug Information');
console.log('='.repeat(50));

// Get environment variables
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const API_BASE_URL = process.env.API_BASE_URL;
const NODE_ENV = process.env.NODE_ENV;

console.log('\n📋 Environment Variables:');
console.log(`NODE_ENV: ${NODE_ENV || 'undefined'}`);
console.log(`NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL || 'undefined'}`);
console.log(`API_BASE_URL: ${API_BASE_URL || 'undefined'}`);

// Simulate the logic from oauthController.ts
function generateRedirectUri(mockHost = 'equators.tech') {
  // Simulate the baseUrl logic
  let baseUrl = NEXT_PUBLIC_SITE_URL || API_BASE_URL || `https://${mockHost}`;
  
  // Apply the same normalization as in the controller
  baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  baseUrl = baseUrl.replace(/\/api$/, ''); // Remove /api suffix if present
  
  return `${baseUrl}/api/auth/oauth/callback`;
}

console.log('\n🔗 Generated OAuth URLs:');
console.log('Google OAuth redirect:', generateRedirectUri());
console.log('GitHub OAuth redirect:', generateRedirectUri());

console.log('\n✅ Recommended Settings:');
console.log('For production (equators.tech):');
console.log('  NEXT_PUBLIC_SITE_URL=https://equators.tech');
console.log('\nFor local development:');
console.log('  NEXT_PUBLIC_SITE_URL=http://localhost:3000');

console.log('\n⚠️  Common Issues:');
console.log('❌ WRONG: NEXT_PUBLIC_SITE_URL=https://equators.tech/api');
console.log('❌ WRONG: NEXT_PUBLIC_SITE_URL=https://equators.tech/');
console.log('✅ RIGHT: NEXT_PUBLIC_SITE_URL=https://equators.tech');

console.log('\n🛠️  Google Cloud Console Setup:');
console.log('Add these authorized redirect URIs:');
console.log('  - https://equators.tech/api/auth/oauth/callback');
console.log('  - http://localhost:3000/api/auth/oauth/callback (for development)');

console.log('\n' + '='.repeat(50));
