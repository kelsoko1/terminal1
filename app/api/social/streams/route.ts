import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    if (!data.title || !data.mediaType) {
      return NextResponse.json({ error: 'Title and mediaType are required' }, { status: 400 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create stream with Prisma
    const newStream = await prisma.stream.create({
      data: {
        userId,
        title: data.title,
        mediaType: data.mediaType,
        isLive: true,
        viewers: 0,
        mediaUrl: data.mediaUrl
      },
    });

    // Format response
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
    const skip = (page - 1) * limit;
    const isLive = searchParams.get('isLive') === 'true';

    // Build filter conditions
    let whereCondition: any = {};
    if (searchParams.has('isLive')) {
      whereCondition.isLive = isLive;
    }

    // Get total count for pagination
    const totalStreams = await prisma.stream.count({
      where: whereCondition
    });
    
    // Get streams with pagination using Prisma
    const streams = await prisma.stream.findMany({
      where: whereCondition,
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
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      streams,
      pagination: {
        total: totalStreams,
        page,
        limit,
        pages: Math.ceil(totalStreams / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}

// PUT endpoint to update a stream (e.g., end a stream)
export async function PUT(request: NextRequest) {
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
    if (!data.id) {
      return NextResponse.json({ error: 'Stream ID is required' }, { status: 400 });
    }

    // Find the stream
    const stream = await prisma.stream.findUnique({
      where: { id: data.id }
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Check if the user owns this stream
    if (stream.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized to update this stream' }, { status: 403 });
    }

    // Update the stream
    const updatedStream = await prisma.stream.update({
      where: { id: data.id },
      data: {
        isLive: data.isLive !== undefined ? data.isLive : stream.isLive,
        endTime: data.isLive === false ? new Date() : stream.endTime,
        viewers: data.viewers !== undefined ? data.viewers : stream.viewers,
        mediaUrl: data.mediaUrl || stream.mediaUrl,
        duration: data.duration || stream.duration,
        title: data.title || stream.title
      }
    });

    // Get user info for response
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Format response
    const formattedStream = formatStreamResponse(updatedStream, user);

    return NextResponse.json({ stream: formattedStream });
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 });
  }
}
