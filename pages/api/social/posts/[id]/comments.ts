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

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getComments(req, res, db, postId);
    case 'POST':
      return createComment(req, res, db, userId, postId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get comments for a post
 */
async function getComments(req: NextApiRequest, res: NextApiResponse, db: any, postId: string) {
  try {
    const { page = '0', limit = '20' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = pageNumber * limitNumber;

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments with author information
    const comments = await db.comment.findMany({
      where: { postId },
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalComments = await db.comment.count({
      where: { postId }
    });

    return res.status(200).json({
      comments,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalComments,
        pages: Math.ceil(totalComments / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

/**
 * Create a new comment on a post
 */
async function createComment(
  req: NextApiRequest, 
  res: NextApiResponse, 
  db: any, 
  userId: string, 
  postId: string
) {
  try {
    const { content } = req.body;

    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        content,
        post: {
          connect: { id: postId }
        },
        author: {
          connect: { id: userId }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
}
