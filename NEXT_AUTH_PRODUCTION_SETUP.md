# NextAuth.js Production Setup Guide

This guide provides instructions for properly setting up NextAuth.js in a production environment with reverse proxies, such as Digital Ocean with PM2.

## Fixing "x-forwarded-for" Error

The error "Cannot read properties of undefined (reading 'x-forwarded-for')" occurs when NextAuth.js tries to access request headers that don't exist or are modified by a reverse proxy. We've implemented the following fixes:

1. Added `trustHost: true` to NextAuth.js configuration
2. Implemented safe header access patterns throughout the code
3. Updated the cookie configuration for cross-domain compatibility
4. Enhanced the server.js file to properly handle proxy headers

## Required Environment Variables

Make sure the following environment variables are properly set in your production environment:

```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-secret
MONGODB_URI=your-mongodb-connection-string
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TRUST_PROXY=true
```

## Digital Ocean with PM2 Setup

### Nginx Configuration

If you're using Nginx as a reverse proxy, ensure your configuration includes:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Websocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### PM2 Setup

The PM2 configuration is already set up in `ecosystem.config.js`. To start the application:

```bash
# Start the application
pm2 start ecosystem.config.js

# Save the PM2 configuration to run on system startup
pm2 save
pm2 startup
```

### Verifying Header Access

To verify that your reverse proxy is properly passing headers, you can add temporary debugging code to log headers in your NextAuth.js callbacks:

```javascript
// Add this to a callback or event handler to debug
console.log('Debug - Request Headers:', JSON.stringify(req.headers))
```

Remember to remove this code once you've confirmed everything is working correctly.

## Troubleshooting

If you continue to experience issues:

1. Check your reverse proxy logs for any errors
2. Verify that the environment variables are correctly set
3. Ensure that your OAuth providers are configured with the correct callback URLs
4. Restart both Nginx and PM2 after making configuration changes

## Security Considerations

- Always use HTTPS in production
- Set up proper firewalls and restrict access to your server
- Regularly rotate your NextAuth secret and OAuth credentials
- Monitor server logs for suspicious activity
