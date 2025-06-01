import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../../lib/database/prismaClients';
import { getSession } from 'next-auth/react';

interface ExtendedSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession({ req }) as ExtendedSession;
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET: Fetch expiry dates
  if (req.method === 'GET') {
    try {
      const { fxFutureId } = req.query;
      
      if (!fxFutureId) {
        return res.status(400).json({ error: 'Missing fxFutureId parameter' });
      }
      
      // Fetch expiry dates for the specified FX future
      const expiryDates = await prismaRemote.fxExpiryDate.findMany({
        where: { fxFutureId: fxFutureId as string },
        orderBy: { date: 'asc' },
        include: {
          fxFuture: true,
        },
      });
      
      return res.status(200).json({ expiryDates });
    } catch (error) {
      console.error('Error fetching expiry dates:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch expiry dates',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // POST: Create a new expiry date
  if (req.method === 'POST') {
    // Check if user has admin role
    const userId = session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }
    
    const user = await prismaRemote.user.findUnique({
      where: { id: userId }
    });
    
    if (user?.role !== 'ADMIN' && user?.role !== 'BROKER') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    try {
      const { fxFutureId, date, displayName, spotPrice, futurePremium } = req.body;
      
      // Validate required fields
      if (!fxFutureId || !date || !displayName || !spotPrice || futurePremium === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if FX future exists
      const fxFuture = await prismaRemote.fxFuture.findUnique({
        where: { id: fxFutureId },
      });
      
      if (!fxFuture) {
        return res.status(404).json({ error: 'FX future not found' });
      }
      
      // Check if expiry date already exists
      const existingExpiryDate = await prismaRemote.fxExpiryDate.findFirst({
        where: {
          fxFutureId,
          date: new Date(date),
        },
      });
      
      if (existingExpiryDate) {
        return res.status(409).json({ error: 'An expiry date with this date already exists for this FX future' });
      }
      
      // Create new expiry date
      const newExpiryDate = await prismaRemote.fxExpiryDate.create({
        data: {
          fxFutureId,
          date: new Date(date),
          displayName,
          spotPrice: Number(spotPrice),
          futurePremium: Number(futurePremium),
          openInterest: 0,
          volume: 0,
        },
        include: {
          fxFuture: true,
        },
      });
      
      return res.status(201).json({ expiryDate: newExpiryDate });
    } catch (error) {
      console.error('Error creating expiry date:', error);
      return res.status(500).json({ 
        error: 'Failed to create expiry date',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT: Update an existing expiry date
  if (req.method === 'PUT') {
    // Check if user has admin role
    const userId = session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }
    
    const user = await prismaRemote.user.findUnique({
      where: { id: userId }
    });
    
    if (user?.role !== 'ADMIN' && user?.role !== 'BROKER') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    try {
      const { id, displayName, spotPrice, futurePremium } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing expiry date ID' });
      }
      
      // Check if expiry date exists
      const existingExpiryDate = await prismaRemote.fxExpiryDate.findUnique({
        where: { id },
      });
      
      if (!existingExpiryDate) {
        return res.status(404).json({ error: 'Expiry date not found' });
      }
      
      // Update expiry date
      const updatedExpiryDate = await prismaRemote.fxExpiryDate.update({
        where: { id },
        data: {
          ...(displayName && { displayName }),
          ...(spotPrice !== undefined && { spotPrice: Number(spotPrice) }),
          ...(futurePremium !== undefined && { futurePremium: Number(futurePremium) }),
        },
        include: {
          fxFuture: true,
        },
      });
      
      return res.status(200).json({ expiryDate: updatedExpiryDate });
    } catch (error) {
      console.error('Error updating expiry date:', error);
      return res.status(500).json({ 
        error: 'Failed to update expiry date',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE: Remove an expiry date
  if (req.method === 'DELETE') {
    // Check if user has admin role
    const userId = session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }
    
    const user = await prismaRemote.user.findUnique({
      where: { id: userId }
    });
    
    if (user?.role !== 'ADMIN' && user?.role !== 'BROKER') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing expiry date ID' });
      }
      
      // Check if expiry date exists
      const existingExpiryDate = await prismaRemote.fxExpiryDate.findUnique({
        where: { id },
      });
      
      if (!existingExpiryDate) {
        return res.status(404).json({ error: 'Expiry date not found' });
      }
      
      // Check if there are any orders for this expiry date
      const orderCount = await prismaRemote.fxFutureOrder.count({
        where: { expiryDateId: id },
      });
      
      if (orderCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete expiry date with existing orders',
          orderCount
        });
      }
      
      // Delete expiry date
      await prismaRemote.fxExpiryDate.delete({
        where: { id },
      });
      
      return res.status(200).json({ message: 'Expiry date deleted successfully' });
    } catch (error) {
      console.error('Error deleting expiry date:', error);
      return res.status(500).json({ 
        error: 'Failed to delete expiry date',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
