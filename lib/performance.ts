import { performance } from 'perf_hooks'

/**
 * Performance monitoring utility for tracking execution time
 */
export class PerformanceMonitor {
  private startTime: number
  private markers: Map<string, number> = new Map()
  private readonly name: string

  constructor(name: string) {
    this.name = name
    this.startTime = performance.now()
  }

  /**
   * Add a marker at the current point in time
   * @param markerName Name of the marker
   */
  mark(markerName: string): void {
    this.markers.set(markerName, performance.now())
  }

  /**
   * Get the duration between two markers or from start to a marker
   * @param fromMarker Starting marker name (or 'start' for beginning)
   * @param toMarker Ending marker name (or 'now' for current time)
   * @returns Duration in milliseconds
   */
  getDuration(fromMarker: string = 'start', toMarker: string = 'now'): number {
    const startPoint = fromMarker === 'start' 
      ? this.startTime 
      : this.markers.get(fromMarker) || this.startTime
    
    const endPoint = toMarker === 'now' 
      ? performance.now() 
      : this.markers.get(toMarker) || performance.now()
    
    return endPoint - startPoint
  }

  /**
   * Log the performance metrics
   * @param includeMarkers Whether to include individual markers in the log
   */
  logMetrics(includeMarkers: boolean = false): void {
    const totalDuration = this.getDuration()
    console.info(`[Performance] ${this.name} completed in ${totalDuration.toFixed(2)}ms`)
    
    if (includeMarkers && this.markers.size > 0) {
      const markerMetrics = Array.from(this.markers.entries()).map(([name, time]) => {
        const fromStart = (time - this.startTime).toFixed(2)
        return `${name}: ${fromStart}ms from start`
      })
      
      console.info(`[Performance] ${this.name} markers:`, markerMetrics)
    }
  }
}

/**
 * Memoization utility for caching function results
 * @param fn Function to memoize
 * @param getKey Function to generate a cache key from arguments
 * @param ttl Time to live in milliseconds (default: 5 minutes)
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args),
  ttl: number = 300000
): T {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args)
    const cached = cache.get(key)
    
    if (cached && cached.expiry > Date.now()) {
      return cached.value
    }
    
    const result = fn(...args)
    
    // Handle promises
    if (result instanceof Promise) {
      return result.then((value) => {
        cache.set(key, { value, expiry: Date.now() + ttl })
        return value
      }) as ReturnType<T>
    }
    
    cache.set(key, { value: result, expiry: Date.now() + ttl })
    return result
  }) as T
}

/**
 * Debounce utility to limit function execution frequency
 * @param fn Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      fn(...args)
      timeout = null
    }, wait)
  }
}

/**
 * Throttle utility to limit function execution frequency
 * @param fn Function to throttle
 * @param limit Limit time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>): void {
    const now = Date.now()
    
    if (now - lastCall >= limit) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      
      lastCall = now
      fn(...args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now()
        fn(...args)
        timeout = null
      }, limit - (now - lastCall))
    }
  }
}
