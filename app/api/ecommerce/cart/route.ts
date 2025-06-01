import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/ecommerce/cart
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find user's cart or create if it doesn't exist
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                },
                category: true
              }
            }
          }
        }
      }
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
          items: {}
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1
                  },
                  category: true
                }
              }
            }
          }
        }
      });
    }
    
    // Calculate cart totals
    const cartItems = cart.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        primaryImage: item.product.images[0]?.url || null,
        images: undefined
      },
      subtotal: item.quantity * (item.product.price - (item.product.discount || 0))
    }));
    
    const cartTotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
    
    return NextResponse.json({
      cart: {
        id: cart.id,
        items: cartItems,
        total: cartTotal,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/ecommerce/cart
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await req.json();
    const { productId, quantity } = data;
    
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid product or quantity' },
        { status: 400 }
      );
    }
    
    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }
    
    // Check if quantity is available in inventory
    if (product.inventory < quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory' },
        { status: 400 }
      );
    }
    
    // Find or create user's cart
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id }
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id }
      });
    }
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    });
    
    if (existingItem) {
      // Update existing item quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Add new item to cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/ecommerce/cart
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');
    
    if (itemId) {
      // Remove specific item from cart
      await prisma.cartItem.deleteMany({
        where: {
          id: itemId,
          cart: {
            userId: session.user.id
          }
        }
      });
    } else {
      // Clear entire cart
      const cart = await prisma.cart.findFirst({
        where: { userId: session.user.id }
      });
      
      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
