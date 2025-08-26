#!/bin/bash

# Production Deployment Script for Equators Site
# Run this script on your production server after git pull

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
  echo "⚠️  Warning: Running as root. Consider using a non-root user for security."
fi

# Check if required environment variables are set
if [ ! -f ".env.production" ]; then
  echo "❌ Error: .env.production file not found"
  echo "📋 Please create .env.production based on .env.production.template"
  exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '#' | awk '/=/ {print $1}')

# Validate required environment variables
required_vars=("MONGODB_URI" "NEXTAUTH_SECRET" "GITHUB_CLIENT_ID" "GITHUB_CLIENT_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: Required environment variable $var is not set"
    exit 1
  fi
done

echo "✅ Environment variables validated"

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations/setup if needed
echo "🗄️  Setting up database..."
node scripts/fix-api-key-index.js || echo "⚠️  Database setup completed with warnings"

# Restart PM2 application
echo "🔄 Restarting application..."
pm2 reload ecosystem.config.js --env production

# Check application status
echo "🔍 Checking application status..."
sleep 5
pm2 status

# Verify application is responding
echo "🌐 Testing application response..."
if curl -f -s http://localhost:${PORT:-3000}/api/health > /dev/null; then
  echo "✅ Application is responding correctly"
else
  echo "❌ Application health check failed"
  pm2 logs equators-production --lines 50
  exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Check logs with: pm2 logs equators-production"
echo "📈 Monitor with: pm2 monit"
