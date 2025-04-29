import { databaseService } from './DatabaseService';
import { authService } from './AuthService';

interface MarketUpdate {
  type: 'PRICE_UPDATE' | 'ORDER_UPDATE' | 'MARKET_INDEX_UPDATE' | 'NEWS_UPDATE';
  data: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds
  private subscriptions: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect() {
    try {
      this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_DSE_WS_URL}/realtime`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.resubscribe();
      };

      this.ws.onmessage = this.handleMessage.bind(this);

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private async handleMessage(event: MessageEvent) {
    try {
      const update: MarketUpdate = JSON.parse(event.data);

      switch (update.type) {
        case 'PRICE_UPDATE':
          await this.handlePriceUpdate(update.data);
          break;
        case 'ORDER_UPDATE':
          await this.handleOrderUpdate(update.data);
          break;
        case 'MARKET_INDEX_UPDATE':
          await this.handleMarketIndexUpdate(update.data);
          break;
        case 'NEWS_UPDATE':
          await this.handleNewsUpdate(update.data);
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private async handlePriceUpdate(data: any) {
    await databaseService.updateSecurityPrice(data.symbol, {
      lastPrice: data.price,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume
    });
  }

  private async handleOrderUpdate(data: any) {
    await databaseService.updateOrderStatus(data.orderId, data.status);
    if (data.status === 'executed') {
      await databaseService.updatePortfolio(data.orderId);
    }
  }

  private async handleMarketIndexUpdate(data: any) {
    await databaseService.updateMarketData({
      type: 'index',
      name: data.name,
      value: data.value,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume,
      timestamp: new Date().getTime()
    });
  }

  private async handleNewsUpdate(data: any) {
    await databaseService.addNews({
      title: data.title,
      content: data.content,
      source: data.source,
      category: data.category,
      impact: data.impact,
      relatedSymbols: data.symbols,
      publishedAt: new Date().getTime()
    });
  }

  // Subscribe to updates for a specific symbol
  public subscribeToSymbol(symbol: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.subscriptions.add(symbol);
      return;
    }

    this.ws.send(JSON.stringify({
      action: 'subscribe',
      symbol,
      token: authService.getAuthHeaders().Authorization
    }));
    this.subscriptions.add(symbol);
  }

  // Unsubscribe from updates for a specific symbol
  public unsubscribeFromSymbol(symbol: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.subscriptions.delete(symbol);
      return;
    }

    this.ws.send(JSON.stringify({
      action: 'unsubscribe',
      symbol,
      token: authService.getAuthHeaders().Authorization
    }));
    this.subscriptions.delete(symbol);
  }

  // Resubscribe to all symbols after reconnection
  private resubscribe() {
    this.subscriptions.forEach(symbol => {
      this.subscribeToSymbol(symbol);
    });
  }

  // Close WebSocket connection
  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const webSocketService = new WebSocketService(); 