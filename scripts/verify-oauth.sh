#!/bin/bash

# 🚀 PRODUCTION OAUTH VERIFICATION SCRIPT
# Run this script after deploying OAuth fixes to verify everything works

echo "🔐 OAuth Authentication System Verification"
echo "=========================================="
echo ""

# Check environment variables
echo "📋 Environment Variables Check:"
if [ -f ".env.production" ]; then
    echo "   ✅ .env.production exists"
else
    echo "   ❌ .env.production missing"
fi

if [ -n "$NEXTAUTH_SECRET" ]; then
    echo "   ✅ NEXTAUTH_SECRET set (${#NEXTAUTH_SECRET} chars)"
else
    echo "   ❌ NEXTAUTH_SECRET missing"
fi

if [ -n "$GITHUB_CLIENT_ID" ]; then
    echo "   ✅ GITHUB_CLIENT_ID set"
else
    echo "   ❌ GITHUB_CLIENT_ID missing"
fi

if [ -n "$GITHUB_CLIENT_SECRET" ]; then
    echo "   ✅ GITHUB_CLIENT_SECRET set (${#GITHUB_CLIENT_SECRET} chars)"
else
    echo "   ❌ GITHUB_CLIENT_SECRET missing"
fi

if [ -n "$GOOGLE_CLIENT_ID" ]; then
    echo "   ✅ GOOGLE_CLIENT_ID set"
else
    echo "   ❌ GOOGLE_CLIENT_ID missing"
fi

if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    echo "   ✅ GOOGLE_CLIENT_SECRET set (${#GOOGLE_CLIENT_SECRET} chars)"
else
    echo "   ❌ GOOGLE_CLIENT_SECRET missing"
fi

echo ""

# Check build
echo "🔨 Build Verification:"
npm run build > build.log 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed - check build.log"
fi

# Check for client secret exposure
echo ""
echo "🔍 Security Check:"
if grep -r "CLIENT_SECRET" .next/ 2>/dev/null | grep -v node_modules; then
    echo "   ❌ WARNING: Client secrets found in build output"
else
    echo "   ✅ No client secrets in build output"
fi

# Check OAuth endpoints
echo ""
echo "🌐 OAuth Endpoints Check:"
if [ -f "pages/api/auth/[...nextauth].ts" ]; then
    echo "   ✅ NextAuth endpoint exists"
else
    echo "   ❌ NextAuth endpoint missing"
fi

if [ -f "pages/auth/login.tsx" ]; then
    echo "   ✅ Login page exists"
else
    echo "   ❌ Login page missing"
fi

if [ -f "pages/auth/error.tsx" ]; then
    echo "   ✅ Error page exists"
else
    echo "   ❌ Error page missing"
fi

echo ""
echo "📝 Manual Tests Required:"
echo "   1. Visit: https://equators.tech/auth/login"
echo "   2. Test GitHub OAuth login"
echo "   3. Test Google OAuth login" 
echo "   4. Verify redirect to /profile"
echo "   5. Check browser console for errors"
echo ""

echo "🎯 Expected Callback URLs:"
echo "   GitHub: https://equators.tech/api/auth/callback/github"
echo "   Google: https://equators.tech/api/auth/callback/google"
echo ""

echo "✅ OAuth security fixes verification complete!"
echo "   If all checks pass, your authentication system is secure and ready."
