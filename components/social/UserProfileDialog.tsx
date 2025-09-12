'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TraderProfile } from '@/components/social/TraderProfile'
import { Button } from '@/components/ui/button'
import { MessageSquare, Grid, Bookmark, CheckCircle2, BarChart2, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface UserProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  userName?: string
}

export function UserProfileDialog({ isOpen, onClose, userId, userName }: UserProfileDialogProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isMessageSheetOpen, setIsMessageSheetOpen] = useState(false)
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You are no longer following ${userName}` 
        : `You are now following ${userName}`,
      duration: 3000,
    })
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message Sent",
        description: `Your message to ${userName} has been sent`,
        duration: 3000,
      })
      setMessage('')
      setIsMessageSheetOpen(false)
    }
  }

  // Mock data for Instagram-like profile
  const posts = [
    { id: 1, imageUrl: '/images/trade-chart1.jpg' },
    { id: 2, imageUrl: '/images/trade-chart2.jpg' },
    { id: 3, imageUrl: '/images/trade-chart3.jpg' },
    { id: 4, imageUrl: '/images/trade-chart4.jpg' },
    { id: 5, imageUrl: '/images/trade-chart5.jpg' },
    { id: 6, imageUrl: '/images/trade-chart6.jpg' },
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white dark:bg-gray-950">
            {/* Header with username */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {userName?.toLowerCase().replace(/\s+/g, '') || 'johnmakala'}
                </span>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
              </div>
            </div>

            {/* Profile info section */}
            <div className="p-4">
              <div className="flex gap-8">
                {/* Avatar */}
                <Avatar className="h-20 w-20 rounded-full border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage src="/avatars/trader1.png" alt={userName} />
                  <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
                </Avatar>

                {/* Stats */}
                <div className="flex-1 flex items-center justify-between">
                  <div className="text-center">
                    <div className="font-bold">156</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">1.2K</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">245</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4">
                <h3 className="font-bold">{userName || 'John Makala'}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Professional trader 📈</p>
                <p className="text-sm mt-1">5+ years in forex and equity markets. Technical analysis specialist. Monthly return: +18.5% 📊</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                {isFollowing ? (
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-md"
                    onClick={handleFollow}
                  >
                    Following
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 rounded-md"
                    onClick={handleFollow}
                  >
                    Follow
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-md"
                  onClick={() => setIsMessageSheetOpen(true)}
                >
                  Message
                </Button>
              </div>
            </div>

            {/* Trading performance highlight */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Trading Performance</span>
              </div>
              <span className="text-green-500 font-bold">+18.5%</span>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-transparent h-12 border-t dark:border-gray-800">
                <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none">
                  <Grid className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-transparent data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none">
                  <Bookmark className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="tagged" className="data-[state=active]:bg-transparent data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none">
                  <BarChart2 className="h-5 w-5" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-0">
                <div className="grid grid-cols-3 gap-1">
                  {posts.map(post => (
                    <div key={post.id} className="aspect-square bg-gray-200 dark:bg-gray-800 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span>Chart {post.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="mt-0">
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Saved posts will appear here
                </div>
              </TabsContent>
              
              <TabsContent value="tagged" className="mt-0">
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Trading analytics will appear here
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instagram-style Direct Message Sheet */}
      <Sheet open={isMessageSheetOpen} onOpenChange={setIsMessageSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md p-0 flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Message {userName}</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 p-4 overflow-auto">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/trader1.png" alt={userName} />
                <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userName || 'John Makala'}</p>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </div>
            
            <div className="py-8 text-center text-gray-500">
              <p>This is the beginning of your conversation with {userName}</p>
              <p className="text-xs mt-1">Messages are private and end-to-end encrypted</p>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Textarea
                placeholder={`Message ${userName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
                rows={2}
              />
              <Button 
                size="icon" 
                disabled={!message.trim()} 
                onClick={handleSendMessage}
                className="rounded-full h-10 w-10 flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
