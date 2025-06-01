import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../../lib/database/prismaClients';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET: Fetch FX futures
  if (req.method === 'GET') {
    try {
      const { limit = 20, page = 1, baseCurrency, quoteCurrency } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build filter conditions
      const where: any = {};
      if (baseCurrency) {
        where.baseCurrency = baseCurrency;
      }
      if (quoteCurrency) {
        where.quoteCurrency = quoteCurrency;
      }
      
      // Fetch futures with pagination
      const [fxFutures, count] = await Promise.all([
        prismaRemote.fxFuture.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            expiryDates: true,
          },
        }),
        prismaRemote.fxFuture.count({ where }),
      ]);
      
      return res.status(200).json({
        fxFutures,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching FX futures:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch FX futures',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // POST: Create a new FX future
  if (req.method === 'POST') {
    try {
      const { name, baseCurrency, quoteCurrency, minAmount, tickSize = 0.0001, expiryDates } = req.body;
      
      // Validate required fields
      if (!name || !baseCurrency || !quoteCurrency || !minAmount || !expiryDates || !expiryDates.length) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if a similar FX future already exists
      const existingFuture = await prismaRemote.fxFuture.findFirst({
        where: {
          baseCurrency,
          quoteCurrency,
        },
      });
      
      if (existingFuture) {
        return res.status(409).json({ error: 'An FX future with this currency pair already exists' });
      }
      
      // Create new FX future with expiry dates
      const newFuture = await prismaRemote.fxFuture.create({
        data: {
          name,
          baseCurrency,
          quoteCurrency,
          minAmount: Number(minAmount),
          tickSize: Number(tickSize),
          expiryDates: {
            create: expiryDates.map((expiry: any) => ({
              date: new Date(expiry.date),
              displayName: expiry.displayName,
              spotPrice: Number(expiry.spotPrice),
              futurePremium: Number(expiry.futurePremium),
              openInterest: Number(expiry.openInterest || 0),
              volume: Number(expiry.volume || 0),
            })),
          },
        },
        include: {
          expiryDates: true,
        },
      });
      
      return res.status(201).json({ fxFuture: newFuture });
    } catch (error) {
      console.error('Error creating FX future:', error);
      return res.status(500).json({ 
        error: 'Failed to create FX future',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT: Update an existing FX future
  if (req.method === 'PUT') {
    try {
      const { id, name, minAmount } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing future ID' });
      }
      
      // Check if future exists
      const existingFuture = await prismaRemote.fxFuture.findUnique({
        where: { id },
      });
      
      if (!existingFuture) {
        return res.status(404).json({ error: 'FX future not found' });
      }
      
      // Update future
      const updatedFuture = await prismaRemote.fxFuture.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(minAmount !== undefined && { minAmount: Number(minAmount) }),
        },
        include: {
          expiryDates: true,
        },
      });
      
      return res.status(200).json({ fxFuture: updatedFuture });
    } catch (error) {
      console.error('Error updating FX future:', error);
      return res.status(500).json({ 
        error: 'Failed to update FX future',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE: Remove an FX future
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing future ID' });
      }
      
      // Check if future exists
      const existingFuture = await prismaRemote.fxFuture.findUnique({
        where: { id },
      });
      
      if (!existingFuture) {
        return res.status(404).json({ error: 'FX future not found' });
      }
      
      // Delete future (cascade will delete expiry dates)
      await prismaRemote.fxFuture.delete({
        where: { id },
      });
      
      return res.status(200).json({ message: 'FX future deleted successfully' });
    } catch (error) {
      console.error('Error deleting FX future:', error);
      return res.status(500).json({ 
        error: 'Failed to delete FX future',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
