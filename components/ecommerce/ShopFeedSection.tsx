'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ShoppingBag, Store, Tag, TrendingUp, Heart } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from './ProductCard'
import { useEcommerce } from '@/contexts/EcommerceContext'

// Using Product interface from EcommerceContext

export function ShopFeedSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { toast } = useToast()
  const { products } = useEcommerce()
  
  const visibleProducts = 3
  // Get products with highest sales for trending section
  const trendingProducts = [...products]
    .filter(p => p.status === 'active')
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6)
  
  const handleAddToCart = (productId: string, quantity: number = 1) => {
    // In a real app, this would add to a cart context or make an API call
    // For now, we'll just show a toast notification
    toast({
      title: 'Success',
      description: 'Product added to cart',
    })
  }
  
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }
  
  const handleNext = () => {
    setCurrentIndex(prev => Math.min(trendingProducts.length - visibleProducts, prev + 1))
  }
  
  // Loading state removed as we're using context data directly
  
  if (trendingProducts.length === 0) {
    return null
  }
  
  return (
    <Card className="p-3 my-4 border border-muted/50 shadow-sm bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="h-5 px-1.5 bg-primary/5 border-primary/20">
            <Tag className="h-3 w-3 mr-1 text-primary" />
            <span className="text-[10px] font-medium">SHOP</span>
          </Badge>
          <h3 className="text-xs font-medium">Trending Products</h3>
          <Badge variant="outline" className="h-5 px-1.5 bg-amber-500/5 border-amber-500/20">
            <TrendingUp className="h-3 w-3 mr-1 text-amber-500" />
            <span className="text-[10px] font-medium text-amber-500">HOT</span>
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={handleNext}
            disabled={currentIndex >= trendingProducts.length - visibleProducts}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
            <Link href="/shop">
              <ShoppingBag className="h-3 w-3 mr-1" />
              View All
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {trendingProducts.slice(currentIndex, currentIndex + visibleProducts).map(product => (
          <ProductCard 
            key={product.id} 
            id={product.id}
            name={product.name}
            description={product.description || ''}
            price={product.price}
            discount={0} // No discount in our context model
            currency="USD" // Default currency
            primaryImage={product.image || '/placeholder-product.jpg'}
            categoryId={product.category}
            category={{ id: product.category, name: product.category }}
            onAddToCart={() => handleAddToCart(product.id)}
          />
        ))}
      </div>
    </Card>
  )
}
