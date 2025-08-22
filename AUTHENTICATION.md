# Equators Authentication System

This document outlines the authentication system for the Equators platform, supporting both web and Electron desktop applications.

## System Overview

The authentication system is built on NextAuth.js with the App Router architecture, providing a secure and modular approach to user authentication across the Equators ecosystem.

## Key Features

- **Multiple Authentication Providers**:
  - GitHub OAuth
  - Google OAuth
  - Email/Password (credentials)

- **Token-Based Authentication**:
  - JWT-based secure tokens
  - HTTP-only cookies for web applications
  - Secure token storage for Electron desktop apps
  - Token refresh mechanism

- **Cross-Platform Support**:
  - Web application using cookie-based auth
  - Desktop (Electron) applications using token-based auth
  - Custom protocol handlers for deep linking

- **Security**:
  - Server-side and client-side route protection
  - CSRF protection
  - HTTP-only cookies
  - Token refresh mechanism
  - Role-based authorization

## Directory Structure

```
/app
  /api
    /auth
      /[...nextauth]/route.ts  # Main NextAuth API handler
      /refresh/route.ts        # Token refresh endpoint
      /logout/route.ts         # Logout endpoint
      /token
        /exchange/route.ts     # Token exchange for Electron
    /electron
      /validate-token/route.ts # Validate Electron tokens

/components
  /auth
    /AuthProvider.tsx          # NextAuth provider wrapper
    /AuthStatus.tsx            # Display auth status and login/logout
    /LoginButton.tsx           # OAuth provider login button
    /LogoutButton.tsx          # Logout button

/lib
  /auth
    /auth-config.ts            # Authentication configuration
    /auth-options.ts           # NextAuth options and callbacks
    /hooks.ts                  # Client-side auth hooks
    /mongodb.ts                # MongoDB adapter setup
    /session.ts                # Server-side session utilities
    /types.ts                  # TypeScript type definitions
    /electron
      /index.ts                # Electron-specific auth utilities
```

## Usage Examples

### Protecting a Server Component

```tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { AUTH_CONFIG } from '@/lib/auth/auth-config';

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(AUTH_CONFIG.PAGES.SIGN_IN);
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}
```

### Protecting a Client Component

```tsx
'use client';

import { useProtectedRoute } from '@/lib/auth/hooks';

export default function ClientProtectedPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Protected Client Page</h1>
    </div>
  );
}
```

### Using Login Button

```tsx
import { LoginButton } from '@/components/auth';

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <LoginButton provider="github">Sign in with GitHub</LoginButton>
      <LoginButton provider="google">Sign in with Google</LoginButton>
    </div>
  );
}
```

### Electron Integration

```tsx
import { getElectronOAuthUrl, parseTokenFromRedirect, storeTokensSecurely } from '@/lib/auth/electron';

// In your Electron app:
function handleGitHubLogin() {
  // 1. Open OAuth URL in browser
  const authUrl = getElectronOAuthUrl('github', 'equatorschatbot');
  shell.openExternal(authUrl);
  
  // 2. Handle protocol callback (in main process)
  app.on('open-url', (event, url) => {
    // 3. Parse tokens from URL
    const tokens = parseTokenFromRedirect(url);
    
    // 4. Store tokens securely
    if (tokens) {
      storeTokensSecurely(tokens);
    }
  });
}
```

## Environment Variables

The following environment variables are required:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## TODO Items

- Implement MongoDB user model for accounts if not exists
- Add password reset functionality
- Add email verification
- Implement HuggingFace token management
- Add comprehensive logging for auth events
