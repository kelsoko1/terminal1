import { database, syncConfig } from '../database/config';
import { synchronize } from '@nozbe/watermelondb/sync';
import { Q } from '@nozbe/watermelondb';
import api from './api';

class DatabaseService {
  private syncTimer: NodeJS.Timeout | null = null;
  private isLiveMode: boolean = false;

  constructor() {
    this.startSync();
  }

  // Start periodic synchronization
  public startSync(): void {
    this.syncTimer = setInterval(() => {
      this.synchronizeWithServer();
    }, syncConfig.syncInterval);
  }

  // Stop synchronization
  public stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // Synchronize with DSE Avvento server
  private async synchronizeWithServer(): Promise<void> {
    if (!this.isLiveMode) {
      // Demo mode sync logic
      return;
    }

    let retryCount = 0;
    while (retryCount < syncConfig.maxRetries) {
      try {
        await synchronize({
          database,
          pullChanges: async ({ lastPulledAt }) => {
            const response = await this.fetchFromServer(lastPulledAt);
            return {
              changes: response.changes,
              timestamp: response.timestamp,
            };
          },
          pushChanges: async ({ changes, lastPulledAt }) => {
            if (this.isLiveMode) {
              await this.pushToServer(changes, lastPulledAt);
            }
          },
          migrationsEnabledAtVersion: 1,
        });
        break;
      } catch (error) {
        retryCount++;
        console.error(`Sync attempt ${retryCount} failed:`, error);
        if (retryCount < syncConfig.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, syncConfig.retryDelay));
        }
      }
    }
  }

  // Fetch changes from Next.js backend
  private async fetchFromServer(lastPulledAt: number | null): Promise<any> {
    const timestamp = new Date().getTime();
    
    try {
      const response = await api.post('/sync', {
        lastPulledAt,
        batchSize: syncConfig.batchSize,
      });
      
      const data = response.data;
      return {
        changes: data.changes,
        timestamp,
      };
    } catch (error) {
      console.error('Error fetching from server:', error);
      throw error;
    }
  }

  // Push local changes to Next.js backend
  private async pushToServer(changes: any, lastPulledAt: number): Promise<void> {
    try {
      await api.post('/sync/push', {
        changes,
        lastPulledAt,
      });
    } catch (error) {
      console.error('Error pushing to server:', error);
      throw error;
    }
  }

  // Get user portfolio
  public async getUserPortfolio(userId: string) {
    return await database.get('portfolios')
      .query(Q.where('user_id', userId))
      .fetch();
  }

  // Get user watchlists
  public async getUserWatchlists(userId: string) {
    return await database.get('watchlists')
      .query(Q.where('user_id', userId))
      .fetch();
  }

  // Get user orders
  public async getUserOrders(userId: string) {
    return await database.get('orders')
      .query(
        Q.where('user_id', userId),
        Q.sortBy('created_at', 'desc')
      )
      .fetch();
  }

  // Get user transactions
  public async getUserTransactions(userId: string) {
    return await database.get('transactions')
      .query(
        Q.where('user_id', userId),
        Q.sortBy('created_at', 'desc')
      )
      .fetch();
  }

  // Get security details
  public async getSecurityDetails(symbol: string) {
    return await database.get('securities')
      .query(Q.where('symbol', symbol))
      .fetch();
  }

  // Get market data
  public async getMarketData(type: 'index' | 'sector') {
    return await database.get('market_data')
      .query(
        Q.where('type', type),
        Q.sortBy('timestamp', 'desc')
      )
      .fetch();
  }

  // Get latest news
  public async getLatestNews(limit: number = 20) {
    return await database.get('news')
      .query(
        Q.sortBy('published_at', 'desc'),
        Q.take(limit)
      )
      .fetch();
  }

  // Data Management Methods

  // Create new order
  public async createOrder(orderData: {
    userId: string;
    securityId: string;
    orderType: 'market' | 'limit';
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    timeInForce: 'day' | 'gtc';
  }) {
    const ordersCollection = database.get('orders');
    await database.write(async () => {
      await ordersCollection.create(order => {
        order.userId = orderData.userId;
        order.securityId = orderData.securityId;
        order.orderType = orderData.orderType;
        order.side = orderData.side;
        order.quantity = orderData.quantity;
        order.price = orderData.price;
        order.status = 'pending';
        order.timeInForce = orderData.timeInForce;
      });
    });
  }

  // Update order status
  public async updateOrderStatus(orderId: string, status: 'executed' | 'cancelled' | 'rejected') {
    const order = await database.get('orders').find(orderId);
    await database.write(async () => {
      await order.update(order => {
        order.status = status;
      });
    });
  }

  // Create watchlist
  public async createWatchlist(userId: string, name: string) {
    const watchlistsCollection = database.get('watchlists');
    await database.write(async () => {
      await watchlistsCollection.create(watchlist => {
        watchlist.userId = userId;
        watchlist.name = name;
      });
    });
  }

  // Add security to watchlist
  public async addToWatchlist(watchlistId: string, securityId: string) {
    const watchlistItemsCollection = database.get('watchlist_items');
    await database.write(async () => {
      await watchlistItemsCollection.create(item => {
        item.watchlistId = watchlistId;
        item.securityId = securityId;
      });
    });
  }

  // Remove security from watchlist
  public async removeFromWatchlist(watchlistId: string, securityId: string) {
    const items = await database.get('watchlist_items')
      .query(
        Q.where('watchlist_id', watchlistId),
        Q.where('security_id', securityId)
      )
      .fetch();

    await database.write(async () => {
      await Promise.all(items.map(item => item.destroyPermanently()));
    });
  }

  // Update portfolio cash balance
  public async updatePortfolioCashBalance(portfolioId: string, amount: number) {
    const portfolio = await database.get('portfolios').find(portfolioId);
    await database.write(async () => {
      await portfolio.update(portfolio => {
        portfolio.cashBalance += amount;
      });
    });
  }

  // Update security holding
  public async updateHolding(holdingData: {
    portfolioId: string;
    securityId: string;
    quantity: number;
    averagePrice: number;
  }) {
    const holdingsCollection = database.get('holdings');
    const existing = await holdingsCollection
      .query(
        Q.where('portfolio_id', holdingData.portfolioId),
        Q.where('security_id', holdingData.securityId)
      )
      .fetch();

    await database.write(async () => {
      if (existing.length > 0) {
        await existing[0].update(holding => {
          holding.quantity = holdingData.quantity;
          holding.averagePrice = holdingData.averagePrice;
        });
      } else {
        await holdingsCollection.create(holding => {
          holding.portfolioId = holdingData.portfolioId;
          holding.securityId = holdingData.securityId;
          holding.quantity = holdingData.quantity;
          holding.averagePrice = holdingData.averagePrice;
        });
      }
    });
  }

  // Record transaction
  public async recordTransaction(transactionData: {
    userId: string;
    securityId: string;
    type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
    quantity: number;
    price: number;
    amount: number;
    commission: number;
  }) {
    const transactionsCollection = database.get('transactions');
    await database.write(async () => {
      await transactionsCollection.create(transaction => {
        transaction.userId = transactionData.userId;
        transaction.securityId = transactionData.securityId;
        transaction.type = transactionData.type;
        transaction.quantity = transactionData.quantity;
        transaction.price = transactionData.price;
        transaction.amount = transactionData.amount;
        transaction.commission = transactionData.commission;
        transaction.status = 'completed';
      });
    });
  }

  // Search securities
  public async searchSecurities(query: string) {
    return await database.get('securities')
      .query(
        Q.or(
          Q.where('symbol', Q.like(`%${query}%`)),
          Q.where('name', Q.like(`%${query}%`))
        )
      )
      .fetch();
  }

  // Get portfolio performance
  public async getPortfolioPerformance(portfolioId: string) {
    const holdings = await database.get('holdings')
      .query(Q.where('portfolio_id', portfolioId))
      .fetch();

    const portfolio = await database.get('portfolios').find(portfolioId);
    
    const performanceData = {
      totalValue: portfolio.cashBalance,
      totalGainLoss: 0,
      holdings: []
    };

    for (const holding of holdings) {
      const security = await database.get('securities').find(holding.securityId);
      const marketValue = holding.quantity * security.lastPrice;
      const costBasis = holding.quantity * holding.averagePrice;
      const gainLoss = marketValue - costBasis;

      performanceData.totalValue += marketValue;
      performanceData.totalGainLoss += gainLoss;
      performanceData.holdings.push({
        symbol: security.symbol,
        quantity: holding.quantity,
        marketValue,
        gainLoss,
        gainLossPercent: (gainLoss / costBasis) * 100
      });
    }

    return performanceData;
  }

  // Force immediate synchronization
  public async forceSynchronization(): Promise<void> {
    await this.synchronizeWithServer();
  }

  // Switch to live data mode
  public async switchToLiveData(authToken: string): Promise<void> {
    try {
      // Stop demo data updates if any
      this.stopSync();

      // Clear all demo data
      await this.clearAllDemoData();

      // Set live mode flag
      this.isLiveMode = true;

      // Initialize live data synchronization
      await this.initializeLiveData(authToken);

      // Restart sync with live data
      this.startSync();
    } catch (error) {
      console.error('Error switching to live data:', error);
      throw new Error('Failed to switch to live data');
    }
  }

  // Clear all demo data
  private async clearAllDemoData(): Promise<void> {
    await database.write(async () => {
      // Clear all tables except user authentication data
      await Promise.all([
        database.get('securities').query().destroyAllPermanently(),
        database.get('portfolios').query().destroyAllPermanently(),
        database.get('holdings').query().destroyAllPermanently(),
        database.get('orders').query().destroyAllPermanently(),
        database.get('transactions').query().destroyAllPermanently(),
        database.get('watchlists').query().destroyAllPermanently(),
        database.get('watchlist_items').query().destroyAllPermanently(),
        database.get('market_data').query().destroyAllPermanently(),
        database.get('news').query().destroyAllPermanently(),
      ]);
    });
  }

  // Initialize live data
  private async initializeLiveData(authToken: string): Promise<void> {
    try {
      // Fetch initial market data
      await this.fetchInitialMarketData(authToken);

      // Fetch user's portfolio data
      await this.fetchUserPortfolioData(authToken);

      // Fetch active orders
      await this.fetchActiveOrders(authToken);

      // Subscribe to real-time updates
      this.subscribeToRealtimeUpdates(authToken);
    } catch (error) {
      console.error('Error initializing live data:', error);
      throw error;
    }
  }

  // Fetch initial market data
  private async fetchInitialMarketData(authToken: string): Promise<void> {
    const response = await fetch(`${syncConfig.apiUrl}/market/initial`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch initial market data');
    }

    const data = await response.json();
    await database.write(async () => {
      // Update securities
      for (const security of data.securities) {
        await database.get('securities').create(record => {
          Object.assign(record, security);
        });
      }

      // Update market indices
      for (const index of data.indices) {
        await database.get('market_data').create(record => {
          Object.assign(record, index);
        });
      }
    });
  }

  // Subscribe to real-time updates
  private subscribeToRealtimeUpdates(authToken: string): void {
    // Implement WebSocket connection for real-time updates
    const ws = new WebSocket(`${syncConfig.apiUrl.replace('http', 'ws')}/realtime`);
    
    ws.onmessage = async (event) => {
      const update = JSON.parse(event.data);
      
      await database.write(async () => {
        switch (update.type) {
          case 'PRICE_UPDATE':
            // Update security prices
            const security = await database.get('securities').find(update.data.symbol);
            await security.update(record => {
              record.lastPrice = update.data.price;
              record.change = update.data.change;
              record.changePercent = update.data.changePercent;
            });
            break;

          case 'ORDER_UPDATE':
            // Update order status
            const order = await database.get('orders').find(update.data.orderId);
            await order.update(record => {
              record.status = update.data.status;
            });
            break;

          case 'MARKET_INDEX_UPDATE':
            // Update market indices
            await database.get('market_data').create(record => {
              Object.assign(record, update.data);
            });
            break;

          case 'NEWS_UPDATE':
            // Add new market news
            await database.get('news').create(record => {
              Object.assign(record, update.data);
            });
            break;
        }
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Implement reconnection logic
    };
  }
}

export const databaseService = new DatabaseService(); 