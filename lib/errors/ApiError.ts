/**
 * Custom API error class for handling application-specific errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    
    // This is necessary for proper error handling with classes in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
