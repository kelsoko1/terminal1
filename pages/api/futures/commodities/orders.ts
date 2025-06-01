import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../../lib/database/prismaClients';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found in session' });
  }

  // GET: Fetch orders
  if (req.method === 'GET') {
    try {
      const { futureId, status, limit = 20, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build filter conditions
      const where: any = { userId };
      if (futureId) {
        where.futureId = futureId;
      }
      if (status) {
        where.status = status;
      }
      
      // Fetch orders with pagination
      const [orders, count] = await Promise.all([
        prismaRemote.futureOrder.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { timestamp: 'desc' },
          include: {
            future: true,
          },
        }),
        prismaRemote.futureOrder.count({ where }),
      ]);
      
      return res.status(200).json({
        orders,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // POST: Create a new order
  if (req.method === 'POST') {
    try {
      const { futureId, side, price, quantity } = req.body;
      
      // Validate required fields
      if (!futureId || !side || !price || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if future exists
      const future = await prismaRemote.commodityFuture.findUnique({
        where: { id: futureId },
      });
      
      if (!future) {
        return res.status(404).json({ error: 'Commodity future not found' });
      }
      
      // Create new order
      const newOrder = await prismaRemote.futureOrder.create({
        data: {
          userId,
          futureId,
          side,
          price: Number(price),
          quantity: Number(quantity),
          status: 'PENDING',
          filledQuantity: 0,
        },
        include: {
          future: true,
        },
      });
      
      // Process the order through the matching engine
      // This would typically be done asynchronously or via a queue
      await processOrder(newOrder);
      
      return res.status(201).json({ order: newOrder });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT: Update an existing order (e.g., cancel)
  if (req.method === 'PUT') {
    try {
      const { id, status } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if order exists and belongs to user
      const order = await prismaRemote.futureOrder.findFirst({
        where: { 
          id,
          userId,
        },
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found or not owned by user' });
      }
      
      // Only allow cancellation if order is still pending
      if (order.status !== 'PENDING' && status === 'CANCELLED') {
        return res.status(400).json({ error: 'Can only cancel pending orders' });
      }
      
      // Update order
      const updatedOrder = await prismaRemote.futureOrder.update({
        where: { id },
        data: { status },
        include: {
          future: true,
        },
      });
      
      return res.status(200).json({ order: updatedOrder });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({ 
        error: 'Failed to update order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

// Order processing function (matching engine)
async function processOrder(order: any) {
  try {
    // Find matching orders (opposite side, same future, price matches)
    const matchingOrders = await prismaRemote.futureOrder.findMany({
      where: {
        futureId: order.futureId,
        side: order.side === 'BUY' ? 'SELL' : 'BUY',
        status: 'PENDING',
        ...(order.side === 'BUY' 
          ? { price: { lte: order.price } } // For buy orders, find sell orders with price <= buy price
          : { price: { gte: order.price } }) // For sell orders, find buy orders with price >= sell price
      },
      orderBy: [
        { price: order.side === 'BUY' ? 'asc' : 'desc' }, // Price priority
        { timestamp: 'asc' } // Time priority
      ],
    });

    let remainingQuantity = order.quantity;
    let updatedOrder = order;

    // Match with existing orders
    for (const matchingOrder of matchingOrders) {
      if (remainingQuantity <= 0) break;

      const matchQuantity = Math.min(remainingQuantity, matchingOrder.quantity - matchingOrder.filledQuantity);
      if (matchQuantity <= 0) continue;

      // Create trade record
      const tradePrice = matchingOrder.price; // Use the price of the resting order
      await prismaRemote.futureTrade.create({
        data: {
          futureId: order.futureId,
          price: tradePrice,
          quantity: matchQuantity,
          buyerOrderId: order.side === 'BUY' ? order.id : matchingOrder.id,
          sellerOrderId: order.side === 'SELL' ? order.id : matchingOrder.id,
        }
      });

      // Update matching order
      const updatedFilledQuantity = matchingOrder.filledQuantity + matchQuantity;
      const updatedStatus = updatedFilledQuantity >= matchingOrder.quantity ? 'COMPLETED' : 'PARTIALLY_FILLED';
      
      await prismaRemote.futureOrder.update({
        where: { id: matchingOrder.id },
        data: {
          filledQuantity: updatedFilledQuantity,
          status: updatedStatus,
        }
      });

      // Update remaining quantity
      remainingQuantity -= matchQuantity;
    }

    // Update the original order
    const orderFilledQuantity = order.quantity - remainingQuantity;
    let orderStatus = 'PENDING';
    if (orderFilledQuantity >= order.quantity) {
      orderStatus = 'COMPLETED';
    } else if (orderFilledQuantity > 0) {
      orderStatus = 'PARTIALLY_FILLED';
    }

    updatedOrder = await prismaRemote.futureOrder.update({
      where: { id: order.id },
      data: {
        filledQuantity: orderFilledQuantity,
        status: orderStatus,
      }
    });

    // Update the future's price and volume
    if (orderFilledQuantity > 0) {
      await prismaRemote.commodityFuture.update({
        where: { id: order.futureId },
        data: {
          price: order.price, // Last traded price
          volume: { increment: orderFilledQuantity },
        }
      });
    }

    return updatedOrder;
  } catch (error) {
    console.error('Error processing order:', error);
    throw error;
  }
}
