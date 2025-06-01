'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface ProductProps {
  id: string
  name: string
  description: string
  price: number
  discount?: number
  currency: string
  primaryImage: string
  categoryId: string
  category?: {
    id: string
    name: string
  }
  onAddToCart: (productId: string) => void
}

export function ProductCard({ 
  id, 
  name, 
  description, 
  price, 
  discount = 0, 
  currency = 'USD', 
  primaryImage, 
  category,
  onAddToCart 
}: ProductProps) {
  const { toast } = useToast()
  const [isHovering, setIsHovering] = useState(false)
  
  const discountedPrice = price - (price * (discount / 100))
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast({
      title: "Added to Wishlist",
      description: `${name} has been added to your wishlist`,
    })
  }
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart(id)
  }
  
  return (
    <div 
      className="relative group overflow-hidden rounded-md border border-muted/50 bg-card hover:border-primary/20 transition-colors"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="aspect-[3/4] bg-muted/20 relative">
        {primaryImage ? (
          <Image 
            src={primaryImage} 
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
        
        {discount > 0 && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
            {Math.round(discount)}% OFF
          </div>
        )}
        
        <div className={`absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent transition-opacity flex items-center justify-between ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            size="sm" 
            variant="secondary"
            className="h-6 text-[10px] px-2 py-0 rounded-full"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-2.5 w-2.5 mr-1" />
            Add
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="h-6 w-6 p-0 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={handleAddToWishlist}
          >
            <Heart className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="p-2">
        <Link href={`/shop/product/${id}`} className="block">
          <h4 className="text-xs font-medium line-clamp-1">{name}</h4>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold">
                {currency} {discountedPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {price.toFixed(2)}
                </span>
              )}
            </div>
            {category && (
              <span className="text-[10px] text-muted-foreground bg-muted/30 px-1 py-0.5 rounded">
                {category.name}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
