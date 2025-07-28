# Production Deployment Instructions

## 🚀 Fixed Database Connection Issues

### What was fixed:
1. **Environment Loading**: Created `server.js` that loads `.env.production` BEFORE any imports
2. **Strict Validation**: No localhost fallbacks - production MUST use MongoDB Atlas
3. **PM2 Configuration**: Proper ecosystem config with environment variable handling
4. **Connection Stability**: Enhanced connection options for production reliability

### Deployment Steps:

#### 1. Test Database Connection (Optional but Recommended)
```bash
node test-db-connection.js
```

#### 2. Build the Application
```bash
npm run build
```

#### 3. Start with PM2 (Recommended)
```bash
npm run start:pm2
```

#### 4. Alternative: Direct Node Start
```bash
npm start
```

### PM2 Management Commands:
```bash
# View logs
npm run logs:pm2

# Restart application
npm run restart:pm2

# Stop application
npm run stop:pm2

# Check status
pm2 status equators-production
```

### Environment Variables Required:
Ensure `.env.production` contains:
- `MONGODB_URI`: MongoDB Atlas connection string
- `NODE_ENV=production`
- `PORT=3000`
- All other required environment variables

### Verification:
After deployment, check logs for:
- ✅ Environment variables loaded successfully
- ✅ Successfully connected to MongoDB Atlas
- 🏢 Database: equators-tech
- 🌐 Host: [Atlas cluster host]

### Troubleshooting:
If you still see `ECONNREFUSED ::1:27017`:
1. Verify `.env.production` exists and contains correct `MONGODB_URI`
2. Check PM2 is loading the environment file: `pm2 show equators-production`
3. Run `node test-db-connection.js` to isolate database connection issues

### Security Notes:
- The server validates against localhost connections in production
- Fatal errors are thrown if `MONGODB_URI` is missing or empty
- Environment variables are loaded with strict validation
