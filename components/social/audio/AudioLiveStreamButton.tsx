'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Radio, Mic } from 'lucide-react'
import { AudioLiveStream } from './AudioLiveStream'

interface AudioLiveStreamButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function AudioLiveStreamButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: AudioLiveStreamButtonProps) {
  const [showLiveStream, setShowLiveStream] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowLiveStream(true)}
      >
        <Radio className="h-4 w-4 mr-2" />
        Go Live Audio
      </Button>

      <Dialog open={showLiveStream} onOpenChange={setShowLiveStream}>
        <DialogContent className="sm:max-w-3xl p-0">
          <AudioLiveStream 
            isHost={true} 
            onClose={() => setShowLiveStream(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
