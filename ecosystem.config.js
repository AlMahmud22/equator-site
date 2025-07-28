module.exports = {
  apps: [
    {
      name: 'equators-production',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      // Logging configuration
      log_file: 'logs/combined.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      
      // Environment file loading
      dotenv: '.env.production',
      
      // Additional options for stability
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Source map support for better error reporting
      source_map_support: true,
      
      // Merge logs from all instances
      merge_logs: true
    }
  ]
};
