import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting
// In production, use a Redis-based solution for distributed environments
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Only apply Content-Security-Policy in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
    );
  }
  
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    
    // Get or initialize rate limit data for this IP
    let rateLimitData = ipRequestCounts.get(ip);
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
      ipRequestCounts.set(ip, rateLimitData);
    }
    
    // Increment request count
    rateLimitData.count++;
    
    // Set rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - rateLimitData.count).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000).toString());
    
    // If rate limit exceeded, return 429 Too Many Requests
    if (rateLimitData.count > RATE_LIMIT_MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({ message: 'Too many requests, please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000).toString(),
          },
        }
      );
    }
  }
  
  return response;
}

// Configure which paths this middleware is applied to
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Apply to auth-related pages
    '/login',
    '/signup',
    '/dashboard/:path*',
  ],
};
