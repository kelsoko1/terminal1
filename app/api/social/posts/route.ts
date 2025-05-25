import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Initialize posts table if it doesn't exist
if (!global.tables) {
  global.tables = {};
}

if (!global.tables.posts) {
  global.tables.posts = [];
}

if (!global.tables.post_attachments) {
  global.tables.post_attachments = [];
}

if (!global.tables.post_comments) {
  global.tables.post_comments = [];
}

// Generate ID helper
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
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
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userResult.rows[0];

    // Create post
    const postId = generateId();
    const now = new Date().toISOString();
    
    const newPost = {
      id: postId,
      userId,
      content: data.content,
      visibility: data.visibility || 'PUBLIC',
      tradeSymbol: data.trade?.symbol || null,
      tradeType: data.trade?.type || null,
      tradePrice: data.trade?.price || null,
      analysisType: data.analysis?.type || null,
      analysisSummary: data.analysis?.summary || null,
      hashtags: data.hashtags || [],
      mentions: data.mentions || [],
      likes: 0,
      shares: 0,
      createdAt: now,
      updatedAt: now
    };

    // Add post to posts table
    global.tables.posts.push(newPost);

    // Handle attachments if they exist
    const attachments = [];
    if (data.attachments && Array.isArray(data.attachments)) {
      for (const attachment of data.attachments) {
        const newAttachment = {
          id: generateId(),
          postId,
          type: attachment.type,
          url: attachment.url,
          name: attachment.name,
          size: attachment.size,
          createdAt: now
        };
        global.tables.post_attachments.push(newAttachment);
        attachments.push(newAttachment);
      }
    }

    // Format response
    const post = {
      ...newPost,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      attachments
    };

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

    // Get all posts
    const allPosts = global.tables.posts || [];
    
    // Sort by createdAt in descending order
    const sortedPosts = [...allPosts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply pagination
    const paginatedPosts = sortedPosts.slice(skip, skip + limit);
    
    // Fetch user details and attachments for each post
    const postsWithDetails = await Promise.all(paginatedPosts.map(async (post) => {
      // Get user info
      const userResult = await db.query('SELECT id, name, email FROM users WHERE id = $1', [post.userId]);
      const user = userResult.rows[0] || { id: post.userId, name: 'Unknown User', email: '' };
      
      // Get attachments
      const attachments = (global.tables.post_attachments || [])
        .filter(att => att.postId === post.id);
      
      // Get comments
      const comments = (global.tables.post_comments || [])
        .filter(comment => comment.postId === post.id);
      
      return {
        ...post,
        user,
        attachments,
        comments
      };
    }));

    return NextResponse.json({
      posts: postsWithDetails,
      pagination: {
        total: allPosts.length,
        page,
        limit,
        pages: Math.ceil(allPosts.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
