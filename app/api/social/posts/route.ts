import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to format post data for response
function formatPostResponse(post: any, user: any, attachments: any[] = []) {
  return {
    ...post,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    attachments
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    let userData;
    try {
      userData = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = userData.id;
    const data = await request.json();

    // Validate required fields
    if (!data.content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create post with Prisma
    const newPost = await prisma.post.create({
      data: {
        userId,
        content: data.content,
        visibility: data.visibility || 'PUBLIC',
        tradeSymbol: data.trade?.symbol,
        tradeType: data.trade?.type,
        tradePrice: data.trade?.price,
        analysisType: data.analysis?.type,
        analysisSummary: data.analysis?.summary,
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        likes: 0,
        shares: 0
      },
    });

    // Handle attachments if they exist
    let attachments = [];
    if (data.attachments && Array.isArray(data.attachments)) {
      const createdAttachments = await Promise.all(
        data.attachments.map((attachment: any) =>
          prisma.attachment.create({
            data: {
              postId: newPost.id,
              type: attachment.type,
              url: attachment.url,
              name: attachment.name,
              size: attachment.size,
            },
          })
        )
      );
      attachments = createdAttachments;
    }

    // Format response
    const post = formatPostResponse(newPost, user, attachments);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalPosts = await prisma.post.count();
    
    // Get posts with pagination using Prisma
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        attachments: true,
        comments: {
          include: {
            parent: true
          }
        }
      }
    });

    return NextResponse.json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
