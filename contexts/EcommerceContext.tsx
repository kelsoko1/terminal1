'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Product type
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'draft' | 'out-of-stock';
  image?: string;
  sales: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Order type
export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  products?: Product[];
}

// Shop type
export interface Shop {
  id: string;
  name: string;
  description: string;
  owner: string;
  logo?: string;
  banner?: string;
  followers: number;
  productsCount: number;
  rating: number;
}

// Store settings type
export interface StoreSettings {
  storeName: string;
  currency: string;
  taxRate: number;
  shippingFee: number;
  emailNotifications: boolean;
  automaticInventory: boolean;
}

interface EcommerceContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  featuredProducts: Product[];
  setFeaturedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const defaultStoreSettings: StoreSettings = {
  storeName: 'Financial Products Store',
  currency: 'TZS',
  taxRate: 7.5,
  shippingFee: 5.99,
  emailNotifications: true,
  automaticInventory: true
};

// Sample initial products
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Trading Strategy Guide',
    price: 29.99,
    stock: 100,
    category: 'Digital Products',
    status: 'active',
    image: '/placeholder-product.jpg',
    sales: 42,
    description: 'A comprehensive guide to trading strategies for beginners and intermediate traders.'
  },
  {
    id: '2',
    name: 'Investment Tracker Pro',
    price: 49.99,
    stock: 75,
    category: 'Software',
    status: 'active',
    image: '/placeholder-product.jpg',
    sales: 28,
    description: 'Track your investments and portfolio performance with this professional tool.'
  },
  {
    id: '3',
    name: 'Financial Analysis Toolkit',
    price: 39.99,
    stock: 0,
    category: 'Digital Products',
    status: 'out-of-stock',
    image: '/placeholder-product.jpg',
    sales: 65,
    description: 'A collection of templates and tools for financial analysis and reporting.'
  },
  {
    id: '4',
    name: 'Market Trends Report 2025',
    price: 19.99,
    stock: 120,
    category: 'Reports',
    status: 'active',
    image: '/placeholder-product.jpg',
    sales: 31,
    description: 'An in-depth analysis of market trends and predictions for 2025.'
  },
  {
    id: '5',
    name: 'Crypto Investment Course',
    price: 79.99,
    stock: 50,
    category: 'Courses',
    status: 'active',
    image: '/placeholder-product.jpg',
    sales: 19,
    description: 'Learn how to invest in cryptocurrencies safely and profitably.'
  }
];

// Sample initial orders
const initialOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: 'Sarah Johnson',
    date: '2025-05-28',
    total: 29.99,
    status: 'delivered',
    items: 1
  },
  {
    id: 'ORD-002',
    customer: 'Michael Chen',
    date: '2025-05-29',
    total: 89.98,
    status: 'shipped',
    items: 2
  },
  {
    id: 'ORD-003',
    customer: 'Emma Williams',
    date: '2025-05-30',
    total: 39.99,
    status: 'processing',
    items: 1
  },
  {
    id: 'ORD-004',
    customer: 'David Lee',
    date: '2025-05-31',
    total: 129.97,
    status: 'pending',
    items: 3
  },
  {
    id: 'ORD-005',
    customer: 'Lisa Brown',
    date: '2025-06-01',
    total: 19.99,
    status: 'pending',
    items: 1
  }
];

// Sample initial shops
const initialShops: Shop[] = [
  {
    id: '1',
    name: 'Financial Education Hub',
    description: 'Your one-stop shop for financial education resources',
    owner: 'John Doe',
    logo: '/placeholder-logo.jpg',
    banner: '/placeholder-banner.jpg',
    followers: 1250,
    productsCount: 15,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Trading Tools Pro',
    description: 'Professional trading tools and resources',
    owner: 'Jane Smith',
    logo: '/placeholder-logo.jpg',
    banner: '/placeholder-banner.jpg',
    followers: 850,
    productsCount: 8,
    rating: 4.6
  }
];

// Create the context
const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

// Provider component
export const EcommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(
    initialProducts.filter(p => p.status === 'active').slice(0, 3)
  );

  // Add a new product
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: `${products.length + 1}`,
      sales: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts([...products, newProduct]);
    
    // If product is active, consider it for featured products
    if (product.status === 'active') {
      if (featuredProducts.length < 3) {
        setFeaturedProducts([...featuredProducts, newProduct]);
      }
    }
  };

  // Update an existing product
  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id 
        ? { ...product, ...updatedFields, updatedAt: new Date().toISOString() } 
        : product
    );
    setProducts(updatedProducts);
    
    // Update featured products if needed
    setFeaturedProducts(prevFeatured => {
      const wasInFeatured = prevFeatured.some(p => p.id === id);
      const updatedProduct = updatedProducts.find(p => p.id === id);
      
      if (wasInFeatured) {
        // If product was featured but is now inactive, remove it
        if (updatedProduct?.status !== 'active') {
          return prevFeatured.filter(p => p.id !== id);
        }
        // Otherwise update it in the featured list
        return prevFeatured.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      }
      
      return prevFeatured;
    });
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    setFeaturedProducts(featuredProducts.filter(product => product.id !== id));
  };

  // Update order status
  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, status } 
        : order
    ));
  };

  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem('ecommerce_products', JSON.stringify(products));
      localStorage.setItem('ecommerce_orders', JSON.stringify(orders));
      localStorage.setItem('ecommerce_shops', JSON.stringify(shops));
      localStorage.setItem('ecommerce_settings', JSON.stringify(storeSettings));
      localStorage.setItem('ecommerce_featured', JSON.stringify(featuredProducts));
    } catch (error) {
      console.error('Error saving ecommerce data to localStorage:', error);
    }
  }, [products, orders, shops, storeSettings, featuredProducts]);

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('ecommerce_products');
      const storedOrders = localStorage.getItem('ecommerce_orders');
      const storedShops = localStorage.getItem('ecommerce_shops');
      const storedSettings = localStorage.getItem('ecommerce_settings');
      const storedFeatured = localStorage.getItem('ecommerce_featured');
      
      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedShops) setShops(JSON.parse(storedShops));
      if (storedSettings) setStoreSettings(JSON.parse(storedSettings));
      if (storedFeatured) setFeaturedProducts(JSON.parse(storedFeatured));
    } catch (error) {
      console.error('Error loading ecommerce data from localStorage:', error);
    }
  }, []);

  return (
    <EcommerceContext.Provider 
      value={{ 
        products, 
        setProducts, 
        orders, 
        setOrders, 
        shops, 
        setShops, 
        storeSettings, 
        setStoreSettings,
        featuredProducts,
        setFeaturedProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus
      }}
    >
      {children}
    </EcommerceContext.Provider>
  );
};

// Custom hook for using the context
export const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (context === undefined) {
    throw new Error('useEcommerce must be used within an EcommerceProvider');
  }
  return context;
};
