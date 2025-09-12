import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit as fsLimit, startAfter, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Helper function to format post data for response
async function formatPostResponse(post: any, user: any) {
  return {
    ...post,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    attachments: post.attachments || []
  };
}

export async function POST(request: NextRequest) {
  try {
    const db = getFirestore(app);
    const data = await request.json();
    // Validate required fields
    if (!data.content?.trim() || !data.userId?.trim()) {
      return NextResponse.json({ error: 'Content and userId are required' }, { status: 400 });
    }
    // Get user info
    const userRef = doc(db, 'users', data.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userSnap.data();
    // Create post in Firestore
    const newPostRef = await addDoc(collection(db, 'posts'), {
      userId: data.userId,
        content: data.content,
        visibility: data.visibility || 'PUBLIC',
      trade: data.trade || null,
      analysis: data.analysis || null,
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        likes: 0,
      shares: 0,
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const newPostSnap = await getDoc(newPostRef);
    const newPost = { id: newPostRef.id, ...newPostSnap.data() };
    const post = await formatPostResponse(newPost, { ...user, id: data.userId });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getFirestore(app);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    let lastVisible = null;
    // For basic pagination, use createdAt as cursor
    if (searchParams.get('lastCreatedAt')) {
      lastVisible = searchParams.get('lastCreatedAt');
    }
    let postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), fsLimit(limit));
    // TODO: Implement cursor-based pagination if needed
    const postsSnap = await getDocs(postsQuery);
    const posts: any[] = [];
    for (const docSnap of postsSnap.docs) {
      const postData = docSnap.data();
      // Fetch user info
      const userRef = doc(db, 'users', postData.userId);
      const userSnap = await getDoc(userRef);
      const user = userSnap.exists() ? { ...userSnap.data(), id: postData.userId } : { id: postData.userId, name: 'Unknown', email: '' };
      posts.push(await formatPostResponse({ id: docSnap.id, ...postData }, user));
    }
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        // Firestore does not provide total count efficiently; omit or estimate if needed
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
