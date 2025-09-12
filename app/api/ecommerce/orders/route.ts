import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase/admin';

// Define a type for the order object to ensure type safety
interface Order {
  id: string;
  createdAt: any; // Using 'any' to be flexible with Firestore's timestamp format
  [key: string]: any; // Allow other properties
}

// Define a type for the cart item object
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  [key: string]: any; // Allow other properties
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

// GET /api/ecommerce/orders
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const db = getFirestore(app);
    // Build filter conditions
    let ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
    if (status) {
      ordersQuery = query(ordersQuery, where('status', '==', status));
    }
    // TODO: Add pagination to Firestore query if needed
    const ordersSnap = await getDocs(ordersQuery);
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
    // TODO: Implement pagination (Firestore does not support offset/skip natively)
    const pagedOrders = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice((page - 1) * limit, page * limit);
    const total = orders.length;
    // TODO: Populate items and product details as needed
    return NextResponse.json({
      orders: pagedOrders,
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
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const data = await req.json();
    const { shippingAddress, billingAddress, paymentMethod, paymentId } = data;
    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }
    const db = getFirestore(app);
    // Get user's cart
    const cartSnap = await getDocs(query(collection(db, 'cartItems'), where('userId', '==', userId)));
        const cartItems = cartSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CartItem[];
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    // Calculate order total
    let total = 0;
    const orderItems = await Promise.all(cartItems.map(async item => {
      const productRef = doc(db, 'products', item.productId);
      const productSnap = await getDoc(productRef);
      const product = productSnap.data();
      if (!product) throw new Error('Product not found');
      const price = product.price;
      const discount = product.discount || 0;
      const finalPrice = price - discount;
      total += finalPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        discount
      };
    }));
    // Check inventory for all items
    for (const item of cartItems) {
      const productRef = doc(db, 'products', item.productId);
      const productSnap = await getDoc(productRef);
      const product = productSnap.data();
      if (!product || product.inventory < item.quantity) {
        return NextResponse.json(
          {
            error: 'Insufficient inventory',
            product: product?.name,
            available: product?.inventory,
            requested: item.quantity
          },
          { status: 400 }
        );
      }
    }
    // Create order
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId,
      total,
      status: 'PENDING',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentId,
      items: orderItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    // Update product inventory
    for (const item of cartItems) {
      const productRef = doc(db, 'products', item.productId);
      await updateDoc(productRef, {
        inventory: (await getDoc(productRef)).data()?.inventory - item.quantity
      });
    }
    // Clear the cart
    for (const item of cartItems) {
      await deleteDoc(doc(db, 'cartItems', item.id));
    }
    const orderSnap = await getDoc(orderRef);
    return NextResponse.json({ id: orderRef.id, ...orderSnap.data() }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
