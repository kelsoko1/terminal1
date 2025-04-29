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
  Download,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  ScreenShare,
  StopCircle
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
import { useStore, VideoStream } from '@/lib/store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LiveVideoComment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: string
}

interface VideoLiveStreamProps {
  isHost?: boolean
  streamId?: string
  onClose?: () => void
}

export function VideoLiveStream({ isHost = false, streamId, onClose }: VideoLiveStreamProps) {
  const [isLive, setIsLive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [viewers, setViewers] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [comments, setComments] = useState<LiveVideoComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [videoSource, setVideoSource] = useState<'camera' | 'screen'>('camera')
  const [videoQuality, setVideoQuality] = useState<string>('720p')
  const [audioQuality, setAudioQuality] = useState<string>('high')
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const videoStream = useRef<MediaStream | null>(null)
  const audioStream = useRef<MediaStream | null>(null)
  const combinedStream = useRef<MediaStream | null>(null)
  const videoChunks = useRef<Blob[]>([])
  const currentStreamId = useRef<string>('')
  const audioContext = useRef<AudioContext | null>(null)
  const audioAnalyser = useRef<AnalyserNode | null>(null)
  
  const { toast } = useToast()
  
  // Access store functions
  const { 
    user, 
    saveVideoStream, 
    updateVideoStream, 
    endVideoStream, 
    currentVideoStream,
    getVideoStreamById
  } = useStore()
  
  // If streamId is provided, load existing stream
  useEffect(() => {
    if (streamId) {
      const existingStream = getVideoStreamById(streamId)
      if (existingStream) {
        setStreamTitle(existingStream.title)
        setStreamDescription(existingStream.description || '')
        setViewers(existingStream.viewerCount)
        setDuration(existingStream.duration)
        setIsLive(existingStream.isLive)
        currentStreamId.current = streamId
      }
    }
  }, [streamId, getVideoStreamById])
  
  // Timer for stream duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(() => {
        const newDuration = duration + 1
        setDuration(newDuration)
        
        // Update stream duration in store
        if (currentStreamId.current) {
          updateVideoStream(currentStreamId.current, { 
            duration: newDuration,
            viewerCount: viewers
          })
        }
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive, duration, viewers, updateVideoStream])

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize camera and audio
  const setupMediaDevices = async () => {
    try {
      // Stop any existing streams
      if (videoStream.current) {
        videoStream.current.getTracks().forEach(track => track.stop())
      }
      
      if (audioStream.current) {
        audioStream.current.getTracks().forEach(track => track.stop())
      }
      
      // Get video constraints based on quality setting
      const videoConstraints: MediaTrackConstraints = {
        facingMode: 'user'
      }
      
      // Set resolution based on quality setting
      if (videoQuality === '720p') {
        videoConstraints.width = { ideal: 1280 }
        videoConstraints.height = { ideal: 720 }
      } else if (videoQuality === '1080p') {
        videoConstraints.width = { ideal: 1920 }
        videoConstraints.height = { ideal: 1080 }
      } else if (videoQuality === '480p') {
        videoConstraints.width = { ideal: 854 }
        videoConstraints.height = { ideal: 480 }
      }

      // Get audio constraints based on quality setting
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: audioQuality === 'high' ? 48000 : 44100,
        channelCount: audioQuality === 'high' ? 2 : 1
      }
      
      // Get video stream based on source
      if (videoSource === 'camera') {
        try {
          videoStream.current = await navigator.mediaDevices.getUserMedia({ 
            video: videoConstraints
          })
        } catch (error) {
          console.error('Error accessing camera:', error)
          toast({
            variant: 'destructive',
            title: 'Camera access denied',
            description: 'Please allow camera access to start a video stream.',
          })
          return false
        }
      } else if (videoSource === 'screen') {
        try {
          videoStream.current = await navigator.mediaDevices.getDisplayMedia({ 
            video: videoConstraints
          })
        } catch (error) {
          console.error('Error accessing screen sharing:', error)
          toast({
            variant: 'destructive',
            title: 'Screen sharing access denied',
            description: 'Please allow screen sharing access to start a video stream.',
          })
          return false
        }
      }
      
      // Get audio stream
      try {
        audioStream.current = await navigator.mediaDevices.getUserMedia({ 
          audio: audioConstraints
        })

        // Set up audio analysis
        if (!audioContext.current) {
          audioContext.current = new AudioContext()
        }
        
        if (audioStream.current) {
          const source = audioContext.current.createMediaStreamSource(audioStream.current)
          audioAnalyser.current = audioContext.current.createAnalyser()
          audioAnalyser.current.fftSize = 256
          source.connect(audioAnalyser.current)
          
          // Start monitoring audio levels
          const dataArray = new Uint8Array(audioAnalyser.current.frequencyBinCount)
          const updateAudioLevel = () => {
            if (audioAnalyser.current) {
              audioAnalyser.current.getByteFrequencyData(dataArray)
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length
              setAudioLevel(average)
              if (isLive) {
                requestAnimationFrame(updateAudioLevel)
              }
            }
          }
          updateAudioLevel()
        }
      } catch (error) {
        console.error('Error accessing microphone:', error)
        toast({
          variant: 'destructive',
          title: 'Microphone access denied',
          description: 'Please allow microphone access for audio in your video stream.',
        })
        // Continue without audio
        audioStream.current = new MediaStream()
      }
      
      // Combine video and audio tracks
      const videoTracks = videoStream.current?.getVideoTracks() || []
      const audioTracks = audioStream.current?.getAudioTracks() || []
      
      combinedStream.current = new MediaStream([...videoTracks, ...audioTracks])
      
      // Display preview
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream.current
        videoRef.current.muted = true // Mute preview to avoid feedback
        
        // Ensure video plays
        try {
          await videoRef.current.play()
        } catch (error) {
          console.error('Error playing video:', error)
        }
      }
      
      return true
    } catch (error) {
      console.error('Error accessing media devices:', error)
      
      toast({
        variant: 'destructive',
        title: 'Media access denied',
        description: 'Please allow camera and microphone access to start a live video stream.',
      })
      
      return false
    }
  }
  
  // Capture thumbnail from video
  const captureThumbnail = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg')
        setThumbnailUrl(thumbnailUrl)
        return thumbnailUrl
      }
    }
    return null
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
    
    // Setup media devices
    const success = await setupMediaDevices()
    if (!success || !combinedStream.current) {
      toast({
        variant: 'destructive',
        title: 'Media setup failed',
        description: 'Failed to set up camera and microphone. Please try again.',
      })
      return
    }
    
    try {
      // Reset video chunks
      videoChunks.current = []
      
      // Create MediaRecorder with combined stream
      const options = { mimeType: 'video/webm;codecs=vp9,opus' }
      try {
        mediaRecorder.current = new MediaRecorder(combinedStream.current, options)
      } catch (e) {
        // Fallback if vp9 is not supported
        const fallbackOptions = { mimeType: 'video/webm' }
        try {
          mediaRecorder.current = new MediaRecorder(combinedStream.current, fallbackOptions)
        } catch (e2) {
          // Last resort fallback
          mediaRecorder.current = new MediaRecorder(combinedStream.current)
        }
      }
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.current.push(event.data)
          
          // Update stream in store to indicate new data is available
          if (currentStreamId.current) {
            updateVideoStream(currentStreamId.current, { 
              isLive: true,
              viewerCount: viewers
            })
          }
        }
      }
      
      mediaRecorder.current.onstart = () => {
        setIsRecording(true)
        setIsLive(true)
        
        // Capture thumbnail
        const thumbnail = captureThumbnail()
        
        // Create resolution string
        const resolution = videoQuality
        
        // Create new stream in store
        const newStreamId = `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        currentStreamId.current = newStreamId
        
        const newStream: VideoStream = {
          id: newStreamId,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous User',
          title: streamTitle,
          description: streamDescription,
          startTime: new Date(),
          duration: 0,
          isLive: true,
          viewerCount: 0,
          hasAudio: true,
          thumbnailUrl: thumbnail || undefined,
          resolution
        }
        
        saveVideoStream(newStream)
        
        // Simulate viewers joining
        simulateViewers()
      }
      
      mediaRecorder.current.onstop = () => {
        setIsRecording(false)
        setIsLive(false)
        
        // Create a single Blob from all the video chunks
        const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' })
        setRecordingBlob(videoBlob)
        
        // Mark stream as ended in store
        if (currentStreamId.current) {
          endVideoStream(currentStreamId.current)
        }
        
        // Show save dialog
        setShowSaveDialog(true)
      }
      
      mediaRecorder.current.start(1000) // Collect data every second
      
      toast({
        title: 'Live broadcast started',
        description: 'Your video stream is now live!',
      })
    } catch (error) {
      console.error('Error starting broadcast:', error)
      toast({
        variant: 'destructive',
        title: 'Broadcast error',
        description: 'Could not start the video broadcast. Please try again.',
      })
    }
  }
  
  // Stop recording and broadcasting
  const stopBroadcast = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
    }
    
    setIsLive(false)
    
    toast({
      title: 'Broadcast ended',
      description: 'Your live video stream has ended.',
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
    const videoUrl = URL.createObjectURL(recordingBlob)
    
    // In a real app, you would upload this to your server or cloud storage
    // For now, we'll simulate saving by updating the store with a URL
    setTimeout(() => {
      if (currentStreamId.current) {
        updateVideoStream(currentStreamId.current, {
          recordingUrl: videoUrl
        })
        
        toast({
          title: 'Recording saved',
          description: 'Your video stream has been saved successfully.',
        })
      }
      
      setIsSaving(false)
      setShowSaveDialog(false)
    }, 1500)
  }
  
  // Download recording
  const downloadRecording = () => {
    if (!recordingBlob) return
    
    const videoUrl = URL.createObjectURL(recordingBlob)
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `${streamTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
  // Toggle mute
  const toggleMute = () => {
    if (audioStream.current) {
      audioStream.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }
  
  // Toggle video
  const toggleVideo = () => {
    if (videoStream.current) {
      videoStream.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }
  
  // Simulate viewers joining over time
  const simulateViewers = () => {
    let count = 0
    const interval = setInterval(() => {
      count++
      setViewers(Math.floor(Math.random() * 5) + count)
      
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
    
    const newComment: LiveVideoComment = {
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
    
    const comment: LiveVideoComment = {
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
          endVideoStream(currentStreamId.current)
        }
      }
      
      if (videoStream.current) {
        videoStream.current.getTracks().forEach(track => track.stop())
      }
      
      if (audioStream.current) {
        audioStream.current.getTracks().forEach(track => track.stop())
      }
      
      if (combinedStream.current) {
        combinedStream.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [endVideoStream])

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
              {isHost ? 'Your Video Stream' : 'John Makala'}
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
              <span>{viewers}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Video display */}
      <div className="relative bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-[300px] object-cover ${isHost && !isLive ? 'hidden' : ''}`}
        />
        
        {/* Offline placeholder */}
        {(!isLive && !isHost) && (
          <div className="w-full h-[300px] flex flex-col items-center justify-center bg-muted/10">
            <Video className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Stream is currently offline</p>
          </div>
        )}
        
        {/* Camera setup placeholder */}
        {(isHost && !isLive) && (
          <div className="w-full h-[300px] flex flex-col items-center justify-center bg-muted/10">
            <Camera className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Set up your camera to start streaming</p>
          </div>
        )}
        
        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="animate-pulse">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </div>
        )}
        
        {/* Viewer count */}
        {isLive && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {viewers} watching
            </Badge>
          </div>
        )}
        
        {/* Hidden canvas for thumbnail capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Host controls */}
      {isHost && (
        <div className="p-4 flex flex-col items-center gap-4">
          {!isLive ? (
            <Button 
              onClick={() => setShowSetupDialog(true)}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Start Live Video
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
                variant="outline"
                size="icon"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="destructive"
                onClick={stopBroadcast}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Broadcast
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Viewer controls */}
      {!isHost && isLive && (
        <div className="p-4 flex items-center justify-center gap-4">
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Start Live Video Stream</DialogTitle>
            <DialogDescription>
              Set up your live video broadcast. Configure your video and audio settings below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
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

            <div className="grid md:grid-cols-2 gap-6">
              {/* Video Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Video Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="video-source">Source</Label>
                  <Select 
                    value={videoSource} 
                    onValueChange={(value: 'camera' | 'screen') => setVideoSource(value)}
                  >
                    <SelectTrigger id="video-source" className="w-full">
                      <SelectValue placeholder="Select video source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camera">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          <span>Camera</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="screen">
                        <div className="flex items-center gap-2">
                          <ScreenShare className="h-4 w-4" />
                          <span>Screen Share</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-quality">Quality</Label>
                  <Select 
                    value={videoQuality} 
                    onValueChange={(value) => setVideoQuality(value)}
                  >
                    <SelectTrigger id="video-quality" className="w-full">
                      <SelectValue placeholder="Select video quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="480p">480p (SD)</SelectItem>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {videoRef.current && videoRef.current.srcObject && (
                  <div className="border rounded-md overflow-hidden bg-black/5">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-[200px] object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Audio Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Audio Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="audio-quality">Quality</Label>
                  <Select 
                    value={audioQuality} 
                    onValueChange={setAudioQuality}
                  >
                    <SelectTrigger id="audio-quality" className="w-full">
                      <SelectValue placeholder="Select audio quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4" />
                          <span>Standard (Mono, 44.1kHz)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4" />
                          <span>High Quality (Stereo, 48kHz)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Microphone Level</Label>
                  <div className="h-8 bg-black/5 rounded-md overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${(audioLevel / 255) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={async () => {
                  await setupMediaDevices()
                }}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Test Audio & Video
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowSetupDialog(false)
                startBroadcast()
              }}
              className="gap-2"
            >
              <Radio className="h-4 w-4" />
              Start Broadcasting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save Recording Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Video Recording</DialogTitle>
            <DialogDescription>
              Your video stream has ended. Would you like to save the recording?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              {recordingBlob && (
                <video 
                  controls 
                  src={URL.createObjectURL(recordingBlob)} 
                  className="w-full max-h-[200px]" 
                />
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
