import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_CONFIG } from "./lib/auth/auth-config";

// Protected routes pattern
const protectedRoutes = [
  /^\/dashboard(\/|$)/,
  /^\/profile(\/|$)/,
  /^\/api\/protected(\/|$)/
];

// Routes that are public but shouldn't be accessed when authenticated
const authRoutes = [
  /^\/auth\/login(\/|$)/,
  /^\/auth\/register(\/|$)/
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path should be protected
  const isProtectedRoute = protectedRoutes.some(pattern => pattern.test(pathname));
  const isAuthRoute = authRoutes.some(pattern => pattern.test(pathname));
  
  // Get token if it exists
  const token = await getToken({ 
    req: request,
    secret: AUTH_CONFIG.JWT.SECRET 
  });
  
  // Redirect to login if accessing a protected route without auth
  if (isProtectedRoute && !token) {
    const url = new URL(AUTH_CONFIG.PAGES.SIGN_IN, request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  
  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

// Configure matcher
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/protected/:path*',
    
    // Auth routes
    '/auth/login',
    '/auth/register'
  ],
};
