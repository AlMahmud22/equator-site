# External App Integration API Documentation

## Overview

The Equators External App Integration API enables desktop applications and third-party services to authenticate users and access their data through a secure OAuth 2.0 flow with PKCE (Proof Key for Code Exchange) support.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [SDK Documentation](#sdk-documentation)
5. [Security Features](#security-features)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

## Getting Started

### 1. Register Your Application

Before you can integrate with the Equators API, you need to register your application:

```bash
POST /api/apps
Authorization: Bearer {your_user_session_token}
Content-Type: application/json

{
  "name": "My Desktop App",
  "description": "A desktop application for managing AI models",
  "redirectUri": "myapp://auth/callback",
  "website": "https://myapp.com",
  "iconUrl": "https://myapp.com/icon.png",
  "scopes": ["profile:read", "models:read", "models:write"],
  "requirePKCE": true,
  "autoApprove": false
}
```

**Response:**

```json
{
  "success": true,
  "app": {
    "_id": "app_12345",
    "name": "My Desktop App",
    "clientId": "eq_1234567890abcdef",
    "status": "pending",
    "isVerified": false,
    "createdAt": "2025-08-25T10:00:00Z"
  }
}
```

### 2. Available Scopes

| Scope            | Description                       | Sensitive |
| ---------------- | --------------------------------- | --------- |
| `profile:read`   | Read basic profile information    | No        |
| `profile:write`  | Update profile information        | Yes       |
| `email:read`     | Access email address              | Yes       |
| `models:read`    | View AI models and configurations | No        |
| `models:write`   | Create and modify AI models       | Yes       |
| `analytics:read` | View usage analytics              | Yes       |
| `admin:read`     | Read administrative data          | Yes       |

## Authentication Flow

### OAuth 2.0 Authorization Code Flow with PKCE

#### Step 1: Generate PKCE Challenge

```javascript
// Generate code verifier and challenge
const codeVerifier = base64URLEncode(crypto.randomBytes(32))
const codeChallenge = base64URLEncode(sha256(codeVerifier))
```

#### Step 2: Authorization Request

```
GET /api/auth/desktop/authorize?
  client_id={your_client_id}&
  redirect_uri={your_redirect_uri}&
  scope=profile:read models:read&
  response_type=code&
  state={random_state}&
  code_challenge={code_challenge}&
  code_challenge_method=S256
```

#### Step 3: User Consent

The user will be redirected to a consent screen where they can approve the requested permissions.

#### Step 4: Authorization Code

After approval, the user is redirected back to your app:

```
myapp://auth/callback?
  code={authorization_code}&
  state={your_state}
```

#### Step 5: Token Exchange

```bash
POST /api/auth/desktop/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
client_id={your_client_id}&
code={authorization_code}&
redirect_uri={your_redirect_uri}&
code_verifier={code_verifier}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile:read models:read"
}
```

## API Endpoints

### App Management

#### Register Application

```bash
POST /api/apps
Authorization: Bearer {user_session_token}
```

#### List Applications

```bash
GET /api/apps
Authorization: Bearer {user_session_token}
```

#### Delete Application

```bash
DELETE /api/apps/{app_id}
Authorization: Bearer {user_session_token}
```

### OAuth Flow

#### Authorization

```bash
GET /api/auth/desktop/authorize
```

#### Token Exchange

```bash
POST /api/auth/desktop/token
```

#### Refresh Token

```bash
POST /api/auth/desktop/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
client_id={your_client_id}&
refresh_token={your_refresh_token}
```

### User Data Access

#### Get User Profile

```bash
GET /api/user/profile
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_12345",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00Z",
    "profile": {
      "bio": "AI enthusiast",
      "website": "https://johndoe.com",
      "location": "San Francisco"
    }
  },
  "scopes": ["profile:read", "email:read"]
}
```

#### Get User Permissions

```bash
GET /api/user/permissions
Authorization: Bearer {access_token}
```

#### Remote Logout

```bash
POST /api/user/logout
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "revoke_all": false
}
```

## SDK Documentation

### JavaScript/Node.js SDK

```javascript
class EquatorsAPI {
  constructor(clientId, clientSecret = null) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.baseURL = 'https://equators.tech'
    this.accessToken = null
    this.refreshToken = null
  }

  // Generate PKCE challenge
  generatePKCE() {
    const codeVerifier = this.base64URLEncode(crypto.randomBytes(32))
    const codeChallenge = this.base64URLEncode(
      crypto.createHash('sha256').update(codeVerifier).digest()
    )

    return { codeVerifier, codeChallenge }
  }

  // Get authorization URL
  getAuthorizationURL(redirectUri, scopes, state) {
    const { codeVerifier, codeChallenge } = this.generatePKCE()

    // Store code verifier for later use
    this.codeVerifier = codeVerifier

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      response_type: 'code',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return `${this.baseURL}/api/auth/desktop/authorize?${params}`
  }

  // Exchange authorization code for tokens
  async exchangeCodeForToken(code, redirectUri) {
    const response = await fetch(`${this.baseURL}/api/auth/desktop/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code: code,
        redirect_uri: redirectUri,
        code_verifier: this.codeVerifier,
      }),
    })

    const data = await response.json()

    if (data.access_token) {
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token
    }

    return data
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.baseURL}/api/auth/desktop/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        refresh_token: this.refreshToken,
      }),
    })

    const data = await response.json()

    if (data.access_token) {
      this.accessToken = data.access_token
    }

    return data
  }

  // Make authenticated API request
  async apiRequest(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Auto-refresh token if expired
    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken()

      // Retry request with new token
      return fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
    }

    return response
  }

  // Get user profile
  async getUserProfile() {
    const response = await this.apiRequest('/api/user/profile')
    return response.json()
  }

  // Get user permissions
  async getUserPermissions() {
    const response = await this.apiRequest('/api/user/permissions')
    return response.json()
  }

  // Remote logout
  async logout(revokeAll = false) {
    const response = await this.apiRequest('/api/user/logout', {
      method: 'POST',
      body: JSON.stringify({ revoke_all: revokeAll }),
    })

    // Clear local tokens
    this.accessToken = null
    this.refreshToken = null

    return response.json()
  }

  // Utility function
  base64URLEncode(buffer) {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }
}

