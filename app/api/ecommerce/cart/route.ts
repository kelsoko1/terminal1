import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase/admin';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: any; // We'll enhance this type later
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

// GET /api/ecommerce/cart
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const db = getFirestore(app);
    
    // Get user's cart
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    
    // If cart doesn't exist, create it
    if (!cartSnap.exists()) {
      await setDoc(cartRef, {
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Get cart items
    const cartItemsRef = collection(db, 'cartItems');
    const cartItemsQuery = query(cartItemsRef, where('userId', '==', userId));
    const cartItemsSnap = await getDocs(cartItemsQuery);
    
    // Get products for cart items
    const cartItems = await Promise.all(cartItemsSnap.docs.map(async (itemDoc) => {
      const itemData = itemDoc.data();
      const productRef = doc(db, 'products', itemData.productId);
      const productSnap = await getDoc(productRef);
      const productData = productSnap.data();
      
      return {
        id: itemDoc.id,
        quantity: itemData.quantity,
        product: {
          id: productSnap.id,
          ...productData,
          primaryImage: productData?.images?.[0] || null,
          category: itemData.categoryId ? {
            id: itemData.categoryId,
            name: itemData.categoryName
          } : null
        },
        subtotal: itemData.quantity * (productData?.price - (productData?.discount || 0))
      };
    }));
    
    const cartTotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
    
    return NextResponse.json({
      cart: {
        id: userId,
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
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
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
    
    const db = getFirestore(app);
    
    // Check if product exists and is active
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists() || !productSnap.data()?.isActive) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }
    
    const productData = productSnap.data();
    
    // Check if quantity is available in inventory
    if (productData.inventory < quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory' },
        { status: 400 }
      );
    }
    
    // Ensure cart exists
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    
    if (!cartSnap.exists()) {
      await setDoc(cartRef, {
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Check if item already exists in cart
    const cartItemsRef = collection(db, 'cartItems');
    const existingItemQuery = query(
      cartItemsRef,
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const existingItemSnap = await getDocs(existingItemQuery);
    
    if (!existingItemSnap.empty) {
      // Update existing item quantity
      const existingItem = existingItemSnap.docs[0];
      const currentQuantity = existingItem.data().quantity;
      
      await updateDoc(doc(db, 'cartItems', existingItem.id), {
        quantity: currentQuantity + quantity,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Add new item to cart
      await addDoc(collection(db, 'cartItems'), {
        userId,
        productId,
        quantity,
        categoryId: productData.categoryId,
        categoryName: productData.categoryName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');
    
    if (itemId) {
      const db = getFirestore(app);
      
      // TODO: Implement item deletion logic for Firebase
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500 }
    );
  }
}
