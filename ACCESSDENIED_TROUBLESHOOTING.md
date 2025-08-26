# 🚨 OAUTH ACCESSDENIED ERROR - COMPREHENSIVE FIX GUIDE

## 🔍 **IMMEDIATE DIAGNOSIS**

You're experiencing: `https://equators.tech/auth/error?error=AccessDenied`

**Root Cause**: OAuth provider rejecting authentication requests due to configuration mismatch.

---

## 🎯 **MOST LIKELY CAUSE: CALLBACK URL MISMATCH**

### GitHub OAuth App Settings
1. Go to: **GitHub → Settings → Developer settings → OAuth Apps → [Your App]**
2. **CRITICAL**: Verify "Authorization callback URL" is **EXACTLY**:
   ```
   https://equators.tech/api/auth/callback/github
   ```
3. **NO trailing slash, NO variations, must match exactly**

### Google OAuth 2.0 Client Settings  
1. Go to: **Google Cloud Console → APIs & Services → Credentials → [Your OAuth Client]**
2. **CRITICAL**: Verify "Authorized redirect URIs" includes **EXACTLY**:
   ```
   https://equators.tech/api/auth/callback/google
   ```
3. **Must be HTTPS, exact domain match**

---

## 🔧 **STEP-BY-STEP FIX CHECKLIST**

### Step 1: Verify OAuth App Settings
- [ ] GitHub callback URL: `https://equators.tech/api/auth/callback/github`
- [ ] Google redirect URI: `https://equators.tech/api/auth/callback/google`
- [ ] No typos, no extra characters, exact match
- [ ] HTTPS protocol (not HTTP)

### Step 2: Check OAuth App Status
- [ ] GitHub: OAuth app is **not** in development mode
- [ ] Google: OAuth consent screen is published (not testing)
- [ ] Apps are not restricted to specific users/organizations
- [ ] Domain verification completed if required

### Step 3: Environment Variables
```bash
# Verify these are set correctly:
NEXTAUTH_URL=https://equators.tech           # ✅ CRITICAL
NEXTAUTH_SECRET=your-secret-here             # ✅ Required
GITHUB_CLIENT_ID=your-github-client-id      # ✅ Public
GITHUB_CLIENT_SECRET=your-github-secret     # ✅ Secret
GOOGLE_CLIENT_ID=your-google-client-id      # ✅ Public  
GOOGLE_CLIENT_SECRET=your-google-secret     # ✅ Secret
```

### Step 4: Test Authentication Flow
1. Visit: `https://equators.tech/auth/login`
2. Open browser Developer Tools (F12) → Network tab
3. Click "Sign in with GitHub" or "Sign in with Google"
4. Watch for failed network requests
5. Check console for error messages

---

## 🚨 **COMMON ACCESSDENIED CAUSES & FIXES**

### 1. **Callback URL Mismatch** (90% of cases)
**Problem**: OAuth app has wrong callback URL
**Fix**: Update callback URLs to exact values above

### 2. **Development Mode Restrictions**
**Problem**: OAuth app limited to specific users in development
**Fix**: 
- GitHub: Ensure app is not in "development mode"
- Google: Publish OAuth consent screen, don't keep in "testing"

### 3. **Domain Verification Issues**
**Problem**: Domain not verified with OAuth provider
**Fix**:
- Google: Verify `equators.tech` domain in Google Search Console
- GitHub: No domain verification required

### 4. **Email Verification**
**Problem**: User's email not verified with OAuth provider
**Fix**: User must verify email with GitHub/Google before authentication

### 5. **Organization Restrictions**
**Problem**: OAuth app restricted to specific GitHub organizations
**Fix**: Remove organization restrictions or add user's organization

---

## 🔍 **DEBUG COMMANDS**

### Check Environment Setup
```bash
cd /path/to/equators-site
node scripts/check-env.js
```

### Run OAuth Debug Script
```bash
bash scripts/debug-oauth.sh
```

### Check Server Logs
```bash
pm2 logs equators-production --lines 50
```

---

## 🛠️ **MANUAL VERIFICATION STEPS**

### Test Callback URLs Manually
1. **GitHub Test**:
   - Visit: `https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&redirect_uri=https://equators.tech/api/auth/callback/github`
   - Should redirect to GitHub auth, then back to your site

2. **Google Test**:
   - Visit Google OAuth playground
   - Test redirect to: `https://equators.tech/api/auth/callback/google`

### Browser Console Check
1. Open `https://equators.tech/auth/login`
2. Press F12 → Console tab
3. Click OAuth login button
4. Look for error messages like:
   - "redirect_uri_mismatch"
   - "unauthorized_client"
   - "access_denied"

---

## 🎯 **EXPECTED SUCCESSFUL FLOW**

1. User visits `/auth/login`
2. Clicks "Sign in with GitHub/Google"
3. Redirects to `https://github.com/login/oauth/authorize?...`
4. User authorizes app
5. GitHub redirects to `https://equators.tech/api/auth/callback/github`
6. NextAuth processes callback
7. User redirected to `/profile` with active session

---

## 📞 **IF ISSUE PERSISTS**

### Additional Checks
- [ ] Clear browser cookies and cache
- [ ] Try different browser/incognito mode
- [ ] Test with different user account
- [ ] Verify no firewall/proxy blocking OAuth providers
- [ ] Check if OAuth apps have rate limiting enabled

### OAuth Provider Support
- **GitHub**: Check OAuth app status in GitHub settings
- **Google**: Verify OAuth consent screen configuration
- **Both**: Ensure no recent changes to app configurations

### Last Resort Fixes
1. **Recreate OAuth Apps**: Create new GitHub/Google OAuth applications
2. **Update Credentials**: Replace client IDs and secrets in environment variables
3. **Domain Change**: Temporarily test with different domain if possible

---

## ✅ **SUCCESS VERIFICATION**

After fixing OAuth configuration:
1. Clear browser cache completely
2. Visit `https://equators.tech/auth/login`
3. Test both GitHub and Google authentication
4. Verify successful redirect to profile page
5. Check session persistence across page reloads

**Expected Result**: No more AccessDenied errors, successful OAuth authentication.

---

## 📋 **QUICK REFERENCE**

**GitHub Callback URL**: `https://equators.tech/api/auth/callback/github`
**Google Callback URL**: `https://equators.tech/api/auth/callback/google`
**Debug URL**: `https://equators.tech/auth/error?error=AccessDenied`

**Most Common Fix**: Update OAuth app callback URLs to match exactly.
