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

  // Only allow POST method for sharing
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

    // Create a share record
    const share = await db.share.create({
      data: {
        post: {
          connect: { id: postId }
        },
        user: {
          connect: { id: userId }
        }
      }
    });
    
    // Optionally create a new post that references the original post
    const { caption } = req.body;
    
    if (caption) {
      // Create a new post that shares the original post
      await db.post.create({
        data: {
          content: caption,
          author: {
            connect: { id: userId }
          },
          sharedPostId: postId,
          isShare: true
        }
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Post shared successfully' 
    });
  } catch (error) {
    console.error('Error sharing post:', error);
    return res.status(500).json({ error: 'Failed to share post' });
  }
}
