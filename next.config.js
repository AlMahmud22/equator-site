/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Essential for production deployment
  trailingSlash: false,
  
  // Image optimization with auth provider domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'equator.tech',
      },
      {
        protocol: 'https',
        hostname: 'accounts.google.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    unoptimized: false,
  },

  // Essential for NextAuth.js with reverse proxy
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },

  // Handle rewrites if needed
  async rewrites() {
    return [
      {
        source: '/auth/error',
        destination: '/auth/error',
      },
    ]
  },

  eslint: {
    dirs: ['pages', 'utils', 'components', 'hooks', 'lib', 'modules'],
    ignoreDuringBuilds: false,
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    // CRITICAL SECURITY FIX: DO NOT expose OAuth client secrets to client-side
    // Only expose public configuration that's safe for the browser
    API_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || process.env.API_BASE_URL || (
      process.env.NODE_ENV === 'production' 
      ? 'https://equator.tech' 
      : process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    ),
    // OAuth client IDs are public and safe to expose
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    // REMOVED: OAuth client secrets, JWT secrets, and MongoDB URI are server-side only
    // These should never be exposed to the client-side bundle
  },
  // Allow external redirects for OAuth
  async redirects() {
    return []
  },
}

module.exports = nextConfig
