import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/prisma';
import { getDatabase } from '@/lib/database/localDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is authenticated
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;
  const db = await getDatabase();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getPosts(req, res, db, userId);
    case 'POST':
      return createPost(req, res, db, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get posts with pagination
 */
async function getPosts(req: NextApiRequest, res: NextApiResponse, db: any, userId: string) {
  try {
    const { page = '0', limit = '10', filter } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = pageNumber * limitNumber;

    // Build query conditions
    let where: any = {};
    
    // Apply filters if provided
    if (filter === 'following') {
      // Get users that the current user follows
      const following = await db.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      });
      
      where.authorId = {
        in: following.map((f: any) => f.followingId)
      };
    } else if (filter === 'trending') {
      // Sort by likes and comments count for trending
      // This is handled in the orderBy below
    }

    // Query posts with author and engagement metrics
    const posts = await db.post.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: filter === 'trending' 
        ? { likes: { _count: 'desc' } } 
        : { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        },
        // Check if current user has liked the post
        likes: {
          where: {
            userId
          },
          select: {
            id: true
          }
        }
      }
    });

    // Transform posts for client consumption
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      content: post.content,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      createdAt: post.createdAt,
      author: post.author,
      stats: {
        likes: post._count.likes,
        comments: post._count.comments,
        shares: post._count.shares
      },
      isLiked: post.likes.length > 0,
      tags: post.tags || []
    }));

    // Get total count for pagination
    const totalPosts = await db.post.count({ where });

    return res.status(200).json({
      posts: formattedPosts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

/**
 * Create a new post
 */
async function createPost(req: NextApiRequest, res: NextApiResponse, db: any, userId: string) {
  try {
    const { content, mediaUrl, mediaType, tags = [] } = req.body;

    // Validate required fields
    if (!content && !mediaUrl) {
      return res.status(400).json({ error: 'Post must have content or media' });
    }

    // Create post using Prisma
    const post = await db.post.create({
      data: {
        content,
        mediaUrl,
        mediaType,
        tags,
        author: {
          connect: { id: userId }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
}
