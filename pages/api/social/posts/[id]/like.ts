import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getDatabase } from '@/lib/database/localDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is authenticated
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;
  const postId = req.query.id as string;
  const db = await getDatabase();

  // Only allow POST method for toggling likes
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already liked the post
    const existingLike = await db.like.findFirst({
      where: {
        postId,
        userId
      }
    });

    let result;
    
    if (existingLike) {
      // Unlike: Remove the like if it exists
      result = await db.like.delete({
        where: { id: existingLike.id }
      });
      
      return res.status(200).json({ 
        liked: false,
        message: 'Post unliked successfully' 
      });
    } else {
      // Like: Create a new like
      result = await db.like.create({
        data: {
          post: {
            connect: { id: postId }
          },
          user: {
            connect: { id: userId }
          }
        }
      });
      
      return res.status(200).json({ 
        liked: true,
        message: 'Post liked successfully' 
      });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    return res.status(500).json({ error: 'Failed to process like action' });
  }
}
