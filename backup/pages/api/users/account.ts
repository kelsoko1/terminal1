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

  // GET: Fetch user account data
  if (req.method === 'GET') {
    try {
      // Fetch user from the database
      const user = await prismaRemote.user.findUnique({
        where: { id: userId as string },
      });
      
      // Extract only the fields we need
      const userData = user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        contactNumber: user.contactNumber,
        department: user.department,
        position: user.position
      } : null;
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's wallet balance
      const wallet = await prismaRemote.$queryRaw`
        SELECT SUM(amount) as balance 
        FROM "Transaction" 
        WHERE "userId" = ${userId}
      `;
      
      const balance = wallet[0]?.balance || 0;
      
      return res.status(200).json({
        user: {
          ...user,
          balance
        }
      });
    } catch (error) {
      console.error('Error fetching user account:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch user account',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // PATCH: Update user account data
  if (req.method === 'PATCH') {
    try {
      const { name, email, phone, department, position } = req.body;
      
      // Update user in the database
      const updatedUser = await prismaRemote.user.update({
        where: { id: userId as string },
        data: {
          name: name,
          email: email,
          contactNumber: phone,
          department: department,
          position: position,
          // Add any other fields you want to update
        }
      });
      
      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user account:', error);
      return res.status(500).json({ 
        error: 'Failed to update user account',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
