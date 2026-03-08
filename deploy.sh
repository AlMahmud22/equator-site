#!/bin/bash
set -e

echo "🚀 Deploying Equator..."
cd /var/www/html/mahmud/equator

npm install
npm run build
pm2 restart equator || pm2 start npm --name "equator" -- start -- -p 3002

echo "✅ Equator deployed on port 3002"