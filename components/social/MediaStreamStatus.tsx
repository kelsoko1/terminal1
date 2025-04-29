'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { 
  Activity, 
  Clock, 
  Download, 
  Headphones, 
  Play, 
  Radio, 
  Save, 
  Trash2, 
  Users,
  Video,
  Film,
  Mic
} from 'lucide-react'
import { useStore, AudioStream, VideoStream, MediaStreamType } from '@/lib/store'
import { AudioLiveStream } from './audio/AudioLiveStream'
import { VideoLiveStream } from './video/VideoLiveStream'
import { AudioLiveStreamButton } from './audio/AudioLiveStreamButton'
import { VideoLiveStreamButton } from './video/VideoLiveStreamButton'
import { formatDistanceToNow } from 'date-fns'

export function MediaStreamStatus() {
  const [selectedAudioStreamId, setSelectedAudioStreamId] = useState<string | null>(null)
  const [selectedVideoStreamId, setSelectedVideoStreamId] = useState<string | null>(null)
  const [showLiveAudioStream, setShowLiveAudioStream] = useState(false)
  const [showLiveVideoStream, setShowLiveVideoStream] = useState(false)
  const [activeTab, setActiveTab] = useState('live')
  const [activeMediaType, setActiveMediaType] = useState<MediaStreamType>('audio')
  const { toast } = useToast()
  
  // Get media streams from store
  const { 
    audioStreams, 
    videoStreams,
    currentAudioStream, 
    currentVideoStream,
    updateAudioStream, 
    updateVideoStream,
    endAudioStream,
    endVideoStream
  } = useStore()
  
  // Filter streams by live status
  const liveAudioStreams = audioStreams.filter(stream => stream.isLive)
  const recordedAudioStreams = audioStreams.filter(stream => !stream.isLive && stream.recordingUrl)
  const liveVideoStreams = videoStreams.filter(stream => stream.isLive)
  const recordedVideoStreams = videoStreams.filter(stream => !stream.isLive && stream.recordingUrl)
  
  // Combined live and recorded streams for the current media type
  const liveStreams = activeMediaType === 'audio' ? liveAudioStreams : liveVideoStreams
  const recordedStreams = activeMediaType === 'audio' ? recordedAudioStreams : recordedVideoStreams
  
  // Handle play recorded stream
  const handlePlayStream = (streamId: string, type: MediaStreamType) => {
    if (type === 'audio') {
      setSelectedAudioStreamId(streamId)
      setSelectedVideoStreamId(null)
    } else {
      setSelectedVideoStreamId(streamId)
      setSelectedAudioStreamId(null)
    }
  }
  
  // Handle download recorded stream
  const handleDownloadStream = (stream: AudioStream | VideoStream, type: MediaStreamType) => {
    if (!stream.recordingUrl) {
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'No recording URL available for this stream.',
      })
      return
    }
    
    const a = document.createElement('a')
    a.href = stream.recordingUrl
    a.download = `${stream.title.replace(/\s+/g, '_')}_${new Date(stream.startTime).toISOString().split('T')[0]}.${type === 'audio' ? 'webm' : 'webm'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    toast({
      title: 'Download started',
      description: `Your ${type} stream is being downloaded.`,
    })
  }
  
  // Handle delete recorded stream
  const handleDeleteStream = (streamId: string, type: MediaStreamType) => {
    // In a real app, you would delete from server
    // For now, just mark as deleted in the store
    if (type === 'audio') {
      updateAudioStream(streamId, {
        recordingUrl: undefined
      })
    } else {
      updateVideoStream(streamId, {
        recordingUrl: undefined
      })
    }
    
    toast({
      title: 'Stream deleted',
      description: `The ${type} stream has been deleted.`,
    })
  }
  
  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // If no streams, don't render anything
  if (audioStreams.length === 0 && videoStreams.length === 0 && 
      !currentAudioStream && !currentVideoStream) {
    return null
  }
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {activeMediaType === 'audio' ? (
            <Mic className="h-4 w-4" />
          ) : (
            <Film className="h-4 w-4" />
          )}
          {activeMediaType === 'audio' ? 'Audio' : 'Video'} Streams
        </CardTitle>
        <CardDescription>
          Manage your live and recorded {activeMediaType} streams
        </CardDescription>
        
        <div className="flex justify-between items-center mt-2">
          <div>
            <Button 
              variant={activeMediaType === 'audio' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveMediaType('audio')}
              className="mr-2"
            >
              <Mic className="h-4 w-4 mr-2" />
              Audio
              {audioStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2">{audioStreams.length}</Badge>
              )}
            </Button>
            <Button 
              variant={activeMediaType === 'video' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveMediaType('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
              {videoStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2">{videoStreams.length}</Badge>
              )}
            </Button>
          </div>
          
          <div>
            {activeMediaType === 'audio' ? (
              <AudioLiveStreamButton 
                variant="outline"
                size="sm"
              />
            ) : (
              <VideoLiveStreamButton 
                variant="outline"
                size="sm"
              />
            )}
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="live" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="live" className="flex-1">
              Live
              {liveStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2">{liveStreams.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recorded" className="flex-1">
              Recorded
              {recordedStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2">{recordedStreams.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-4">
          <TabsContent value="live" className="m-0">
            {liveStreams.length > 0 ? (
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {liveStreams.map((stream) => (
                    <div 
                      key={stream.id} 
                      className="flex items-center justify-between p-3 rounded-md border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {activeMediaType === 'video' && (stream as VideoStream).thumbnailUrl ? (
                            <div className="w-16 h-10 rounded bg-primary/10 overflow-hidden">
                              <img 
                                src={(stream as VideoStream).thumbnailUrl} 
                                alt={stream.title}
                                className="w-full h-full object-cover"
                              />
                              <Badge variant="destructive" className="absolute -bottom-1 -right-1 px-1 py-0 text-[10px]">
                                LIVE
                              </Badge>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Activity className="h-5 w-5 text-primary" />
                              <Badge variant="destructive" className="absolute -bottom-1 -right-1 px-1 py-0 text-[10px]">
                                LIVE
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="font-medium">{stream.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(stream.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {activeMediaType === 'audio' 
                                ? (stream as AudioStream).listenerCount 
                                : (stream as VideoStream).viewerCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              {activeMediaType === 'audio' ? (
                                <Headphones className="h-4 w-4 mr-1" />
                              ) : (
                                <Play className="h-4 w-4 mr-1" />
                              )}
                              {activeMediaType === 'audio' ? 'Listen' : 'Watch'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl p-0">
                            {activeMediaType === 'audio' ? (
                              <AudioLiveStream 
                                streamId={stream.id}
                                onClose={() => setShowLiveAudioStream(false)} 
                              />
                            ) : (
                              <VideoLiveStream 
                                streamId={stream.id}
                                onClose={() => setShowLiveVideoStream(false)} 
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {activeMediaType === 'audio' ? (
                  <Radio className="h-10 w-10 mx-auto mb-3 opacity-20" />
                ) : (
                  <Video className="h-10 w-10 mx-auto mb-3 opacity-20" />
                )}
                <p>No live {activeMediaType} streams available</p>
                {activeMediaType === 'audio' ? (
                  <AudioLiveStreamButton 
                    variant="outline"
                    className="mt-4"
                  />
                ) : (
                  <VideoLiveStreamButton 
                    variant="outline"
                    className="mt-4"
                  />
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recorded" className="m-0">
            {recordedStreams.length > 0 ? (
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {recordedStreams.map((stream) => (
                    <div 
                      key={stream.id} 
                      className="flex items-center justify-between p-3 rounded-md border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        {activeMediaType === 'video' && (stream as VideoStream).thumbnailUrl ? (
                          <div className="w-16 h-10 rounded bg-primary/10 overflow-hidden">
                            <img 
                              src={(stream as VideoStream).thumbnailUrl} 
                              alt={stream.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Save className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        
                        <div>
                          <div className="font-medium">{stream.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(stream.duration)}
                            </span>
                            <span>
                              {stream.endTime && formatDistanceToNow(new Date(stream.endTime), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePlayStream(stream.id, activeMediaType)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadStream(stream, activeMediaType)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteStream(stream.id, activeMediaType)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Save className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No recorded {activeMediaType} streams available</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('live')}
                >
                  {activeMediaType === 'audio' ? (
                    <Radio className="h-4 w-4 mr-2" />
                  ) : (
                    <Video className="h-4 w-4 mr-2" />
                  )}
                  Start a live {activeMediaType} stream
                </Button>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      {/* Audio Player for Recorded Streams */}
      {selectedAudioStreamId && (
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                {recordedAudioStreams.find(s => s.id === selectedAudioStreamId)?.title}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedAudioStreamId(null)}
              >
                Close
              </Button>
            </div>
            
            {recordedAudioStreams.find(s => s.id === selectedAudioStreamId)?.recordingUrl && (
              <audio 
                controls 
                src={recordedAudioStreams.find(s => s.id === selectedAudioStreamId)?.recordingUrl} 
                className="w-full" 
                autoPlay
              />
            )}
          </div>
        </CardFooter>
      )}
      
      {/* Video Player for Recorded Streams */}
      {selectedVideoStreamId && (
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                {recordedVideoStreams.find(s => s.id === selectedVideoStreamId)?.title}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedVideoStreamId(null)}
              >
                Close
              </Button>
            </div>
            
            {recordedVideoStreams.find(s => s.id === selectedVideoStreamId)?.recordingUrl && (
              <video 
                controls 
                src={recordedVideoStreams.find(s => s.id === selectedVideoStreamId)?.recordingUrl} 
                className="w-full max-h-[250px]" 
                autoPlay
              />
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
