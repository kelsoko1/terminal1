import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase/admin';

// Interface describing expected stream structure
interface StreamData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  mediaType?: string;
  isLive?: boolean;
  viewers?: number;
  mediaUrl?: string;
  endTime?: string;
  duration?: number;
  // Allow additional dynamic fields
  [key: string]: any;
}


// Helper to get user from Firebase Auth
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.replace('Bearer ', '');
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

// Helper function to format stream data for response
function formatStreamResponse(stream: any, user: any) {
  return {
    ...stream,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.json();
    if (!data.title || !data.mediaType) {
      return NextResponse.json({ error: 'Title and mediaType are required' }, { status: 400 });
    }
    const db = getFirestore(app);
    // Get user info
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = { id: userSnap.id, ...userSnap.data() };
    // Create stream
    const newStreamRef = await addDoc(collection(db, 'streams'), {
      userId,
      title: data.title,
      mediaType: data.mediaType,
      isLive: true,
      viewers: 0,
      mediaUrl: data.mediaUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const newStreamSnap = await getDoc(newStreamRef);
    const newStream = { id: newStreamRef.id, ...newStreamSnap.data() } as StreamData;
    const stream = formatStreamResponse(newStream, user);
    return NextResponse.json({ stream }, { status: 201 });
  } catch (error) {
    console.error('Error creating stream:', error);
    return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isLive = searchParams.get('isLive') === 'true';
    const db = getFirestore(app);
    // Build filter conditions
    let streamsQuery = collection(db, 'streams');
    let q = query(streamsQuery);
    if (searchParams.has('isLive')) {
      q = query(q, where('isLive', '==', isLive));
    }
    const streamsSnap = await getDocs(q);
    let streams = streamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StreamData[];
    // TODO: Implement pagination (Firestore does not support offset/skip natively)
    streams = streams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice((page - 1) * limit, page * limit);
    // Populate user info for each stream
    const usersMap: Record<string, any> = {};
    for (const stream of streams) {
      if (!usersMap[stream.userId]) {
        const userSnap = await getDoc(doc(db, 'users', stream.userId));
        usersMap[stream.userId] = userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
      }
    }
    const formattedStreams = streams.map(stream => formatStreamResponse(stream, usersMap[stream.userId]));
    return NextResponse.json({
      streams: formattedStreams,
      pagination: {
        total: streams.length,
        page,
        limit,
        pages: Math.ceil(streams.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Stream ID is required' }, { status: 400 });
    }
    const db = getFirestore(app);
    // Find the stream
    const streamRef = doc(db, 'streams', data.id);
    const streamSnap = await getDoc(streamRef);
    if (!streamSnap.exists()) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }
    const stream = { id: streamSnap.id, ...streamSnap.data() } as StreamData;
    // Check if the user owns this stream
    if (stream.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized to update this stream' }, { status: 403 });
    }
    // Update the stream
    await updateDoc(streamRef, {
      isLive: data.isLive !== undefined ? data.isLive : stream.isLive,
      endTime: data.isLive === false ? new Date().toISOString() : stream.endTime,
      viewers: data.viewers !== undefined ? data.viewers : stream.viewers,
      mediaUrl: data.mediaUrl || stream.mediaUrl,
      duration: data.duration || stream.duration,
      title: data.title || stream.title,
      updatedAt: new Date().toISOString()
    });
    // Get updated stream
    const updatedStreamSnap = await getDoc(streamRef);
    const updatedStream = { id: updatedStreamSnap.id, ...updatedStreamSnap.data() } as StreamData;
    // Get user info for response
    const userSnap = await getDoc(doc(db, 'users', userId));
    const user = userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
    const formattedStream = formatStreamResponse(updatedStream, user);
    return NextResponse.json({ stream: formattedStream });
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 });
  }
}
