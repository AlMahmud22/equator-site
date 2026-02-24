module.exports = {
  apps: [
    {
      name: 'equator-production',
      script: 'server.js',
      instances: 'max', // Cluster mode using all available CPUs
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Enhanced restart policy to prevent crash loops
      min_uptime: '120s', // 2 minutes for stability
      max_restarts: 5, // Max 5 restarts per time window
      restart_delay: 10000, // 10 second delay between restarts

      // Exponential backoff for restart delays
      exp_backoff_restart_delay: 500,

      // Kill and listen timeouts
      kill_timeout: 10000, // Increased to 10s for graceful shutdown
      listen_timeout: 15000, // Increased to 15s for app startup

      // Process management
      wait_ready: true, // Wait for app to emit 'ready' event
      shutdown_with_message: true,
      stop_exit_codes: [0],
      env_production: {
        NODE_ENV: 'production',
      },

      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        TRUST_PROXY: 'true',
        DEBUG: 'false',
        NEXTAUTH_URL: 'https://equator.tech',
        COOKIE_PREFIX: 'eqs_'
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        TRUST_PROXY: 'true',
        DEBUG: 'false',
        NEXTAUTH_URL: 'https://equator.tech',
        COOKIE_PREFIX: 'eqs_'
      },

      // Enhanced logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      log_type: 'json', // Structured logging

      // Merge logs from all instances
      merge_logs: true,

      // Environment file loading
      env_file: '.env.production',

      // Node.js specific options
      node_args: [
        '--max-old-space-size=1024', // Limit memory usage
        '--unhandled-rejections=warn' // Don't crash on unhandled rejections
      ],

      // Source map support for better error reporting
      source_map_support: true,

      // Health check configuration
      health_check_grace_period: 3000,

      // Monitoring and metrics
      pmx: true, // Enable PM2+ monitoring

      // Instance management
      increment_var: 'PORT', // Increment PORT for multiple instances

      // Error handling
      crash_restart: {
        delay: 5000, // Wait 5s before restarting after crash
        max_attempts: 3 // Max 3 restart attempts per hour
      },

      // Advanced options
      vizion: false, // Disable git metadata collection
      automation: false, // Disable keymetrics automation

      // Process signals
      kill_retry_time: 100,

      // Interpreter options
      interpreter: 'node',
      interpreter_args: '--harmony'
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['${process.env.DEPLOY_HOST || "127.0.0.1"}'],
      ref: 'origin/main',
      repo: 'git@github.com:AlMahmud22/equator-site.git',
      path: '/var/www/equator-site',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
