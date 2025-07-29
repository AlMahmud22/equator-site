# Equators Chatbot Desktop App Authentication Integration

This document describes the authentication flow integration between the Equators.tech website and the Equators Chatbot desktop application.

## Overview

The website now supports redirecting authenticated users back to the Equators Chatbot desktop app via a custom URI scheme (`equatorschatbot://`). This allows seamless authentication from the web to the desktop application.

## Authentication Flow

### Step 1: Login with Redirect Parameter

The desktop app should direct users to the login page with a redirect parameter:

```
https://equators.tech/auth/login?redirect=equatorschatbot://auth/callback
```

### Step 2: User Authentication

Users can authenticate using any of the supported methods:
- Email/Password login
- Google OAuth
- GitHub OAuth

### Step 3: JWT Token Generation

Upon successful authentication, a JWT token is generated that includes:
- `userId`: User's database ID
- `email`: User's email address
- `authType`: Authentication method used
- `huggingFaceToken`: User's Hugging Face token (if linked)

### Step 4: Custom URI Redirect

If the redirect parameter starts with `equatorschatbot://`, the browser will redirect to:

```
equatorschatbot://auth/callback?token=eyJhbGciOi...
```

If no redirect parameter is present, users are redirected to the default profile page.

## API Endpoints

### GET /api/auth/profile-with-token

A new endpoint that returns the user profile including the Hugging Face token when authenticated via JWT:

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "authType": "google",
      "avatar": "https://...",
      "huggingFace": {
        "linked": true,
        "token": "hf_...",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatarUrl": "https://...",
        "linkedAt": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Desktop App Integration

### 1. Initiating Authentication

The desktop app should open the user's default browser to:
```
https://equators.tech/auth/login?redirect=equatorschatbot://auth/callback
```

### 2. Handling the Callback

The desktop app should register a custom URI scheme handler for `equatorschatbot://` that:

1. Extracts the JWT token from the query parameter
2. Validates the token
3. Either uses the Hugging Face token from the JWT payload directly, or
4. Makes an API call to `/api/auth/profile-with-token` to get the full user profile

### 3. Token Usage

The JWT token can be used for:
- API authentication (Bearer token)
- Accessing user profile information
- Direct access to the user's Hugging Face token (if available)

## Security Considerations

- JWT tokens expire after 7 days
- Hugging Face tokens are encrypted and stored securely
- Custom URI redirects are only allowed for `equatorschatbot://` scheme
- The JWT includes the Hugging Face token for immediate access without additional API calls

## Example Usage

```javascript
// Desktop app JavaScript example
const authUrl = 'https://equators.tech/auth/login?redirect=equatorschatbot://auth/callback';

// Open browser for authentication
require('electron').shell.openExternal(authUrl);

// Handle the custom URI callback
app.setAsDefaultProtocolClient('equatorschatbot');

app.on('open-url', (event, url) => {
  if (url.startsWith('equatorschatbot://auth/callback')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const token = urlParams.get('token');
    
    if (token) {
      // Use the token for authentication
      // The token may contain the Hugging Face token in its payload
      console.log('Authentication successful!');
    }
  }
});
```

## Implementation Details

### Modified Files

1. **lib/auth.ts** - Updated JWT payload interface to include `huggingFaceToken`
2. **lib/controllers/authController.ts** - Updated login and registration to include HF token in JWT
3. **lib/controllers/oauthController.ts** - Updated OAuth flows to support custom redirects and include HF token in JWT
4. **pages/auth/login.tsx** - Already captures redirect parameter and handles custom URI redirects
5. **pages/api/auth/profile-with-token.ts** - New endpoint for accessing profile with HF token

### Key Features

- ✅ Captures redirect parameter from login URL
- ✅ Stores redirect temporarily in sessionStorage
- ✅ Generates JWT with Hugging Face token if available
- ✅ Supports custom URI redirects for `equatorschatbot://` scheme
- ✅ Falls back to default redirect if no custom redirect specified
- ✅ Works with all authentication methods (email, Google, GitHub)
- ✅ Provides API endpoint for fetching profile with HF token
