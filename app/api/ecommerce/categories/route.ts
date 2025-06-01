import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/ecommerce/categories
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parentId = url.searchParams.get('parentId');
    const includeProducts = url.searchParams.get('includeProducts') === 'true';
    
    // Build filter conditions
    const where: any = {};
    if (parentId) {
      where.parentId = parentId;
    } else {
      // If no parentId is specified, get top-level categories
      where.parentId = null;
    }
    
    // Get categories
    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { products: true }
            }
          }
        },
        products: includeProducts ? {
          where: { isActive: true },
          take: 5,
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        } : false,
        _count: {
          select: { products: true }
        }
      }
    });
    
    return NextResponse.json({
      categories: categories.map(category => ({
        ...category,
        productCount: category._count.products,
        products: includeProducts ? category.products.map(product => ({
          ...product,
          primaryImage: product.images[0]?.url || null
        })) : undefined,
        _count: undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/ecommerce/categories
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (user?.role !== 'ADMIN' && user?.role !== 'KELSOKO_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const data = await req.json();
    const { name, description, parentId } = data;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId: parentId || null
      }
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
