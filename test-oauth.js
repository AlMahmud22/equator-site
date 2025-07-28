/**
 * OAuth Integration Test Script
 * 
 * This script documents the OAuth integration and provides testing guidance.
 * Run `npm run dev` and test the following URLs:
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (
  process.env.NODE_ENV === 'production' 
  ? 'https://equators.tech' 
  : 'http://localhost:3000'
);

console.log(`
🚀 OAuth Integration Test Guide
=====================================

1. Start the development server:
   npm run dev

2. Test OAuth Redirect URLs:
   - Google OAuth: ${siteUrl}/api/auth/oauth?provider=google
   - GitHub OAuth: ${siteUrl}/api/auth/oauth?provider=github

3. Test Login/Register Pages:
   - Login: ${siteUrl}/auth/login
   - Register: ${siteUrl}/auth/register

4. Test User Profile:
   - Profile: ${siteUrl}/api/auth/profile

5. Environment Variables Required:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GITHUB_CLIENT_ID
   - GITHUB_CLIENT_SECRET
   - NEXT_PUBLIC_SITE_URL (for dynamic URLs)
   - MONGODB_URI
   - JWT_SECRET

6. OAuth Flow:
   a) User clicks "Sign in with Google/GitHub"
   b) Redirected to /api/auth/oauth?provider=google|github
   c) Redirected to OAuth provider (Google/GitHub)
   d) User authorizes the app
   e) Redirected back to /api/auth/oauth/callback
   f) App exchanges code for tokens
   g) User profile is fetched from provider
   h) User is created/updated in MongoDB
   i) JWT token is generated and set as HTTP-only cookie
   j) User is redirected to home page (/?auth=success)

✅ All components are integrated and ready for testing!
`)

// Test function to verify environment variables
function checkEnvironment() {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'MONGODB_URI',
    'JWT_SECRET'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    console.log('Please add them to your .env.local file')
  } else {
    console.log('✅ All required environment variables are set')
  }
}

checkEnvironment()
