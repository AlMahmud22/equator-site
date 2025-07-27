/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'accounts.google.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
    unoptimized: false,
  },
  eslint: {
    dirs: ['pages', 'utils', 'components', 'hooks'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
  },
  // Allow external redirects for OAuth
  async redirects() {
    return []
  },
}

module.exports = nextConfig
