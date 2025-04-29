'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { MediaStreamStatus } from '../MediaStreamStatus'

export function MediaStreamStatusWrapper() {
  const [mounted, setMounted] = useState(false)
  const { audioStreams, videoStreams } = useStore()
  
  // Only render on client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't render anything on the server
  if (!mounted) return null
  
  // Only render if there are audio or video streams
  if (audioStreams.length === 0 && videoStreams.length === 0) return null
  
  return <MediaStreamStatus />
}
