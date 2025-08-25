# PM2 Production Troubleshooting Guide

## 🚨 Emergency PM2 Crash Recovery

### Quick Diagnosis Commands

```bash
# Check PM2 status
pm2 status

# View recent logs
pm2 logs equators-production --lines 50

# Check system resources
pm2 monit

# View specific error logs
pm2 logs equators-production --err --lines 100
```

### Immediate Recovery Steps

```bash
# 1. Stop the crashing process
pm2 stop equators-production

# 2. Clear logs to reduce noise
pm2 flush

# 3. Restart with fresh state
pm2 start ecosystem.config.js --env production

# 4. Monitor for stability
pm2 monit
```

## 🔍 Common Crash Causes & Solutions

### 1. Environment Variable Issues

**Symptoms:** Process exits immediately with code 1
**Solution:**

```bash
# Check environment variables
pm2 show equators-production

# Verify .env.production file exists and has correct variables
cat .env.production

# Test environment loading
node scripts/pre-deploy.js
```

### 2. MongoDB Connection Failures

**Symptoms:** Process restarts every 30 seconds
**Solution:**

```bash
# Test MongoDB connection manually
node -e "require('./modules/database/mongodb').default.then(() => console.log('DB OK')).catch(console.error)"

# Check network connectivity
ping your-mongodb-host.com

# Verify MongoDB Atlas IP whitelist includes your server IP
curl ifconfig.me  # Get your server's public IP
```

### 3. Port Already in Use

**Symptoms:** EADDRINUSE error
**Solution:**

```bash
# Find process using port 3000
lsof -i :3000
# OR
netstat -tulpn | grep :3000

# Kill conflicting process
kill -9 <PID>

# Restart application
pm2 restart equators-production
```

### 4. Memory Issues

**Symptoms:** Process killed due to memory limit
**Solution:**

```bash
# Check memory usage
free -h
pm2 monit

# Increase memory limit in ecosystem.config.js
# Change max_memory_restart from '1G' to '2G'

# Restart with new config
pm2 restart equators-production
```

### 5. File Permission Issues

**Symptoms:** EACCES errors in logs
**Solution:**

```bash
# Fix ownership
sudo chown -R $USER:$USER /path/to/your/app

# Fix permissions
chmod -R 755 /path/to/your/app
chmod +x server.js
```

## 🛠️ Advanced Troubleshooting

### Enable Debug Mode

```bash
# Stop current process
pm2 stop equators-production

# Start with debug environment
NODE_ENV=production DEBUG=* pm2 start ecosystem.config.js

# View debug logs
pm2 logs equators-production
```

### Test Application Manually

```bash
# Test server directly (without PM2)
NODE_ENV=production node server.js

# Test health endpoint
curl http://localhost:3000/api/health

# Test MongoDB connection
node -e "
const { mongoClientPromise } = require('./modules/database/mongodb');
mongoClientPromise.then(client => {
  console.log('✅ MongoDB connected');
  client.close();
}).catch(err => {
  console.error('❌ MongoDB failed:', err);
});
"
```

### Check System Resources

```bash
# CPU usage
top

# Memory usage
free -h

# Disk space
df -h

# Network connections
netstat -tulpn

# System logs
tail -f /var/log/syslog
```

## 🔧 PM2 Configuration Fixes

### Reset PM2 Completely

```bash
# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Kill PM2 daemon
pm2 kill

# Restart fresh
pm2 start ecosystem.config.js --env production
```

### Update Restart Policy

Edit `ecosystem.config.js`:

```javascript
{
  max_restarts: 3,        // Reduce to prevent infinite loops
  min_uptime: '30s',      // Increase minimum uptime
  restart_delay: 10000,   // Add delay between restarts
  exp_backoff_restart_delay: 100  // Exponential backoff
}
```

### Enable Better Logging

```javascript
{
  log_type: 'json',
  merge_logs: true,
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
}
```

## 🚀 Production Best Practices

### 1. Pre-deployment Checklist

```bash
# Run all checks
npm run deploy:check

# Test build
npm run build

# Test health endpoint
npm run health
```

### 2. Safe Deployment Process

```bash
# Use the deployment script
npm run deploy:prod

# OR manual steps:
pm2 stop equators-production
npm ci --production
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

### 3. Monitoring Setup

```bash
# Enable PM2 monitoring
pm2 install pm2-server-monit

# Set up log rotation
pm2 install pm2-logrotate

# Configure alerts (optional)
pm2 install pm2-slack
```

### 4. Backup and Recovery

```bash
# Save PM2 configuration
pm2 save

# Backup ecosystem config
cp ecosystem.config.js ecosystem.config.js.backup

# Export process list
pm2 dump > pm2.processes.json
```

## 📊 Health Monitoring

### Regular Health Checks

```bash
# Quick health check
curl http://localhost:3000/api/health

# Detailed system check
pm2 monit

# Log analysis
pm2 logs equators-production --lines 1000 | grep ERROR
```

### Automated Monitoring Script

Create `scripts/monitor.sh`:

```bash
#!/bin/bash
while true; do
  if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "Health check failed, restarting..."
    pm2 restart equators-production
  fi
  sleep 60
done
```

## 🆘 Emergency Contacts & Resources

- **PM2 Documentation:** https://pm2.keymetrics.io/docs/
- **Next.js Production:** https://nextjs.org/docs/deployment
- **MongoDB Atlas Support:** https://support.mongodb.com/

### Log Locations

- PM2 logs: `~/.pm2/logs/`
- Application logs: `./logs/`
- System logs: `/var/log/`

### Key Files to Check

- `ecosystem.config.js` - PM2 configuration
- `.env.production` - Environment variables
- `server.js` - Application entry point
- `package.json` - Dependencies and scripts
