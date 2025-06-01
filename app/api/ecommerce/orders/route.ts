import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/ecommerce/orders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    // Build filter conditions
    const where: any = { userId: session.user.id };
    if (status) where.status = status;
    
    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Get total count for pagination
    const total = await prisma.order.count({ where });
    
    // Format response
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          primaryImage: item.product.images[0]?.url || null,
          images: undefined
        }
      }))
    }));
    
    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/ecommerce/orders
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
    const { shippingAddress, billingAddress, paymentMethod, paymentId } = data;
    
    // Validate required fields
    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }
    
    // Get user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    // Calculate order total
    let total = 0;
    const orderItems = cart.items.map(item => {
      const price = item.product.price;
      const discount = item.product.discount || 0;
      const finalPrice = price - discount;
      total += finalPrice * item.quantity;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: price,
        discount: discount
      };
    });
    
    // Check inventory for all items
    for (const item of cart.items) {
      if (item.product.inventory < item.quantity) {
        return NextResponse.json(
          { 
            error: 'Insufficient inventory', 
            product: item.product.name,
            available: item.product.inventory,
            requested: item.quantity
          },
          { status: 400 }
        );
      }
    }
    
    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          status: 'PENDING',
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          paymentMethod,
          paymentId,
          items: {
            create: orderItems
          }
        },
        include: {
          items: true
        }
      });
      
      // Update product inventory
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity
            }
          }
        });
      }
      
      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
      
      return newOrder;
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
