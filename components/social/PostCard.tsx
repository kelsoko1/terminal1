'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

type PostCardProps = {
  post: {
    id: string
    content: string
    timestamp?: string
    createdAt?: string
    likes: number
    comments: number
    shares: number
    isLiked: boolean
    isBookmarked: boolean
    author: {
      id: string
      name: string
      username: string
      avatarUrl?: string
    }
    images?: string[]
    tags?: string[]
  }
  onLike: (postId: string) => void
  onBookmark: (postId: string) => void
}

export function PostCard({ post, onLike, onBookmark }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)
  const [likeCount, setLikeCount] = useState(post.likes)
  
  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    onLike(post.id)
  }
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark(post.id)
  }
  
  const formattedDate = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : post.timestamp 
      ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
      : 'recently'
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {post.author.avatarUrl ? (
                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
              ) : (
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-sm text-gray-500">@{post.author.username} · {formattedDate}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="whitespace-pre-line">{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className={`mt-3 grid ${post.images.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
            {post.images.map((image, index) => (
              <div key={index} className="relative rounded-md overflow-hidden" style={{ height: '200px' }}>
                <Image 
                  src={image} 
                  alt={`Post image ${index + 1}`} 
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-6 text-gray-500">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 p-0 h-auto ${isLiked ? 'text-red-500' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-1 p-0 h-auto">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-1 p-0 h-auto">
            <Share2 className="h-4 w-4" />
            <span>{post.shares}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 p-0 h-auto ml-auto ${isBookmarked ? 'text-blue-500' : ''}`}
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