// Usage example
const api = new EquatorsAPI('eq_your_client_id')

// Get authorization URL
const authUrl = api.getAuthorizationURL(
  'myapp://auth/callback',
  ['profile:read', 'models:read'],
  'random_state_value'
)

// Open authorization URL in browser
// After user approval, extract code from callback

// Exchange code for tokens
const tokens = await api.exchangeCodeForToken(code, 'myapp://auth/callback')

// Make API calls
const profile = await api.getUserProfile()
console.log(profile)
```

### Python SDK

```python
import requests
import secrets
import hashlib
import base64
from urllib.parse import urlencode, urlparse, parse_qs

class EquatorsAPI:
    def __init__(self, client_id, client_secret=None):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = 'https://equators.tech'
        self.access_token = None
        self.refresh_token = None
        self.code_verifier = None

    def generate_pkce(self):
        """Generate PKCE code verifier and challenge"""
        self.code_verifier = base64.urlsafe_b64encode(
            secrets.token_bytes(32)
        ).decode('utf-8').rstrip('=')

        challenge = hashlib.sha256(self.code_verifier.encode()).digest()
        code_challenge = base64.urlsafe_b64encode(challenge).decode('utf-8').rstrip('=')

        return self.code_verifier, code_challenge

    def get_authorization_url(self, redirect_uri, scopes, state):
        """Get authorization URL for OAuth flow"""
        code_verifier, code_challenge = self.generate_pkce()

        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'scope': ' '.join(scopes),
            'response_type': 'code',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }

        return f"{self.base_url}/api/auth/desktop/authorize?{urlencode(params)}"

    def exchange_code_for_token(self, code, redirect_uri):
        """Exchange authorization code for access token"""
        data = {
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'code': code,
            'redirect_uri': redirect_uri,
            'code_verifier': self.code_verifier
        }

        response = requests.post(
            f"{self.base_url}/api/auth/desktop/token",
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

        token_data = response.json()

        if 'access_token' in token_data:
            self.access_token = token_data['access_token']
            self.refresh_token = token_data.get('refresh_token')

        return token_data

    def refresh_access_token(self):
        """Refresh access token using refresh token"""
        if not self.refresh_token:
            raise ValueError("No refresh token available")

        data = {
            'grant_type': 'refresh_token',
            'client_id': self.client_id,
            'refresh_token': self.refresh_token
        }

        response = requests.post(
            f"{self.base_url}/api/auth/desktop/token",
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

        token_data = response.json()

        if 'access_token' in token_data:
            self.access_token = token_data['access_token']

        return token_data

    def api_request(self, endpoint, method='GET', **kwargs):
        """Make authenticated API request"""
        if not self.access_token:
            raise ValueError("No access token available")

        headers = kwargs.pop('headers', {})
        headers['Authorization'] = f'Bearer {self.access_token}'

        response = requests.request(
            method,
            f"{self.base_url}{endpoint}",
            headers=headers,
            **kwargs
        )

        # Auto-refresh token if expired
        if response.status_code == 401 and self.refresh_token:
            self.refresh_access_token()
            headers['Authorization'] = f'Bearer {self.access_token}'
            response = requests.request(
                method,
                f"{self.base_url}{endpoint}",
                headers=headers,
                **kwargs
            )

        return response

    def get_user_profile(self):
        """Get user profile data"""
        response = self.api_request('/api/user/profile')
        return response.json()

    def get_user_permissions(self):
        """Get user permissions for this app"""
        response = self.api_request('/api/user/permissions')
        return response.json()

    def logout(self, revoke_all=False):
        """Remote logout and revoke tokens"""
        response = self.api_request(
            '/api/user/logout',
            method='POST',
            json={'revoke_all': revoke_all}
        )

        # Clear local tokens
        self.access_token = None
        self.refresh_token = None

        return response.json()

# Usage example
api = EquatorsAPI('eq_your_client_id')

# Get authorization URL
auth_url = api.get_authorization_url(
    'myapp://auth/callback',
    ['profile:read', 'models:read'],
    'random_state_value'
)

print(f"Please visit: {auth_url}")

# After user approval, extract code from callback URL
code = input("Enter the authorization code: ")

# Exchange code for tokens
tokens = api.exchange_code_for_token(code, 'myapp://auth/callback')
print("Tokens received:", tokens)

# Make API calls
profile = api.get_user_profile()
print("User profile:", profile)
```

## Security Features

### 1. PKCE (Proof Key for Code Exchange)

- Required for all desktop applications
- Protects against authorization code interception attacks
- Uses SHA256 hashing for code challenge generation

### 2. Rate Limiting

- 20 requests per minute for app management APIs
- 100 requests per 15 minutes for OAuth endpoints
- Per-IP and per-app rate limiting

### 3. Comprehensive Logging

- All API calls are logged with security events
- Risk scoring for suspicious activities
- Real-time monitoring and alerting

### 4. Token Security

- JWT tokens with configurable expiration
- Secure token storage with database validation
- Automatic token cleanup and revocation

### 5. Scope-based Permissions

- Fine-grained access control
- User consent for all permissions
- Ability to revoke permissions at any time

## Error Handling

### Standard Error Response Format

```json
{
  "error": "error_code",
  "error_description": "Human readable error description",
  "error_uri": "https://docs.equators.tech/errors#error_code"
}
```

### Common Error Codes

| Error Code               | Description                                 |
| ------------------------ | ------------------------------------------- |
| `invalid_request`        | Missing or invalid request parameters       |
| `invalid_client`         | Invalid client credentials                  |
| `invalid_grant`          | Invalid authorization code or refresh token |
| `unsupported_grant_type` | Unsupported grant type                      |
| `invalid_scope`          | Invalid or unauthorized scope               |
| `access_denied`          | User denied access                          |
| `server_error`           | Internal server error                       |

## Rate Limiting

### Limits by Endpoint

| Endpoint              | Limit         | Window     |
| --------------------- | ------------- | ---------- |
| `/api/apps/*`         | 20 requests   | 1 minute   |
| `/api/auth/desktop/*` | 100 requests  | 15 minutes |
| `/api/user/*`         | 1000 requests | 1 hour     |

### Rate Limit Headers

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
X-RateLimit-Reset: 1640995200
```

## Examples

### Complete Desktop App Integration

```javascript
// main.js - Electron main process
const { app, BrowserWindow, protocol } = require('electron')
const { EquatorsAPI } = require('./equators-sdk')

const CLIENT_ID = 'eq_your_client_id'
const REDIRECT_URI = 'equators://auth/callback'

let mainWindow
let equatorsAPI

app.whenReady(() => {
  // Register custom protocol
  protocol.registerHttpProtocol('equators', (request, callback) => {
    const url = new URL(request.url)
    if (url.pathname === '/auth/callback') {
      handleAuthCallback(url.searchParams)
    }
  })

  createWindow()
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  mainWindow.loadFile('index.html')
}

async function startAuth() {
  equatorsAPI = new EquatorsAPI(CLIENT_ID)

  const authUrl = equatorsAPI.getAuthorizationURL(
    REDIRECT_URI,
    ['profile:read', 'models:read', 'models:write'],
    'desktop_auth_' + Date.now()
  )

  // Open auth URL in default browser
  require('electron').shell.openExternal(authUrl)
}

async function handleAuthCallback(params) {
  const code = params.get('code')
  const state = params.get('state')
  const error = params.get('error')

  if (error) {
    console.error('Auth error:', error)
    return
  }

  if (code) {
    try {
      const tokens = await equatorsAPI.exchangeCodeForToken(code, REDIRECT_URI)
      console.log('Authentication successful:', tokens)

      // Store tokens securely
      // You should use proper secure storage like keytar

      // Get user profile
      const profile = await equatorsAPI.getUserProfile()
      console.log('User profile:', profile)

      // Update UI to show authenticated state
      mainWindow.webContents.send('auth-success', { tokens, profile })
    } catch (error) {
      console.error('Token exchange error:', error)
      mainWindow.webContents.send('auth-error', error)
    }
  }
}

// Expose auth functions to renderer
global.startAuth = startAuth
```

### React Native Integration

```javascript
// AuthService.js
import { Linking } from 'react-native';
import { EquatorsAPI } from './equators-sdk';

class AuthService {
  constructor() {
    this.api = new EquatorsAPI('eq_your_client_id');
    this.redirectUri = 'myapp://auth/callback';
  }

  async startAuth() {
    const authUrl = this.api.getAuthorizationURL(
      this.redirectUri,
      ['profile:read', 'models:read'],
      'mobile_auth_' + Date.now()
    );

    // Open auth URL
    await Linking.openURL(authUrl);
  }

  handleDeepLink(url) {
    const urlObj = new URL(url);

    if (urlObj.pathname === '/auth/callback') {
      const code = urlObj.searchParams.get('code');
      const error = urlObj.searchParams.get('error');

      if (error) {
        throw new Error(error);
      }

      if (code) {
        return this.api.exchangeCodeForToken(code, this.redirectUri);
      }
    }
  }
}

export default AuthService;

// App.js
import { useEffect } from 'react';
import { Linking } from 'react-native';
import AuthService from './AuthService';

const authService = new AuthService();

export default function App() {
  useEffect(() => {
    // Handle deep links
    const handleDeepLink = (event) => {
      authService.handleDeepLink(event.url)
        .then(tokens => {
          console.log('Auth successful:', tokens);
          // Handle successful authentication
        })
        .catch(error => {
          console.error('Auth error:', error);
          // Handle auth error
        });
    };

    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  // Rest of your app...
}
```

## Support

For technical support and questions:

- Email: support@equators.tech
- Documentation: https://docs.equators.tech
- GitHub Issues: https://github.com/equators/api-issues

## Changelog

### v1.0.0 (2025-08-25)

- Initial release
- OAuth 2.0 with PKCE support
- User profile and permissions APIs
- Rate limiting and security monitoring
- Comprehensive SDK documentation
