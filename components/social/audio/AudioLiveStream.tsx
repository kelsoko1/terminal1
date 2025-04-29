'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Radio,
  Clock,
  X,
  Send,
  Activity,
  Save,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useStore, AudioStream } from '@/lib/store'

interface LiveAudioComment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: string
}

interface AudioLiveStreamProps {
  isHost?: boolean
  streamId?: string
  onClose?: () => void
}

export function AudioLiveStream({ isHost = false, streamId, onClose }: AudioLiveStreamProps) {
  const [isLive, setIsLive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [listeners, setListeners] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [comments, setComments] = useState<LiveAudioComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)

  const audioContext = useRef<AudioContext | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const micStream = useRef<MediaStream | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const dataArray = useRef<Uint8Array | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const currentStreamId = useRef<string>('')

  const { toast } = useToast()

  // Access store functions
  const { 
    user, 
    saveAudioStream, 
    updateAudioStream, 
    endAudioStream, 
    currentAudioStream,
    getAudioStreamById
  } = useStore()

  // If streamId is provided, load existing stream
  useEffect(() => {
    if (streamId) {
      const existingStream = getAudioStreamById(streamId)
      if (existingStream) {
        setStreamTitle(existingStream.title)
        setStreamDescription(existingStream.description || '')
        setListeners(existingStream.listenerCount)
        setDuration(existingStream.duration)
        setIsLive(existingStream.isLive)
        currentStreamId.current = streamId
      }
    }
  }, [streamId, getAudioStreamById])

  // Timer for stream duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(() => {
        const newDuration = duration + 1
        setDuration(newDuration)

        // Update stream duration in store
        if (currentStreamId.current) {
          updateAudioStream(currentStreamId.current, { 
            duration: newDuration,
            listenerCount: listeners
          })
        }
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive, duration, listeners, updateAudioStream])

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize audio context and analyzer for visualizations
  const setupAudioContext = async () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (!micStream.current) {
        micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
      
      if (audioContext.current && micStream.current) {
        const source = audioContext.current.createMediaStreamSource(micStream.current)
        analyser.current = audioContext.current.createAnalyser()
        analyser.current.fftSize = 256
        source.connect(analyser.current)
        
        const bufferLength = analyser.current.frequencyBinCount
        dataArray.current = new Uint8Array(bufferLength)
        
        // Start visualization
        visualize()
      }
    } catch (error) {
      console.error('Error setting up audio:', error)
      toast({
        variant: 'destructive',
        title: 'Microphone access denied',
        description: 'Please allow microphone access to start a live audio stream.',
      })
    }
  }
  
  // Audio visualization
  const visualize = () => {
    if (!analyser.current || !dataArray.current) return
    
    const updateVisualization = () => {
      if (!analyser.current || !dataArray.current) return
      
      analyser.current.getByteFrequencyData(dataArray.current)
      
      // Calculate average volume level (0-100)
      const average = dataArray.current.reduce((acc, val) => acc + val, 0) / dataArray.current.length
      const normalizedLevel = Math.min(100, Math.max(0, average * 100 / 255))
      setAudioLevel(normalizedLevel)
      
      animationFrameId.current = requestAnimationFrame(updateVisualization)
    }
    
    updateVisualization()
  }
  
  // Start recording and broadcasting
  const startBroadcast = async () => {
    if (!streamTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Stream title required',
        description: 'Please enter a title for your stream.',
      })
      return
    }
    
    try {
      await setupAudioContext()
      
      if (micStream.current) {
        // Reset audio chunks
        audioChunks.current = []
        
        // Create MediaRecorder with audio stream
        mediaRecorder.current = new MediaRecorder(micStream.current)
        
        // Collect audio chunks
        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data)
            
            // Update stream in store to indicate new data is available
            if (currentStreamId.current) {
              updateAudioStream(currentStreamId.current, { 
                isLive: true,
                listenerCount: listeners
              })
            }
          }
        }
        
        mediaRecorder.current.onstart = () => {
          setIsRecording(true)
          setIsLive(true)
          
          // Create new stream in store
          const newStreamId = `stream-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          currentStreamId.current = newStreamId
          
          const newStream: AudioStream = {
            id: newStreamId,
            userId: user?.$id || 'anonymous',
            userName: user?.name || 'Anonymous User',
            title: streamTitle,
            description: streamDescription,
            startTime: new Date(),
            duration: 0,
            isLive: true,
            listenerCount: 0
          }
          
          saveAudioStream(newStream)
          
          // Simulate listeners joining
          simulateListeners()
        }
        
        mediaRecorder.current.onstop = () => {
          setIsRecording(false)
          setIsLive(false)
          
          // Create a single Blob from all the audio chunks
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
          setRecordingBlob(audioBlob)
          
          // Mark stream as ended in store
          if (currentStreamId.current) {
            endAudioStream(currentStreamId.current)
          }
          
          // Show save dialog
          setShowSaveDialog(true)
        }
        
        mediaRecorder.current.start(1000) // Collect data every second
        
        toast({
          title: 'Live broadcast started',
          description: 'Your audio stream is now live!',
        })
      }
    } catch (error) {
      console.error('Error starting broadcast:', error)
      toast({
        variant: 'destructive',
        title: 'Broadcast error',
        description: 'Could not start the audio broadcast. Please try again.',
      })
    }
  }
  
  // Stop recording and broadcasting
  const stopBroadcast = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
    }
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    
    setIsLive(false)
    
    toast({
      title: 'Broadcast ended',
      description: 'Your live audio stream has ended.',
    })
  }
  
  // Save recording
  const saveRecording = () => {
    if (!recordingBlob) {
      toast({
        variant: 'destructive',
        title: 'No recording available',
        description: 'There is no recording to save.',
      })
      return
    }
    
    setIsSaving(true)
    
    // Create a URL for the blob
    const audioUrl = URL.createObjectURL(recordingBlob)
    
    // In a real app, you would upload this to your server or cloud storage
    // For now, we'll simulate saving by updating the store with a URL
    setTimeout(() => {
      if (currentStreamId.current) {
        updateAudioStream(currentStreamId.current, {
          recordingUrl: audioUrl
        })
        
        toast({
          title: 'Recording saved',
          description: 'Your audio stream has been saved successfully.',
        })
      }
      
      setIsSaving(false)
      setShowSaveDialog(false)
    }, 1500)
  }
  
  // Download recording
  const downloadRecording = () => {
    if (!recordingBlob) return
    
    const audioUrl = URL.createObjectURL(recordingBlob)
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `${streamTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
  // Toggle mute
  const toggleMute = () => {
    if (micStream.current) {
      micStream.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }
  
  // Simulate listeners joining over time
  const simulateListeners = () => {
    let count = 0
    const interval = setInterval(() => {
      count++
      setListeners(Math.floor(Math.random() * 5) + count)
      
      // Add a simulated comment occasionally
      if (Math.random() > 0.7) {
        addSimulatedComment()
      }
      
      if (count > 20 || !isLive) {
        clearInterval(interval)
      }
    }, 5000)
  }
  
  // Add a simulated comment
  const addSimulatedComment = () => {
    const names = ['Sarah K.', 'Michael T.', 'James M.', 'Amina H.', 'Robert N.']
    const comments = [
      'Great insights!',
      'What do you think about the market today?',
      'Could you talk about DSE performance?',
      'Any thoughts on CRDB stock?',
      'Thanks for sharing your knowledge!',
      'How do you analyze these trends?',
      'Very informative session!'
    ]
    
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomComment = comments[Math.floor(Math.random() * comments.length)]
    
    const newComment: LiveAudioComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: `user-${Math.random().toString(36).substring(2, 9)}`,
      userName: randomName,
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName.replace(' ', '')}`,
      content: randomComment,
      timestamp: new Date().toISOString()
    }
    
    setComments(prev => [...prev, newComment])
  }
  
  // Add a comment
  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    const comment: LiveAudioComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: 'current-user',
      userName: 'You',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser',
      content: newComment,
      timestamp: new Date().toISOString()
    }
    
    setComments(prev => [...prev, comment])
    setNewComment('')
  }
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && isRecording) {
        mediaRecorder.current.stop()
        
        // Mark stream as ended in store
        if (currentStreamId.current) {
          endAudioStream(currentStreamId.current)
        }
      }
      
      if (micStream.current) {
        micStream.current.getTracks().forEach(track => track.stop())
      }
      
      if (audioContext.current) {
        audioContext.current.close()
      }
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [endAudioStream])

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-muted/20">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=johnmakala" />
            <AvatarFallback>JM</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold flex items-center gap-2">
              {isHost ? 'Your Audio Stream' : 'John Makala'}
              {isLive && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {streamTitle || 'Trading insights and market analysis'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{listeners}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Audio visualization */}
      <div className="p-6 flex flex-col items-center justify-center bg-gradient-to-b from-muted/50 to-background">
        <div className="relative mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=johnmakala" />
            <AvatarFallback>JM</AvatarFallback>
          </Avatar>
          
          {isLive && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <Badge variant="destructive" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            </div>
          )}
        </div>
        
        {isLive && (
          <div className="w-full max-w-md mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Audio Level</span>
              <span className="text-sm text-muted-foreground">{Math.round(audioLevel)}%</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
            
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: 20 }).map((_, i) => {
                const barHeight = Math.random() * 100
                return (
                  <div 
                    key={i} 
                    className="w-1 bg-primary rounded-full transition-all duration-150"
                    style={{ 
                      height: `${Math.max(4, barHeight * (audioLevel / 100))}px`,
                      opacity: audioLevel > 5 ? 1 : 0.5
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}
        
        {/* Host controls */}
        {isHost && (
          <div className="flex flex-col items-center gap-4">
            {!isLive ? (
              <Button 
                onClick={() => setShowSetupDialog(true)}
                className="gap-2"
              >
                <Radio className="h-4 w-4" />
                Start Live Audio
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={stopBroadcast}
                >
                  End Broadcast
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Listener controls */}
        {!isHost && isLive && (
          <div className="flex items-center gap-4 mt-4">
            <Button variant="outline" size="icon">
              <Volume2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comment
            </Button>
            
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Comments section */}
      {isLive && (
        <div className="border-t p-4">
          <h3 className="font-medium mb-4">Live Comments</h3>
          
          <div className="h-60 overflow-y-auto mb-4 space-y-4 pr-2">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Setup dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Live Audio Stream</DialogTitle>
            <DialogDescription>
              Set up your live audio broadcast. Your voice will be streamed to all listeners.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stream-title">Stream Title</Label>
              <Input
                id="stream-title"
                placeholder="Trading insights for today..."
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stream-description">Description (Optional)</Label>
              <Textarea
                id="stream-description"
                placeholder="Share what you'll be discussing..."
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowSetupDialog(false)
              startBroadcast()
            }}>
              Start Broadcasting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save Recording Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Audio Recording</DialogTitle>
            <DialogDescription>
              Your audio stream has ended. Would you like to save the recording?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              {recordingBlob && (
                <audio controls src={URL.createObjectURL(recordingBlob)} className="w-full" />
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={downloadRecording}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button 
                onClick={saveRecording}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save to Platform'}
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSaveDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
