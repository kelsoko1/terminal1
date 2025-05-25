import api from './api';
import { withNetworkCheck, retry } from '../utils/networkUtils';
import { saveToCache, getFromCache, CACHE_EXPIRATION } from '../utils/cacheUtils';

/**
 * Service for communicating with the Next.js backend
 */
export class BackendService {
  // Auth endpoints
  async login(email: string, password: string) {
    return api.post('/auth/login', { email, password });
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phoneNumber?: string;
  }) {
    return api.post('/auth/register', userData);
  }

  async refreshToken(refreshToken: string) {
    return api.post('/auth/refresh', { refreshToken });
  }

  async logout() {
    return api.post('/auth/logout');
  }

  async resetPassword(email: string) {
    return api.post('/auth/reset-password', { email });
  }

  // User endpoints
  async getUserProfile() {
    const cacheKey = 'user_profile';
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    
    // If not in cache, fetch from API
    return withNetworkCheck(async () => {
      const response = await api.get('/users/profile');
      
      // Save to cache
      if (response.data) {
        await saveToCache(cacheKey, response.data, CACHE_EXPIRATION.MEDIUM);
      }
      
      return response;
    });
  }

  async updateUserProfile(profileData: any) {
    return api.put('/users/profile', profileData);
  }

  // Social endpoints - Legacy endpoints (to be removed)
  async commentOnPost(postId: string, content: string) {
    return api.post(`/social/posts/${postId}/comments`, { content });
  }

  // Subscription endpoints
  async getSubscriptionPlans() {
    return api.get('/subscription-plans');
  }

  async getCurrentSubscription() {
    return api.get('/subscriptions/current');
  }

  async subscribe(planId: string, paymentMethodId: string) {
    return api.post('/subscriptions', { planId, paymentMethodId });
  }

  async cancelSubscription() {
    return api.post('/subscriptions/cancel');
  }

  // Research endpoints
  async getResearchReports(page = 1, limit = 10) {
    const cacheKey = `research_reports_${page}_${limit}`;
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    
    // If not in cache, fetch from API
    return withNetworkCheck(async () => {
      const response = await api.get(`/research/reports?page=${page}&limit=${limit}`);
      
      // Save to cache
      if (response.data) {
        await saveToCache(cacheKey, response.data, CACHE_EXPIRATION.MEDIUM);
      }
      
      return response;
    });
  }

  async getResearchReport(reportId: string) {
    return api.get(`/research/reports/${reportId}`);
  }

  // Investor endpoints
  async getInvestorData() {
    return api.get('/investors/data');
  }

  // Market data endpoints
  async getMarketOverview() {
    const cacheKey = 'market_overview';
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    
    // If not in cache, fetch from API with retry
    return withNetworkCheck(async () => {
      const response = await retry(() => api.get('/market/overview'));
      
      // Save to cache
      if (response.data) {
        await saveToCache(cacheKey, response.data, CACHE_EXPIRATION.SHORT);
      }
      
      return response;
    });
  }

  async getStockData(symbol: string) {
    return api.get(`/market/stocks/${symbol}`);
  }

  async getStockHistory(symbol: string, period: 'day' | 'week' | 'month' | 'year') {
    return api.get(`/market/stocks/${symbol}/history?period=${period}`);
  }

  async getWatchlist() {
    return api.get('/market/watchlist');
  }

  async addToWatchlist(symbol: string) {
    return api.post('/market/watchlist', { symbol });
  }

  async removeFromWatchlist(symbol: string) {
    return api.delete(`/market/watchlist/${symbol}`);
  }

  // Portfolio endpoints
  async getPortfolio() {
    const cacheKey = 'portfolio';
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    
    // If not in cache, fetch from API
    return withNetworkCheck(async () => {
      const response = await api.get('/portfolio');
      
      // Save to cache
      if (response.data) {
        await saveToCache(cacheKey, response.data, CACHE_EXPIRATION.SHORT);
      }
      
      return response;
    });
  }
  
  // Social feed endpoints
  async getPosts(page = 1, limit = 10) {
    const cacheKey = `social_posts_${page}_${limit}`;
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    
    // If not in cache, fetch from API
    return withNetworkCheck(async () => {
      const response = await api.get(`/api/social/posts?page=${page}&limit=${limit}`);
      
      // Save to cache
      if (response.data) {
        await saveToCache(cacheKey, response.data, CACHE_EXPIRATION.SHORT);
      }
      
      return response;
    });
  }
  
  async getPost(postId: string) {
    const cacheKey = `social_post_${postId}`;
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    
    return withNetworkCheck(async () => {
      const response = await api.get(`/api/social/posts/${postId}`);
      
      // Save to cache
      if (response.data) {
        await saveToCache(cacheKey, response.data, CACHE_EXPIRATION.MEDIUM);
      }
      
      return response;
    });
  }
  
  async createPost(postData: any) {
    return withNetworkCheck(async () => {
      const response = await api.post('/api/social/posts', postData);
      return response;
    });
  }
  
  async likePost(postId: string) {
    return withNetworkCheck(async () => {
      const response = await api.post(`/api/social/posts/${postId}/like`);
      return response;
    });
  }
  
  async getPostComments(postId: string, page = 1, limit = 20) {
    const cacheKey = `post_comments_${postId}_${page}_${limit}`;
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    
    return withNetworkCheck(async () => {
      const response = await api.get(`/api/social/posts/${postId}/comments?page=${page}&limit=${limit}`);
      
      // Save to cache
      if (response.data) {
        await saveToCache(cacheKey, response.data, CACHE_EXPIRATION.SHORT);
      }
      
      return response;
    });
  }
  
  async addComment(postId: string, commentData: any) {
    return withNetworkCheck(async () => {
      const response = await api.post(`/api/social/posts/${postId}/comments`, commentData);
      return response;
    });
  }

  async getPortfolioHistory(period: 'day' | 'week' | 'month' | 'year') {
    return api.get(`/portfolio/history?period=${period}`);
  }

  async placeOrder(orderData: {
    symbol: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    quantity: number;
    price?: number;
  }) {
    return api.post('/portfolio/orders', orderData);
  }

  async getOrders(status?: 'open' | 'closed' | 'all') {
    return api.get(`/portfolio/orders?status=${status || 'all'}`);
  }
}

export const backendService = new BackendService();
