# MongoDB Connection and Models Usage

## Overview
This document shows how to use the centralized MongoDB connection and models in the Equators project.

## Import Options

### Option 1: Import everything from mongo.ts
```typescript
import connectDB, { User, AccessLog, TrainingLog, logAccess } from '@/lib/mongo'

// Use the connection
await connectDB()

// Use models
const user = await User.findById(userId)
const logs = await AccessLog.find({ userId })

// Use utility function
await logAccess(userId, 'email', ipAddress, userAgent)
```

### Option 2: Import individual models (existing approach)
```typescript
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import AccessLog from '@/lib/models/AccessLog'

await connectDB()
const user = await User.findById(userId)
```

### Option 3: Use the access logger utility
```typescript
import { logUserAccess } from '@/lib/utils/accessLogger'

// In your API route
await logUserAccess(userId, 'google', req)
```

## Database Connection Features

✅ **Singleton Pattern**: Prevents multiple connections in development  
✅ **Hot Reload Safe**: Uses global caching for development  
✅ **Environment Variables**: Uses `MONGODB_URI` from env  
✅ **Error Handling**: Proper error logging and recovery  
✅ **Model Registration Check**: Uses `mongoose.models.ModelName ||` pattern  

## Available Models

### User Model
- Fields: fullName, email, password, authType, huggingFaceToken, downloadLogs, preferences
- Indexes: email (unique), createdAt
- Security: password and huggingFaceToken have `select: false`

### AccessLog Model  
- Fields: userId, loginProvider, ipAddress, userAgent, timestamp
- Index: userId + timestamp

### TrainingLog Model
- Fields: userId, modelName, config, metrics, hardware, startedAt, finishedAt, status
- Index: userId + startedAt

## Utility Functions

### logAccess(userId, provider, ip, userAgent)
Centralized function to log user access attempts.

```typescript
import { logAccess } from '@/lib/mongo'

await logAccess(
  '507f1f77bcf86cd799439011', 
  'email', 
  '192.168.1.1', 
  'Mozilla/5.0...'
)
```

### logUserAccess(userId, provider, req)
Wrapper that extracts IP and user agent from NextApiRequest.

```typescript
import { logUserAccess } from '@/lib/utils/accessLogger'

// In API routes
await logUserAccess(userId, 'github', req)
```

## Migration from Existing Code

If you're updating existing code, you can:

1. **Keep using individual imports** - they still work
2. **Switch to centralized imports** - for cleaner code
3. **Use both approaches** - they're compatible

Example migration:
```typescript
// Old way
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

// New way (optional)
import connectDB, { User } from '@/lib/mongo'
```
