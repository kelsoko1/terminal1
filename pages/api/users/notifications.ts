import { NextApiRequest, NextApiResponse } from 'next';
import { prismaRemote } from '../../../lib/database/prismaClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // GET: Fetch user notifications
  if (req.method === 'GET') {
    try {
      // Fetch notifications using raw SQL since we don't have direct model access
      const notifications = await prismaRemote.$queryRaw`
        SELECT 
          id, 
          "userId", 
          type, 
          title, 
          message, 
          "isRead", 
          "createdAt"
        FROM "Notification"
        WHERE "userId" = ${userId as string}
        ORDER BY "createdAt" DESC
        LIMIT 20
      `;
      
      return res.status(200).json({
        notifications: Array.isArray(notifications) ? notifications : []
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch notifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // PATCH: Mark notifications as read
  if (req.method === 'PATCH') {
    try {
      const { notificationIds } = req.body;
      
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ error: 'Notification IDs are required' });
      }
      
      // Convert the array to a string for the SQL query
      const idList = notificationIds.map(id => `'${id}'`).join(',');
      
      // Update notifications using raw SQL
      // Since $executeRaw is not available, we'll use $queryRaw for the update
      await prismaRemote.$queryRaw`
        UPDATE "Notification"
        SET "isRead" = true
        WHERE id IN (${idList}) AND "userId" = ${userId as string}
      `;
      
      return res.status(200).json({ 
        success: true,
        message: 'Notifications marked as read'
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      return res.status(500).json({ 
        error: 'Failed to update notifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
