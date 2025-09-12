import { getFirestore, collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

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

interface Portfolio {
  id: string;
  userId: string;
  cashBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface Holding {
  id: string;
  portfolioId: string;
  securityId: string;
  quantity: number;
  averagePrice: number;
  createdAt: string;
  updatedAt: string;
}

interface Security {
  id: string;
  symbol: string;
  lastPrice: number;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

class TradingService {
  private db = getFirestore(app);

  // Get current authenticated user
  private getCurrentUser() {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  // Place a new order
  public async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    try {
      const user = this.getCurrentUser();

      // Validate order
      await this.validateOrder(orderRequest);

      // Create order in Firestore
      const orderRef = await addDoc(collection(this.db, 'orders'), {
        userId: user.uid,
        securityId: orderRequest.symbol,
        orderType: orderRequest.type,
        side: orderRequest.side,
        quantity: orderRequest.quantity,
        price: orderRequest.price || 0,
        timeInForce: orderRequest.timeInForce,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Send order to DSE Avvento system
      const response = await this.sendOrderToDSE(orderRequest);

      // Update order status based on DSE response
      await updateDoc(doc(this.db, 'orders', orderRef.id), {
        status: response.status,
        updatedAt: Timestamp.now()
      });

      // If order is executed, update portfolio
      if (response.status === 'executed') {
        await this.updatePortfolio(orderRequest);
      }
    
    return {
        orderId: orderRef.id,
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
      const user = this.getCurrentUser();

      // Get order to verify ownership
      const orderRef = doc(this.db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists() || orderSnap.data().userId !== user.uid) {
        throw new Error('Order not found or unauthorized');
      }

      // Send cancellation request to DSE
      const response = await this.sendCancelRequestToDSE(orderId);

      // Update order status in Firestore
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      });

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
      const user = this.getCurrentUser();

      const orderRef = doc(this.db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists() || orderSnap.data().userId !== user.uid) {
        throw new Error('Order not found or unauthorized');
      }
    
    return {
        orderId,
        status: orderSnap.data().status,
      };
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }

  // Get user's active orders
  public async getActiveOrders(): Promise<any[]> {
    try {
      const user = this.getCurrentUser();

      const ordersRef = collection(this.db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        where('status', 'in', ['pending', 'partial']),
        orderBy('createdAt', 'desc')
      );

      const ordersSnap = await getDocs(q);
      return ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active orders:', error);
      throw error;
    }
  }

  // Get order history
  public async getOrderHistory(): Promise<any[]> {
    try {
      const user = this.getCurrentUser();

      const ordersRef = collection(this.db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        where('status', 'in', ['executed', 'cancelled', 'rejected']),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const ordersSnap = await getDocs(q);
      return ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting order history:', error);
      throw error;
    }
  }

  // Private helper methods
  private async validateOrder(order: OrderRequest): Promise<void> {
    const user = this.getCurrentUser();

    // Get user's portfolio
    const portfoliosRef = collection(this.db, 'portfolios');
    const portfolioQuery = query(portfoliosRef, where('userId', '==', user.uid));
    const portfolioSnap = await getDocs(portfolioQuery);

    if (portfolioSnap.empty) {
      throw new Error('Portfolio not found');
    }

    const portfolio = {
      id: portfolioSnap.docs[0].id,
      ...portfolioSnap.docs[0].data()
    } as Portfolio;

    // Get security details
    const securityRef = doc(this.db, 'securities', order.symbol);
    const securitySnap = await getDoc(securityRef);

    if (!securitySnap.exists()) {
      throw new Error('Security not found');
    }

    const security = {
      id: securitySnap.id,
      ...securitySnap.data()
    } as Security;

    if (order.side === 'buy') {
      // Check if user has enough cash
      const requiredAmount = order.quantity * (order.price || security.lastPrice);
      if (portfolio.cashBalance < requiredAmount) {
        throw new Error('Insufficient funds');
      }
    } else {
      // Check if user has enough shares
      const holdingsRef = collection(this.db, 'holdings');
      const holdingQuery = query(
        holdingsRef,
        where('portfolioId', '==', portfolio.id),
        where('securityId', '==', order.symbol)
      );
      const holdingSnap = await getDocs(holdingQuery);

      if (holdingSnap.empty || holdingSnap.docs[0].data().quantity < order.quantity) {
        throw new Error('Insufficient shares');
      }
    }
  }

  private async updatePortfolio(order: OrderRequest): Promise<void> {
    const user = this.getCurrentUser();

    // Get user's portfolio
    const portfoliosRef = collection(this.db, 'portfolios');
    const portfolioQuery = query(portfoliosRef, where('userId', '==', user.uid));
    const portfolioSnap = await getDocs(portfolioQuery);
    const portfolio = {
      id: portfolioSnap.docs[0].id,
      ...portfolioSnap.docs[0].data()
    } as Portfolio;

    // Get security details
    const securityRef = doc(this.db, 'securities', order.symbol);
    const securitySnap = await getDoc(securityRef);
    const security = {
      id: securitySnap.id,
      ...securitySnap.data()
    } as Security;

    const price = order.price || security.lastPrice;

    // Update holdings
    const holdingsRef = collection(this.db, 'holdings');
    const holdingQuery = query(
      holdingsRef,
      where('portfolioId', '==', portfolio.id),
      where('securityId', '==', order.symbol)
    );
    const holdingSnap = await getDocs(holdingQuery);

    if (holdingSnap.empty) {
      // Create new holding
      if (order.side === 'buy') {
        await addDoc(holdingsRef, {
          portfolioId: portfolio.id,
          securityId: order.symbol,
          quantity: order.quantity,
          averagePrice: price,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } else {
        throw new Error('Cannot sell shares that are not owned');
      }
    } else {
      // Update existing holding
      const holding = holdingSnap.docs[0];
      const currentQuantity = holding.data().quantity;
      const newQuantity = currentQuantity + (order.quantity * (order.side === 'buy' ? 1 : -1));

      if (newQuantity < 0) {
        throw new Error('Cannot sell more shares than owned');
      }

      await updateDoc(doc(this.db, 'holdings', holding.id), {
        quantity: newQuantity,
        averagePrice: order.side === 'buy'
          ? ((currentQuantity * holding.data().averagePrice) + (order.quantity * price)) / (currentQuantity + order.quantity)
          : holding.data().averagePrice,
        updatedAt: Timestamp.now()
      });
    }

    // Update portfolio cash balance
    const amount = order.quantity * price * (order.side === 'buy' ? -1 : 1);
    await updateDoc(doc(this.db, 'portfolios', portfolio.id), {
      cashBalance: portfolio.cashBalance + amount,
      updatedAt: Timestamp.now()
    });

    // Record transaction
    await addDoc(collection(this.db, 'transactions'), {
      userId: user.uid,
      securityId: order.symbol,
      type: order.side,
      quantity: order.quantity,
      price: price,
      amount: Math.abs(amount),
      commission: Math.abs(amount) * 0.002, // 0.2% commission
      createdAt: Timestamp.now()
    });
  }

  private async sendOrderToDSE(order: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await fetch(`${process.env.DSE_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getCurrentUser().getIdToken()}`
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
        headers: {
          'Authorization': `Bearer ${await this.getCurrentUser().getIdToken()}`
        }
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
}

export const tradingService = new TradingService();