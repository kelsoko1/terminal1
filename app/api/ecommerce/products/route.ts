import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit as fsLimit, startAfter } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// GET /api/ecommerce/products
export async function GET(req: NextRequest) {
  try {
    const db = getFirestore(app);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const categoryId = url.searchParams.get('categoryId');
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';
    let productsQuery = collection(db, 'products');
    let q = query(productsQuery, orderBy(sort, order === 'desc' ? 'desc' : 'asc'), fsLimit(limit));
    // Filtering by category
    if (categoryId) {
      q = query(productsQuery, where('categoryId', '==', categoryId), orderBy(sort, order === 'desc' ? 'desc' : 'asc'), fsLimit(limit));
    }
    // Fetch products
    const productsSnap = await getDocs(q);
    let products = productsSnap.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) }));
    // Search filter (client-side, for demo; for large data, use Algolia or Firestore text search)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    // Add primaryImage field
    products = products.map(product => ({
      ...product,
      primaryImage: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null
    }));
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        // Firestore does not provide total count efficiently; omit or estimate if needed
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/ecommerce/products
export async function POST(req: NextRequest) {
  try {
    const db = getFirestore(app);
    const data = await req.json();
    const { name, description, price, categoryId, inventory, images, discount } = data;
    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    // Create product in Firestore
    const productRef = await addDoc(collection(db, 'products'), {
        name,
        description,
        price: parseFloat(price),
        inventory: inventory || 0,
        discount: discount ? parseFloat(discount) : 0,
        categoryId,
      images: images || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    });
    const product = { id: productRef.id, name, description, price: parseFloat(price), inventory: inventory || 0, discount: discount ? parseFloat(discount) : 0, categoryId, images: images || [], isActive: true };
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
