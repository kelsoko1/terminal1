/**
 * Security utilities for protecting API endpoints and web applications
 * Includes input validation, sanitization, and protection against common web vulnerabilities
 */

import { NextApiRequest } from 'next'
import { logger } from './logger'

/**
 * Input validation patterns
 */
export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phoneNumber: /^\+?[0-9]{10,15}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^[0-9]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
}

/**
 * Validates input against a pattern
 * @param input Input to validate
 * @param pattern Regex pattern to validate against
 * @returns Whether the input is valid
 */
export function validateInput(input: string, pattern: RegExp): boolean {
  return pattern.test(input)
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * @param input Input to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  // Replace HTML tags and special characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\\/g, '&#092;')
}

/**
 * Sanitizes an object by sanitizing all string properties
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends object>(obj: T): T {
  const result = { ...obj }
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeString(result[key] as string) as any
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeObject(result[key] as object) as any
    }
  }
  
  return result
}

/**
 * Validates request parameters against a schema
 * @param params Parameters to validate
 * @param schema Validation schema
 * @returns Validation result
 */
export function validateParams<T extends object>(
  params: T,
  schema: { [K in keyof T]?: (value: T[K]) => boolean }
): { valid: boolean; errors: { field: string; message: string }[] } {
  const errors: { field: string; message: string }[] = []
  
  for (const key in schema) {
    const validator = schema[key]
    if (validator && !validator(params[key])) {
      errors.push({
        field: key as string,
        message: `Invalid value for field '${key}'`
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Rate limiting by IP address
 */
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Checks if a request exceeds the rate limit
 * @param req Next.js API request
 * @param limit Maximum number of requests
 * @param windowMs Time window in milliseconds
 * @returns Whether the request exceeds the rate limit
 */
export function checkRateLimit(
  req: NextApiRequest,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = (req.headers['x-forwarded-for'] as string) || 
             req.socket.remoteAddress || 
             'unknown'
  
  const now = Date.now()
  const resetTime = now + windowMs
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(ip)
  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime }
  }
  
  // Increment request count
  entry.count++
  
  // Update store
  rateLimitStore.set(ip, entry)
  
  // Check if limit exceeded
  const allowed = entry.count <= limit
  const remaining = Math.max(0, limit - entry.count)
  
  if (!allowed) {
    logger.warn('Rate limit exceeded', { ip, count: entry.count, limit })
  }
  
  return { allowed, remaining, resetTime: entry.resetTime }
}

/**
 * Cleans up expired rate limit entries
 * Should be called periodically (e.g., via a cron job)
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  
  // Use Array.from to convert the iterator to an array for compatibility
  Array.from(rateLimitStore.entries()).forEach(([ip, entry]) => {
    if (entry.resetTime < now) {
      rateLimitStore.delete(ip)
    }
  })
}

/**
 * Content Security Policy (CSP) header generator
 */
export function generateCSP(options: {
  defaultSrc?: string[]
  scriptSrc?: string[]
  styleSrc?: string[]
  imgSrc?: string[]
  connectSrc?: string[]
  fontSrc?: string[]
  objectSrc?: string[]
  mediaSrc?: string[]
  frameSrc?: string[]
  reportUri?: string
} = {}): string {
  const directives: string[] = []
  
  // Set default values
  const defaultOptions = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  
  // Add directives
  for (const [key, value] of Object.entries(mergedOptions)) {
    if (Array.isArray(value) && value.length > 0) {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      directives.push(`${directive} ${value.join(' ')}`)
    }
  }
  
  // Add report URI if provided
  if (options.reportUri) {
    directives.push(`report-uri ${options.reportUri}`)
  }
  
  return directives.join('; ')
}

/**
 * Sets security headers for a Next.js API response
 * @param res Next.js API response
 */
export function setSecurityHeaders(res: any): void {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', generateCSP())
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Feature Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

/**
 * Generates a secure random token
 * @param length Token length
 * @returns Random token
 */
export function generateSecureToken(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  // Use crypto.getRandomValues if available
  if (typeof window !== 'undefined' && window.crypto) {
    const values = new Uint32Array(length)
    window.crypto.getRandomValues(values)
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(values[i] % characters.length)
    }
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
  }
  
  return result
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a First string
 * @param b Second string
 * @returns Whether the strings are equal
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}
