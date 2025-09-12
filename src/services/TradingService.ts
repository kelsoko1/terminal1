import { database } from '../database/config';
import { databaseService } from './DatabaseService';
import { authService } from './AuthService';

export interface OrderRequest {
  symbol: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  timeInForce: 'day' | 'gtc';
}

export interface OrderResponse {
  orderId: string;
  status: 'pending' | 'executed' | 'cancelled' | 'rejected';
  message?: string;
}

class TradingService {
  // Place a new order
  public async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate order
      await this.validateOrder(orderRequest);

      // Create order in database
      const order = await databaseService.createOrder({
        userId: user.userId,
        securityId: orderRequest.symbol,
        orderType: orderRequest.type,
        side: orderRequest.side,
        quantity: orderRequest.quantity,
        price: orderRequest.price || 0,
        timeInForce: orderRequest.timeInForce
      });

      // Send order to DSE Avvento system
      const response = await this.sendOrderToDSE(orderRequest);

      // Update order status based on DSE response
      await databaseService.updateOrderStatus(order.id, response.status);

      // If order is executed, update portfolio
      if (response.status === 'executed') {
        await this.updatePortfolio(orderRequest);
      }

      return {
        orderId: order.id,
        status: response.status,
        message: response.message
      };
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // Cancel an existing order
  public async cancelOrder(orderId: string): Promise<OrderResponse> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Send cancellation request to DSE
      const response = await this.sendCancelRequestToDSE(orderId);

      // Update order status in database
      await databaseService.updateOrderStatus(orderId, 'cancelled');

      return {
        orderId,
        status: 'cancelled',
        message: 'Order cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Get order status
  public async getOrderStatus(orderId: string): Promise<OrderResponse> {
    try {
      const order = await database.get('orders').find(orderId);
      return {
        orderId,
        status: order.status,
      };
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }

  // Get user's active orders
  public async getActiveOrders(): Promise<any[]> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await database.get('orders')
        .query(
          Q.where('user_id', user.userId),
          Q.where('status', Q.oneOf(['pending', 'partial'])),
          Q.sortBy('created_at', 'desc')
        )
        .fetch();
    } catch (error) {
      console.error('Error getting active orders:', error);
      throw error;
    }
  }

  // Get order history
  public async getOrderHistory(): Promise<any[]> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await database.get('orders')
        .query(
          Q.where('user_id', user.userId),
          Q.where('status', Q.oneOf(['executed', 'cancelled', 'rejected'])),
          Q.sortBy('created_at', 'desc'),
          Q.take(100)
        )
        .fetch();
    } catch (error) {
      console.error('Error getting order history:', error);
      throw error;
    }
  }

  // Private helper methods
  private async validateOrder(order: OrderRequest): Promise<void> {
    // Get user's portfolio and balance
    const user = authService.getCurrentUser();
    const portfolio = await databaseService.getUserPortfolio(user!.userId);
    const security = await databaseService.getSecurityDetails(order.symbol);

    if (order.side === 'buy') {
      // Check if user has enough cash
      const requiredAmount = order.quantity * (order.price || security[0].lastPrice);
      if (portfolio[0].cashBalance < requiredAmount) {
        throw new Error('Insufficient funds');
      }
    } else {
      // Check if user has enough shares
      const holdings = await database.get('holdings')
        .query(
          Q.where('portfolio_id', portfolio[0].id),
          Q.where('security_id', order.symbol)
        )
        .fetch();

      if (!holdings.length || holdings[0].quantity < order.quantity) {
        throw new Error('Insufficient shares');
      }
    }
  }

  private async sendOrderToDSE(order: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await fetch(`${process.env.DSE_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error('Failed to send order to DSE');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending order to DSE:', error);
      throw error;
    }
  }

  private async sendCancelRequestToDSE(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${process.env.DSE_API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: authService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling order with DSE:', error);
      throw error;
    }
  }

  private async updatePortfolio(order: OrderRequest): Promise<void> {
    const user = authService.getCurrentUser();
    const portfolio = await databaseService.getUserPortfolio(user!.userId);
    const security = await databaseService.getSecurityDetails(order.symbol);
    const price = order.price || security[0].lastPrice;

    // Update holdings
    await databaseService.updateHolding({
      portfolioId: portfolio[0].id,
      securityId: order.symbol,
      quantity: order.quantity * (order.side === 'buy' ? 1 : -1),
      averagePrice: price
    });

    // Update cash balance
    const amount = order.quantity * price * (order.side === 'buy' ? -1 : 1);
    await databaseService.updatePortfolioCashBalance(portfolio[0].id, amount);

    // Record transaction
    await databaseService.recordTransaction({
      userId: user!.userId,
      securityId: order.symbol,
      type: order.side,
      quantity: order.quantity,
      price: price,
      amount: Math.abs(amount),
      commission: Math.abs(amount) * 0.002 // 0.2% commission
    });
  }
}

export const tradingService = new TradingService(); 