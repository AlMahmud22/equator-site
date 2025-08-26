# 🔧 Authentication Error Fix Guide

## Issue: "Access denied. You do not have permission to sign in"

The authentication error you're experiencing is typically caused by OAuth app configuration issues or security restrictions. Here's how to fix it:

## 🔍 Root Cause Analysis

The `AccessDenied` error usually occurs due to:
1. **OAuth App Configuration**: Incorrect callback URLs or app restrictions
2. **Environment Variables**: Missing or incorrect OAuth credentials
3. **Security Restrictions**: OAuth app limited to specific users/organizations
4. **Overly Restrictive Security Settings**: Server-side blocking legitimate users

## ✅ Fixes Applied

I've made the following changes to make authentication more permissive:

### 1. **Reduced Security Restrictions**
- Increased rate limiting from 5 to 20 attempts
- Reduced cooldown from 15 to 5 minutes
- Made suspicious activity detection more permissive
- Disabled blocking of legitimate users in development mode

### 2. **Improved Error Handling**
- Enhanced error page with troubleshooting suggestions
- Better logging for debugging authentication issues
- More descriptive error messages

## 🛠️ Configuration Steps

### Step 1: Check Environment Variables
Ensure your `.env.local` file has correct values:

```bash
# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-minimum

# GitHub OAuth App
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth App  
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equators-tech?retryWrites=true&w=majority
```

### Step 2: GitHub OAuth App Configuration

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App or edit existing one:
   - **Application name**: Equators Site
   - **Homepage URL**: `http://localhost:3000` (development) or `https://your-domain.com` (production)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

3. **Important**: Remove any organization restrictions
   - Don't limit the app to specific organizations
   - Allow all users to sign in

### Step 3: Google OAuth App Configuration

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID or edit existing:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

3. **Important**: Ensure the app is not in testing mode with limited users
   - Publish the app or add your email to test users

### Step 4: Database Check

Ensure MongoDB is accessible:
```bash
# Test connection
npm run db:health
```

## 🚀 Testing Steps

1. **Clear browser data**:
   - Clear cookies and cache
   - Try incognito/private browsing mode

2. **Test authentication**:
   ```bash
   npm run dev
   # Navigate to http://localhost:3000/auth/login
   # Try both GitHub and Google login
   ```

3. **Check logs**:
   - Open browser developer tools → Console
   - Check for any JavaScript errors
   - Monitor network tab for failed requests

## 🐛 Additional Debugging

If issues persist, check the following:

### Server Logs
```bash
# Check NextAuth logs
npm run dev
# Look for authentication-related console output
```

### OAuth App Status
- **GitHub**: Ensure app is active and not suspended
- **Google**: Ensure app is published or you're in test users list

### Network Issues
- Check if you're behind a corporate firewall
- Try different network connection
- Disable browser extensions temporarily

## 🔧 Emergency Fixes

If you need immediate access:

1. **Temporary OAuth Bypass** (Development Only):
   - Comment out suspicious activity detection
   - Disable rate limiting
   - Add debug logging

2. **Alternative Login Method**:
   - Use a different OAuth provider
   - Test with a different email address
   - Try from a different device/browser

## 📞 Support

If none of these solutions work:

1. **Check the enhanced error page**: Navigate to `/auth/error` after failed login
2. **Review server logs**: Look for specific error messages
3. **Test OAuth URLs directly**: Visit the callback URLs to check configuration

## ✅ Success Indicators

You'll know it's working when:
- Login redirects to GitHub/Google without errors
- You're redirected back to the profile page
- No "Access Denied" errors appear
- User session is properly created

The authentication system is now much more permissive and should allow legitimate users to sign in successfully.
