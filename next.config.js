/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  eslint: {
    dirs: ['pages', 'utils', 'components', 'hooks'],
  },
}

module.exports = nextConfig
