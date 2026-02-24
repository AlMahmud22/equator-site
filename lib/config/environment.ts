// Environment variable validation utility
interface EnvironmentConfig {
  // Database
  MONGODB_URI: string
  
  // NextAuth
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL?: string
  
  // OAuth Providers
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  
  // Security
  ADMIN_EMAIL?: string
  RATE_LIMIT_ENABLED?: string
  
  // Application
  NODE_ENV: 'development' | 'production' | 'test'
  PORT?: string
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator
  private config: EnvironmentConfig | null = null
  private validationErrors: string[] = []
  
  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator()
    }
    return EnvironmentValidator.instance
  }
  
  validate(): { isValid: boolean; errors: string[]; config?: EnvironmentConfig } {
    this.validationErrors = []
    
    // Required environment variables
    const requiredVars = [
      'MONGODB_URI',
      'NEXTAUTH_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ]
    
    // Check required variables
    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value || value.trim() === '') {
        this.validationErrors.push(`Missing required environment variable: ${varName}`)
      }
    }
    
    // Validate specific formats
    this.validateMongoDB()
    this.validateNextAuth()
    this.validateOAuth()
    
    // Build config if validation passes
    if (this.validationErrors.length === 0) {
      this.config = {
        MONGODB_URI: process.env.MONGODB_URI!,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
        NODE_ENV: (process.env.NODE_ENV as any) || 'development',
        PORT: process.env.PORT
      }
    }
    
    return {
      isValid: this.validationErrors.length === 0,
      errors: this.validationErrors,
      config: this.config || undefined
    }
  }
  
  private validateMongoDB(): void {
    const mongoUri = process.env.MONGODB_URI
    if (mongoUri) {
      // Basic MongoDB URI validation
      if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        this.validationErrors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://')
      }
      
      // Check for database name
      if (!mongoUri.includes('/') || mongoUri.endsWith('/')) {
        this.validationErrors.push('MONGODB_URI must include a database name')
      }
      
      // Production security checks
      if (process.env.NODE_ENV === 'production') {
        if (!mongoUri.includes('ssl=true') && !mongoUri.includes('tls=true')) {
          console.warn('WARNING: MongoDB URI should use SSL/TLS in production')
        }
      }
    }
  }
  
  private validateNextAuth(): void {
    const secret = process.env.NEXTAUTH_SECRET
    if (secret) {
      // Check secret length and complexity
      if (secret.length < 32) {
        this.validationErrors.push('NEXTAUTH_SECRET should be at least 32 characters long')
      }
      
      // Check for development default
      if (secret === 'your-secret-here' || secret === 'secret') {
        this.validationErrors.push('NEXTAUTH_SECRET appears to be a default value - use a secure random string')
      }
    }
    
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (nextAuthUrl) {
      try {
        new URL(nextAuthUrl)
      } catch {
        this.validationErrors.push('NEXTAUTH_URL must be a valid URL')
      }
    }
  }
  
  private validateOAuth(): void {
    // GitHub OAuth validation
    const githubId = process.env.GITHUB_CLIENT_ID
    const githubSecret = process.env.GITHUB_CLIENT_SECRET
    
    if (githubId && githubSecret) {
      if (githubId.length !== 20) {
        console.warn('WARNING: GitHub Client ID may be invalid (expected 20 characters)')
      }
      
      if (githubSecret.length !== 40) {
        console.warn('WARNING: GitHub Client Secret may be invalid (expected 40 characters)')
      }
    }
    
    // Google OAuth validation
    const googleId = process.env.GOOGLE_CLIENT_ID
    const googleSecret = process.env.GOOGLE_CLIENT_SECRET
    
    if (googleId && googleSecret) {
      if (!googleId.endsWith('.googleusercontent.com')) {
        console.warn('WARNING: Google Client ID should end with .googleusercontent.com')
      }
      
      if (googleSecret.length < 20) {
        console.warn('WARNING: Google Client Secret may be too short')
      }
    }
  }
  
  getConfig(): EnvironmentConfig | null {
    if (!this.config) {
      const result = this.validate()
      return result.config || null
    }
    return this.config
  }
  
  // Check if running in production
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  }
  
  // Check if development mode
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }
  
  // Get specific config value with fallback
  get<K extends keyof EnvironmentConfig>(key: K, fallback?: EnvironmentConfig[K]): EnvironmentConfig[K] | undefined {
    const config = this.getConfig()
    return config?.[key] || fallback
  }
  
  // Security configuration
  getSecurityConfig() {
    return {
      isProduction: this.isProduction(),
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days
      cleanupOldLogs: process.env.CLEANUP_OLD_LOGS !== 'false',
      adminEmail: process.env.ADMIN_EMAIL,
      enableSuspiciousActivityDetection: process.env.SUSPICIOUS_ACTIVITY_DETECTION !== 'false'
    }
  }
  
  // Database configuration
  getDatabaseConfig() {
    return {
      uri: process.env.MONGODB_URI!,
      options: {
        maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
        serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT || '30000'),
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '30000'),
        connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000'),
        ssl: this.isProduction(),
        retryWrites: true,
        retryReads: true
      }
    }
  }
}

// Initialize and validate environment on module load
const envValidator = EnvironmentValidator.getInstance()
const validation = envValidator.validate()

if (!validation.isValid) {
  console.error('❌ Environment validation failed:')
  validation.errors.forEach(error => console.error(`  - ${error}`))
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Environment validation failed in production')
  } else {
    console.warn('⚠️  Environment validation failed - some features may not work properly')
  }
} else {
  console.log('✅ Environment validation passed')
}

export default envValidator
export { EnvironmentValidator }
export type { EnvironmentConfig }
