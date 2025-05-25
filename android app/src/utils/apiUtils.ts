/**
 * Utility functions for API interaction
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import getEnvVars from '../config/apiConfig';

/**
 * Get the API base URL based on environment
 * In production, this would point to your deployed Next.js backend
 */
export const getApiBaseUrl = (): string => {
  const { apiUrl } = getEnvVars();
  return apiUrl;
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    return `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Format currency values
 */
export const formatCurrency = (value: number, currency: string = 'TSh'): string => {
  return `${currency} ${value.toLocaleString()}`;
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};
