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
  Users 
} from 'lucide-react'
import { useStore, AudioStream } from '@/lib/store'
import { AudioLiveStream } from './AudioLiveStream'
import { formatDistanceToNow } from 'date-fns'

export function AudioStreamStatus() {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null)
  const [showLiveStream, setShowLiveStream] = useState(false)
  const [activeTab, setActiveTab] = useState('live')
  const { toast } = useToast()
  
  // Get audio streams from store
  const { 
    audioStreams, 
    currentAudioStream, 
    updateAudioStream, 
    endAudioStream 
  } = useStore()
  
  // Filter streams by live status
  const liveStreams = audioStreams.filter(stream => stream.isLive)
  const recordedStreams = audioStreams.filter(stream => !stream.isLive && stream.recordingUrl)
  
  // Handle play recorded stream
  const handlePlayStream = (stream: AudioStream) => {
    setSelectedStreamId(stream.id)
  }
  
  // Handle download recorded stream
  const handleDownloadStream = (stream: AudioStream) => {
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
    a.download = `${stream.title.replace(/\s+/g, '_')}_${new Date(stream.startTime).toISOString().split('T')[0]}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    toast({
      title: 'Download started',
      description: 'Your audio stream is being downloaded.',
    })
  }
  
  // Handle delete recorded stream
  const handleDeleteStream = (streamId: string) => {
    // In a real app, you would delete from server
    // For now, just mark as deleted in the store
    updateAudioStream(streamId, {
      recordingUrl: undefined
    })
    
    toast({
      title: 'Stream deleted',
      description: 'The audio stream has been deleted.',
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
  if (audioStreams.length === 0 && !currentAudioStream) {
    return null
  }
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Audio Streams
        </CardTitle>
        <CardDescription>
          Manage your live and recorded audio streams
        </CardDescription>
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
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="destructive" className="absolute -bottom-1 -right-1 px-1 py-0 text-[10px]">
                            LIVE
                          </Badge>
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
                              {stream.listenerCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Headphones className="h-4 w-4 mr-1" />
                              Listen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl p-0">
                            <AudioLiveStream 
                              streamId={stream.id}
                              onClose={() => setShowLiveStream(false)} 
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Radio className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No live audio streams available</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowLiveStream(true)}
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Start a live stream
                </Button>
                
                <Dialog open={showLiveStream} onOpenChange={setShowLiveStream}>
                  <DialogContent className="sm:max-w-3xl p-0">
                    <AudioLiveStream 
                      isHost={true} 
                      onClose={() => setShowLiveStream(false)} 
                    />
                  </DialogContent>
                </Dialog>
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
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Save className="h-5 w-5 text-primary" />
                        </div>
                        
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
                          onClick={() => handlePlayStream(stream)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadStream(stream)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteStream(stream.id)}
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
                <p>No recorded audio streams available</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('live')}
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Start a live stream
                </Button>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      {/* Audio Player for Recorded Streams */}
      {selectedStreamId && (
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                {recordedStreams.find(s => s.id === selectedStreamId)?.title}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedStreamId(null)}
              >
                Close
              </Button>
            </div>
            
            {recordedStreams.find(s => s.id === selectedStreamId)?.recordingUrl && (
              <audio 
                controls 
                src={recordedStreams.find(s => s.id === selectedStreamId)?.recordingUrl} 
                className="w-full" 
                autoPlay
              />
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
