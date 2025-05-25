import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { handleApiError } from './apiUtils';

/**
 * Check if the device is connected to the internet
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export const isConnected = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false;
  }
};

/**
 * Wrapper for API calls to handle network connectivity
 * @param apiCall - The API call function to execute
 * @param errorMessage - Custom error message to display if the API call fails
 * @returns Promise<T> - The API response
 */
export async function withNetworkCheck<T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'Network request failed'
): Promise<T> {
  const connected = await isConnected();
  
  if (!connected) {
    throw new Error('No internet connection. Please check your network settings and try again.');
  }
  
  try {
    return await apiCall();
  } catch (error: any) {
    const message = handleApiError(error);
    throw new Error(message || errorMessage);
  }
}

/**
 * Retry a function with exponential backoff
 * @param fn - The function to retry
 * @param retries - Number of retries
 * @param delay - Initial delay in milliseconds
 * @param backoff - Backoff factor
 * @returns Promise<T> - The function result
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retry(fn, retries - 1, delay * backoff, backoff);
  }
}

/**
 * Get appropriate timeout for the current network condition
 * @returns number - Timeout in milliseconds
 */
export const getNetworkTimeout = (): number => {
  // Default timeouts based on platform
  const defaultTimeout = Platform.OS === 'android' ? 15000 : 10000;
  
  return defaultTimeout;
};

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
