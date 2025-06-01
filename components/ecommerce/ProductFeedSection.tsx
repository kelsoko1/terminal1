'use client'

import { useState } from 'react'
import { ProductCard } from './ProductCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ShoppingBag, Store } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { useEcommerce } from '@/contexts/EcommerceContext'

// Using Product interface from EcommerceContext

export function ProductFeedSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { toast } = useToast()
  const { products, featuredProducts } = useEcommerce()
  
  const visibleProducts = 3
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.filter(p => p.status === 'active').slice(0, 6)
  
  const handleAddToCart = (productId: string) => {
    // In a real app, this would add to a cart context or make an API call
    // For now, we'll just show a toast notification
    toast({
      title: "Added to Cart",
      description: "Item has been added to your cart",
    })
  }
  
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }
  
  const handleNext = () => {
    setCurrentIndex(prev => Math.min(displayProducts.length - visibleProducts, prev + 1))
  }
  
  // Loading state removed as we're using context data directly
  
  if (displayProducts.length === 0) {
    return null
  }
  
  return (
    <Card className="p-4 my-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Store className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">Shop Products</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleNext}
            disabled={currentIndex >= displayProducts.length - visibleProducts}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4 mr-1" />
              View All
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {displayProducts.slice(currentIndex, currentIndex + visibleProducts).map(product => (
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
