import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_CONFIG } from "./lib/auth/auth-config";

// Rate limiting maps
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100

// Protected routes pattern
const protectedRoutes = [
  /^\/dashboard(\/|$)/,
  /^\/profile(\/|$)/,
  /^\/profile-enhanced(\/|$)/,
  /^\/api\/protected(\/|$)/,
  /^\/api\/profile(\/|$)/
];

// Routes that are public but shouldn't be accessed when authenticated
const authRoutes = [
  /^\/auth\/login(\/|$)/,
  /^\/auth\/register(\/|$)/
];

// API routes that need special rate limiting
const apiRoutes = [
  /^\/api\/auth(\/|$)/,
  /^\/api\/profile(\/|$)/,
  /^\/api\/protected(\/|$)/,
  /^\/api\/apps(\/|$)/,
  /^\/api\/user(\/|$)/
];

// External app API routes that need CORS
const externalApiRoutes = [
  /^\/api\/auth\/desktop(\/|$)/,
  /^\/api\/user(\/|$)/,
  /^\/api\/apps(\/|$)/
];

// OAuth-specific routes with higher rate limits
const oauthRoutes = [
  /^\/api\/auth\/desktop\/authorize(\/|$)/,
  /^\/api\/auth\/desktop\/token(\/|$)/,
  /^\/api\/auth\/consent(\/|$)/
];

// Helper function to get client IP
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Helper function for rate limiting
function checkRateLimit(ip: string, route: string): boolean {
  const key = `${ip}:${route}`
  const now = Date.now()
  const entry = requestCounts.get(key)
  
  // Different limits for different route types
  let maxRequests = MAX_REQUESTS_PER_WINDOW;
  if (route === 'oauth') {
    maxRequests = 50; // Lower limit for OAuth endpoints
  } else if (route === 'external_api') {
    maxRequests = 200; // Higher limit for external app APIs
  }
  
  // If no entry or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return false
  }
  
  // Increment counter
  entry.count++
  return true
}

// Helper function to validate session freshness
function isSessionFresh(token: any): boolean {
  if (!token.lastActivity) return true // Allow if no activity tracking
  
  const lastActivity = new Date(token.lastActivity as number)
  const now = new Date()
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
  
  // Session is fresh if activity within last 24 hours
  return hoursSinceActivity < 24
}

// Helper function to handle CORS for external apps
function addCORSHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://localhost:3000',
    'https://localhost:8080',
    // Add your production domains here
    'https://yourdomain.com'
  ];
  
  // Allow custom schemes for desktop apps
  const isCustomScheme = origin && /^[a-z][a-z0-9+.-]*:\/\//.test(origin) && 
    !origin.startsWith('http://') && !origin.startsWith('https://');
  
  if (origin && (allowedOrigins.includes(origin) || isCustomScheme)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

// Helper function to detect suspicious patterns
function detectSuspiciousRequest(request: NextRequest): { suspicious: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check for bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return { suspicious: true, reason: 'Bot-like user agent' }
  }
  
  // Check for missing user agent
  if (!userAgent || userAgent.length < 10) {
    return { suspicious: true, reason: 'Missing or suspicious user agent' }
  }
  
  // Check for unusual request patterns
  const pathname = request.nextUrl.pathname
  if (pathname.includes('..') || pathname.includes('//') || pathname.includes('%')) {
    return { suspicious: true, reason: 'Suspicious path patterns' }
  }
  
  return { suspicious: false }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request)
  
  // Handle auth errors properly - allow access to error page without token
  if (pathname.startsWith('/auth/error')) {
    return NextResponse.next()
  }
  
  // Handle preflight OPTIONS requests for CORS
  if (request.method === 'OPTIONS' && externalApiRoutes.some(pattern => pattern.test(pathname))) {
    const response = new NextResponse(null, { status: 200 });
    return addCORSHeaders(response, request);
  }
  
  // Basic security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Add CORS headers for external API routes
  if (externalApiRoutes.some(pattern => pattern.test(pathname))) {
    addCORSHeaders(response, request);
  }
  
  // OAuth-specific rate limiting
  if (oauthRoutes.some(pattern => pattern.test(pathname))) {
    if (!checkRateLimit(ip, 'oauth')) {
      const errorResponse = new NextResponse(
        JSON.stringify({ error: 'rate_limit_exceeded', error_description: 'Too many OAuth requests' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900'
          }
        }
      );
      
      if (externalApiRoutes.some(pattern => pattern.test(pathname))) {
        addCORSHeaders(errorResponse, request);
      }
      
      return errorResponse;
    }
  }
  
  // External API rate limiting
  else if (externalApiRoutes.some(pattern => pattern.test(pathname))) {
    if (!checkRateLimit(ip, 'external_api')) {
      const errorResponse = new NextResponse(
        JSON.stringify({ error: 'rate_limit_exceeded', error_description: 'Too many API requests' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900'
          }
        }
      );
      addCORSHeaders(errorResponse, request);
      return errorResponse;
    }
  }
  
  // Rate limiting for other API routes
  else if (apiRoutes.some(pattern => pattern.test(pathname))) {
    if (!checkRateLimit(ip, 'api')) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900'
          }
        }
      )
    }
  }
  
  // General rate limiting
  if (!checkRateLimit(ip, 'general')) {
    return new NextResponse(
      'Rate limit exceeded',
      { 
        status: 429,
        headers: {
          'Retry-After': '900'
        }
      }
    )
  }
  
  // Suspicious activity detection
  const suspiciousCheck = detectSuspiciousRequest(request)
  if (suspiciousCheck.suspicious) {
    console.warn(`Suspicious request detected: ${suspiciousCheck.reason}`, {
      ip,
      pathname,
      userAgent: request.headers.get('user-agent')
    })
    
    // In production, you might want to block suspicious requests
    // For now, we'll log and allow
    if (process.env.NODE_ENV === 'production') {
      // return new NextResponse('Forbidden', { status: 403 })
    }
  }
  
  // Check if path should be protected
  const isProtectedRoute = protectedRoutes.some(pattern => pattern.test(pathname));
  const isAuthRoute = authRoutes.some(pattern => pattern.test(pathname));
  
  // Get token if it exists
  let token
  try {
    token = await getToken({ 
      req: request,
      secret: AUTH_CONFIG.JWT.SECRET 
    });
  } catch (error) {
    console.error('Token verification error:', error)
    // If token verification fails, treat as unauthenticated
    token = null
  }
  
  // Check session freshness for protected routes
  if (token && isProtectedRoute) {
    if (!isSessionFresh(token)) {
      // Session is stale, redirect to login
      const url = new URL(AUTH_CONFIG.PAGES.SIGN_IN, request.url);
      url.searchParams.set("callbackUrl", pathname);
      url.searchParams.set("reason", "session_expired");
      return NextResponse.redirect(url);
    }
  }
  
  // Redirect to login if accessing a protected route without auth
  if (isProtectedRoute && !token) {
    console.log(`Redirecting unauthenticated user from protected route: ${pathname}`);
    const url = new URL(AUTH_CONFIG.PAGES.SIGN_IN, request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  
  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return response;
}

// Configure matcher
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/profile-enhanced/:path*',
    '/api/protected/:path*',
    '/api/profile/:path*',
    
    // Auth routes
    '/auth/login',
    '/auth/register',
    '/auth/consent',
    '/auth/error',
    
    // API routes for rate limiting and CORS
    '/api/auth/:path*',
    '/api/apps/:path*',
    '/api/user/:path*'
  ],
};
