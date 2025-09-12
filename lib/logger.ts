/**
 * Enhanced logging utility for the application
 * Provides structured logging with severity levels and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface LogContext {
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  userId?: string
  requestId?: string
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private context: LogContext = {}
  private minLevel: LogLevel = 'info'
  
  /**
   * Set the minimum log level to display
   * @param level Minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }
  
  /**
   * Set global context that will be included with all log entries
   * @param context Context object
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context }
  }
  
  /**
   * Log a debug message
   * @param message Log message
   * @param context Additional context
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }
  
  /**
   * Log an info message
   * @param message Log message
   * @param context Additional context
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }
  
  /**
   * Log a warning message
   * @param message Log message
   * @param context Additional context
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }
  
  /**
   * Log an error message
   * @param message Log message
   * @param error Error object
   * @param context Additional context
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {}
    
    this.log('error', message, { ...errorContext, ...context })
  }
  
  /**
   * Log a fatal error message
   * @param message Log message
   * @param error Error object
   * @param context Additional context
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {}
    
    this.log('fatal', message, { ...errorContext, ...context })
  }
  
  /**
   * Create a child logger with additional context
   * @param context Additional context for the child logger
   * @returns Child logger instance
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger()
    childLogger.setMinLevel(this.minLevel)
    childLogger.setContext({ ...this.context, ...context })
    return childLogger
  }
  
  /**
   * Internal log method
   * @param level Log level
   * @param message Log message
   * @param context Additional context
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Skip if below minimum level
    if (!this.shouldLog(level)) {
      return
    }
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context }
    }
    
    // In production, this would send to a proper logging service
    // For now, we'll just console log with appropriate formatting
    this.writeLog(entry)
  }
  
  /**
   * Check if the log level should be displayed
   * @param level Log level to check
   * @returns Whether the log should be displayed
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal']
    const minLevelIndex = levels.indexOf(this.minLevel)
    const currentLevelIndex = levels.indexOf(level)
    
    return currentLevelIndex >= minLevelIndex
  }
  
  /**
   * Write the log entry to the appropriate output
   * @param entry Log entry
   */
  private writeLog(entry: LogEntry): void {
    // Format the log entry
    const { timestamp, level, message, context, error } = entry
    
    // Choose the appropriate console method
    let logMethod: (message: string, ...optionalParams: any[]) => void
    
    switch (level) {
      case 'debug':
        logMethod = console.debug
        break
      case 'info':
        logMethod = console.info
        break
      case 'warn':
        logMethod = console.warn
        break
      case 'error':
      case 'fatal':
        logMethod = console.error
        break
      default:
        logMethod = console.log
    }
    
    // Log with appropriate format
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
    
    if (context && Object.keys(context).length > 0) {
      logMethod(formattedMessage, context)
    } else {
      logMethod(formattedMessage)
    }
    
    // Log stack trace separately for better readability
    if (error?.stack) {
      console.error(error.stack)
    }
  }
}

// Create a singleton instance
export const logger = new Logger()

// Set environment-specific configuration
if (process.env.NODE_ENV === 'development') {
  logger.setMinLevel('debug')
} else {
  logger.setMinLevel('info')
}

// Export the Logger class for creating custom instances
export { Logger }
