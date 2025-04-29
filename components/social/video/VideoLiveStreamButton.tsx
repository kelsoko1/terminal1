'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Video } from 'lucide-react'
import { VideoLiveStream } from './VideoLiveStream'
import { useToast } from '@/components/ui/use-toast'

interface VideoLiveStreamButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function VideoLiveStreamButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: VideoLiveStreamButtonProps) {
  const [showLiveStream, setShowLiveStream] = useState(false)
  const { toast } = useToast()

  const handleOpenVideoStream = () => {
    setShowLiveStream(true)
  }

  const handleCloseVideoStream = () => {
    setShowLiveStream(false)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpenVideoStream}
      >
        <Video className="h-4 w-4 mr-2" />
        Go Live Video
      </Button>

      <Dialog 
        open={showLiveStream} 
        onOpenChange={setShowLiveStream}
      >
        <DialogContent className="sm:max-w-3xl p-0 border-none">
          <VideoLiveStream 
            isHost={true} 
            onClose={handleCloseVideoStream} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
