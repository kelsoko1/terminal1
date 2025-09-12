import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  images?: string[];
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  primaryImage?: string | null;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  children?: Category[];
  products?: Product[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// GET /api/ecommerce/categories
export async function GET(req: NextRequest) {
  try {
    const db = getFirestore(app);
    const url = new URL(req.url);
    const parentId = url.searchParams.get('parentId');
    const includeProducts = url.searchParams.get('includeProducts') === 'true';
    
    // Build query
    const categoriesRef = collection(db, 'categories');
    let q = query(categoriesRef);
    if (parentId) {
      q = query(categoriesRef, where('parentId', '==', parentId));
    } else {
      q = query(categoriesRef, where('parentId', '==', null));
    }
    
    // Get categories
    const categoriesSnap = await getDocs(q);
    const categories = await Promise.all(categoriesSnap.docs.map(async (docSnap) => {
      const categoryData = docSnap.data();
      
      // Get child categories
      const childrenSnap = await getDocs(
        query(categoriesRef, where('parentId', '==', docSnap.id))
      );
      const children = childrenSnap.docs.map(childSnap => ({
        id: childSnap.id,
        ...childSnap.data()
      }));
      
      // Get products if requested
      let products: Product[] = [];
      if (includeProducts) {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(
          query(productsRef, 
            where('categoryId', '==', docSnap.id),
            where('isActive', '==', true)
          )
        );
        products = productsSnap.docs.map(productSnap => {
          const data = productSnap.data();
          return {
            id: productSnap.id,
            name: data.name,
            description: data.description,
            price: data.price,
            discount: data.discount,
            images: data.images,
            isActive: data.isActive,
            categoryId: data.categoryId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            primaryImage: data.images?.[0] || null
          };
        });
        products = products.slice(0, 5); // Take first 5 products
      }
      
      return {
        id: docSnap.id,
        ...categoryData,
        children,
        products: includeProducts ? products : undefined,
        productCount: products.length
      };
    }));
    
    return NextResponse.json({ categories });
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
    
    const db = getFirestore(app);
    
    // Check if user has admin permissions
    const userRef = doc(db, 'users', session.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    if (userData?.role !== 'ADMIN' && userData?.role !== 'KELSOKO_ADMIN') {
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
    
    // If parentId is provided, verify it exists
    if (parentId) {
      const parentRef = doc(db, 'categories', parentId);
      const parentSnap = await getDoc(parentRef);
      if (!parentSnap.exists()) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 }
        );
      }
    }
    
    // Create category
    const categoryRef = await addDoc(collection(db, 'categories'), {
        name,
        description,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const category = {
      id: categoryRef.id,
      name,
      description,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
