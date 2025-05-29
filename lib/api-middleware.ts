import { NextApiRequest, NextApiResponse } from 'next'
import { performance } from 'perf_hooks'
import { JsonWebTokenError } from 'jsonwebtoken'
import { logger } from './logger'
import { checkRateLimit, setSecurityHeaders, sanitizeObject } from './security'

// Define Prisma error types since we can't import them directly
class PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  clientVersion: string;
  
  constructor(message: string, { code, meta, clientVersion }: { code: string; meta?: Record<string, unknown>; clientVersion: string }) {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = code;
    this.meta = meta;
    this.clientVersion = clientVersion;
  }
}

class PrismaClientValidationError extends Error {
  clientVersion: string;
  
  constructor(message: string, { clientVersion }: { clientVersion: string }) {
    super(message);
    this.name = 'PrismaClientValidationError';
    this.clientVersion = clientVersion;
  }
}

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void | NextApiResponse>

type ApiMiddleware = (
  handler: ApiHandler
) => (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>

/**
 * Error handling middleware for API routes
 * Catches errors and returns appropriate responses
 */
export const withErrorHandling: ApiMiddleware = (handler) => async (req, res) => {
  const startTime = performance.now()
  const requestId = Math.random().toString(36).substring(2, 15)
  
  // Create a request-specific logger
  const requestLogger = logger.child({ 
    requestId, 
    method: req.method, 
    url: req.url,
    ip: req.socket.remoteAddress
  })
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Set security headers
    setSecurityHeaders(res)
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    // Add request ID to response headers for tracking
    res.setHeader('X-Request-ID', requestId)
    
    // Sanitize request body if present
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body)
    }
    
    // Log the incoming request
    requestLogger.info('API request received', { 
      query: req.query,
      body: req.body ? '(present)' : '(empty)'
    })
    
    // Execute the handler
    return await handler(req, res)
  } catch (error: unknown) {
    // Log the error with request details
    if (error instanceof Error) {
      requestLogger.error('API request failed', error, {
        stack: error.stack
      })
    } else {
      // For unknown error types, create a generic error object
      const genericError = new Error(String(error))
      genericError.name = 'UnknownError'
      requestLogger.error('API request failed with unknown error', genericError)
    }
    
    // Handle different types of errors
    if (error instanceof PrismaClientKnownRequestError) {
      // Database query error
      return res.status(500).json({
        error: 'Database query failed',
        message: 'There was an issue with the database query',
        code: error.code,
        requestId
      })
    } else if (error instanceof PrismaClientValidationError) {
      // Validation error
      return res.status(400).json({
        error: 'Validation failed',
        message: 'The data provided is invalid',
        requestId
      })
    } else if (error instanceof JsonWebTokenError) {
      // JWT validation error
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid authentication token',
        requestId
      })
    } else if (error instanceof Error) {
      // Known error with a message
      const statusCode = (error as any).statusCode || 500
      return res.status(statusCode).json({
        error: 'Request failed',
        message: error.message || 'An unexpected error occurred',
        requestId
      })
    } else {
      // Unknown error type
      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        requestId
      })
    }
  } finally {
    // Log request performance
    const endTime = performance.now()
    const duration = (endTime - startTime).toFixed(2)
    requestLogger.info(`Request completed`, { durationMs: Number(duration) })
  }
}

/**
 * Authentication middleware for API routes
 * Ensures requests are authenticated before processing
 */
export const withAuth: ApiMiddleware = (handler) => async (req, res) => {
  // This is a placeholder for the actual authentication logic
  // In a real implementation, this would verify the JWT token
  // and attach the user to the request object
  
  // For now, we'll just pass through to the handler
  return handler(req, res)
}

/**
 * Rate limiting middleware for API routes
 * Prevents abuse by limiting the number of requests per time period
 */
export const withRateLimit: ApiMiddleware = (handler) => async (req, res) => {
  // Check rate limit (100 requests per minute by default)
  const rateLimit = checkRateLimit(req, 100, 60000)
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', '100')
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.floor(rateLimit.resetTime / 1000)))
  
  // If rate limit exceeded, return 429 Too Many Requests
  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded', { 
      ip: req.socket.remoteAddress,
      path: req.url,
      method: req.method
    })
    
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    })
  }
  
  // Proceed to handler
  return handler(req, res)
}

/**
 * Combines multiple middleware functions into a single middleware
 */
export const withMiddleware = (...middlewares: ApiMiddleware[]) => {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

/**
 * Standard API middleware stack with error handling, authentication, and rate limiting
 */
export const withApiMiddleware = withMiddleware(
  withErrorHandling,
  withAuth,
  withRateLimit
)
