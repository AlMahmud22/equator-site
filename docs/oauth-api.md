# Equators Authentication Hub

The Equators Auth Hub provides a complete OAuth 2.0 server implementation for securely authenticating users across multiple applications.

## API Overview

### OAuth 2.0 Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/oauth/authorize` | Authorization endpoint for initiating the OAuth flow |
| `/api/oauth/token` | Token endpoint for exchanging authorization codes or refresh tokens |
| `/api/oauth/userinfo` | User information endpoint for retrieving user data |

### App Management API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/apps` | GET | List registered applications |
| `/api/apps` | POST | Register a new application |
| `/api/apps/[id]` | GET | Get application details |
| `/api/apps/[id]` | PUT | Update application |
| `/api/apps/[id]` | DELETE | Delete/revoke application |
| `/api/apps/admin` | GET | Admin: List applications with filtering |
| `/api/apps/admin` | POST | Admin: Approve/reject/suspend applications |
| `/api/apps/stats` | GET | Admin: Get application statistics |

### Token Management API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tokens` | GET | List active tokens |
| `/api/tokens` | POST | Revoke tokens |

## OAuth 2.0 Flow

### Authorization Code Flow

1. Redirect user to authorization endpoint:
   ```
   GET /api/oauth/authorize?
     response_type=code&
     client_id=YOUR_CLIENT_ID&
     redirect_uri=YOUR_REDIRECT_URI&
     scope=profile:read&
     state=RANDOM_STATE
   ```

2. User authenticates and grants permission

3. User is redirected back to your application:
   ```
   YOUR_REDIRECT_URI?code=AUTHORIZATION_CODE&state=RANDOM_STATE
   ```

4. Exchange authorization code for tokens:
   ```
   POST /api/oauth/token
   Content-Type: application/json

   {
     "grant_type": "authorization_code",
     "code": "AUTHORIZATION_CODE",
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "redirect_uri": "YOUR_REDIRECT_URI"
   }
   ```

5. Response contains access and refresh tokens:
   ```json
   {
     "access_token": "ACCESS_TOKEN",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "REFRESH_TOKEN",
     "scope": "profile:read"
   }
   ```

### Authorization Code Flow with PKCE (for public clients)

1. Generate a code verifier and challenge:
   ```javascript
   const codeVerifier = generateCodeVerifier();
   const codeChallenge = generateCodeChallenge(codeVerifier);
   ```

2. Redirect user to authorization endpoint with code challenge:
   ```
   GET /api/oauth/authorize?
     response_type=code&
     client_id=YOUR_CLIENT_ID&
     redirect_uri=YOUR_REDIRECT_URI&
     scope=profile:read&
     state=RANDOM_STATE&
     code_challenge=CODE_CHALLENGE&
     code_challenge_method=S256
   ```

3. Exchange authorization code for tokens using code verifier:
   ```
   POST /api/oauth/token
   Content-Type: application/json

   {
     "grant_type": "authorization_code",
     "code": "AUTHORIZATION_CODE",
     "client_id": "YOUR_CLIENT_ID",
     "redirect_uri": "YOUR_REDIRECT_URI",
     "code_verifier": "CODE_VERIFIER"
   }
   ```

### Refresh Token Flow

1. Exchange refresh token for a new access token:
   ```
   POST /api/oauth/token
   Content-Type: application/json

   {
     "grant_type": "refresh_token",
     "refresh_token": "REFRESH_TOKEN",
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET"
   }
   ```

## Available Scopes

| Scope | Description |
|-------|-------------|
| `profile:read` | Read basic profile information |
| `email:read` | Read email address |
| `profile:extended` | Read extended profile information |
| `profile:write` | Update profile information |
| `admin:read` | Access admin-level user information |

## Application Registration

1. Register a new application:
   ```
   POST /api/apps
   Content-Type: application/json

   {
     "name": "My Application",
     "description": "Application description",
     "redirectUris": ["https://myapp.com/callback"],
     "appType": "web",
     "allowedOrigins": ["https://myapp.com"]
   }
   ```

2. Response contains client credentials:
   ```json
   {
     "success": true,
     "app": {
       "clientId": "CLIENT_ID",
       "name": "My Application",
       "description": "Application description",
       "status": "pending"
     },
     "message": "Application created successfully"
   }
   ```

For more information, see the [full documentation](/docs/auth).
