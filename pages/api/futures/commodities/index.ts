import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../../lib/database/prismaClients';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET: Fetch commodity futures
  if (req.method === 'GET') {
    try {
      const { limit = 20, page = 1, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build filter conditions
      const where: any = {};
      if (status) {
        where.status = status;
      }
      
      // Fetch futures with pagination
      const [commodityFutures, count] = await Promise.all([
        prismaRemote.commodityFuture.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prismaRemote.commodityFuture.count({ where }),
      ]);
      
      return res.status(200).json({
        commodityFutures,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching commodity futures:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch commodity futures',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // POST: Create a new commodity future
  if (req.method === 'POST') {
    try {
      const { 
        name, symbol, baseAsset, contractSize, unit, 
        expiryMonth, expiryYear, price, initialMargin, 
        maintenanceMargin, status = 'ACTIVE' 
      } = req.body;
      
      // Validate required fields
      if (!name || !symbol || !baseAsset || !contractSize || !unit || 
          !expiryMonth || !expiryYear || !price || 
          !initialMargin || !maintenanceMargin) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if symbol already exists
      const existingFuture = await prismaRemote.commodityFuture.findUnique({
        where: { symbol },
      });
      
      if (existingFuture) {
        return res.status(409).json({ error: 'A future with this symbol already exists' });
      }
      
      // Create new commodity future
      const newFuture = await prismaRemote.commodityFuture.create({
        data: {
          name,
          symbol,
          baseAsset,
          contractSize: Number(contractSize),
          unit,
          expiryMonth,
          expiryYear: Number(expiryYear),
          price: Number(price),
          initialMargin: Number(initialMargin),
          maintenanceMargin: Number(maintenanceMargin),
          status: status as any,
        }
      });
      
      return res.status(201).json({ commodityFuture: newFuture });
    } catch (error) {
      console.error('Error creating commodity future:', error);
      return res.status(500).json({ 
        error: 'Failed to create commodity future',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT: Update an existing commodity future
  if (req.method === 'PUT') {
    try {
      const { id, price, change, openInterest, volume, status } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing future ID' });
      }
      
      // Check if future exists
      const existingFuture = await prismaRemote.commodityFuture.findUnique({
        where: { id },
      });
      
      if (!existingFuture) {
        return res.status(404).json({ error: 'Commodity future not found' });
      }
      
      // Update future
      const updatedFuture = await prismaRemote.commodityFuture.update({
        where: { id },
        data: {
          ...(price !== undefined && { price: Number(price) }),
          ...(change !== undefined && { change: Number(change) }),
          ...(openInterest !== undefined && { openInterest: Number(openInterest) }),
          ...(volume !== undefined && { volume: Number(volume) }),
          ...(status && { status: status as any }),
        }
      });
      
      return res.status(200).json({ commodityFuture: updatedFuture });
    } catch (error) {
      console.error('Error updating commodity future:', error);
      return res.status(500).json({ 
        error: 'Failed to update commodity future',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE: Remove a commodity future
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing future ID' });
      }
      
      // Check if future exists
      const existingFuture = await prismaRemote.commodityFuture.findUnique({
        where: { id },
      });
      
      if (!existingFuture) {
        return res.status(404).json({ error: 'Commodity future not found' });
      }
      
      // Delete future
      await prismaRemote.commodityFuture.delete({
        where: { id },
      });
      
      return res.status(200).json({ message: 'Commodity future deleted successfully' });
    } catch (error) {
      console.error('Error deleting commodity future:', error);
      return res.status(500).json({ 
        error: 'Failed to delete commodity future',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
