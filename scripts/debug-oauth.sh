#!/bin/bash

# 🔐 OAUTH DEBUGGING SCRIPT
# Run this to diagnose AccessDenied issues

echo "🔍 OAuth AccessDenied Debugging"
echo "==============================="
echo ""

# Check environment variables
echo "📋 Environment Check:"
echo "   NEXTAUTH_URL: ${NEXTAUTH_URL:-'NOT SET'}"
echo "   NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}... (${#NEXTAUTH_SECRET} chars)"
echo "   GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID:-'NOT SET'}"
echo "   GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-'NOT SET'}"
echo ""

# Expected callback URLs
echo "🌐 Required OAuth Callback URLs:"
echo "   GitHub OAuth App Settings:"
echo "   → Authorization callback URL: https://equator.tech/api/auth/callback/github"
echo ""
echo "   Google OAuth 2.0 Client Settings:"
echo "   → Authorized redirect URIs: https://equator.tech/api/auth/callback/google"
echo ""

# Common AccessDenied causes
echo "🚨 Common AccessDenied Causes:"
echo "   1. CALLBACK URL MISMATCH"
echo "      - GitHub: Must be exactly https://equator.tech/api/auth/callback/github"
echo "      - Google: Must be exactly https://equator.tech/api/auth/callback/google"
echo ""
echo "   2. OAUTH APP RESTRICTIONS"
echo "      - Check if OAuth app is restricted to specific users/organizations"
echo "      - Verify the app is not in \"development mode\" limiting users"
echo ""
echo "   3. EMAIL VERIFICATION"
echo "      - Some providers require verified email addresses"
echo "      - Check if user's email is verified with the OAuth provider"
echo ""
echo "   4. DOMAIN VERIFICATION"
echo "      - Ensure equator.tech is verified/authorized in OAuth app settings"
echo ""

echo "🔧 Quick Fixes to Try:"
echo "   1. Double-check callback URLs in OAuth provider dashboards"
echo "   2. Ensure OAuth apps are set to 'production' mode, not 'development'"
echo "   3. Verify user's email is confirmed with GitHub/Google"
echo "   4. Check if there are any IP or domain restrictions on OAuth apps"
echo "   5. Try authenticating with a different user account"
echo ""

echo "📝 Test Authentication:"
echo "   1. Visit: https://equator.tech/auth/login"
echo "   2. Open browser developer tools (F12) → Network tab"
echo "   3. Click GitHub or Google sign-in"
echo "   4. Watch for failed requests to /api/auth/callback/*"
echo "   5. Check console for error messages"
echo ""

echo "🔍 OAuth Provider Debugging:"
echo "   GitHub:"
echo "   → Settings → Developer settings → OAuth Apps → [Your App]"
echo "   → Verify Authorization callback URL: https://equator.tech/api/auth/callback/github"
echo ""
echo "   Google:"
echo "   → Google Cloud Console → APIs & Services → Credentials → [Your OAuth Client]"
echo "   → Verify Authorized redirect URIs includes: https://equator.tech/api/auth/callback/google"
echo ""

echo "✅ If all settings are correct and issue persists:"
echo "   - Check server logs: pm2 logs equator-production"
echo "   - Verify NEXTAUTH_URL is set correctly in production environment"
echo "   - Ensure no firewall blocking OAuth provider callbacks"
