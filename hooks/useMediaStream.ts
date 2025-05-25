import { useState, useEffect, useRef } from 'react';

interface MediaStreamOptions {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

interface UseMediaStreamResult {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  startStream: (options?: MediaStreamOptions) => Promise<void>;
  stopStream: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
  isStreamActive: boolean;
}

export function useMediaStream(): UseMediaStreamResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Clean up function to stop all tracks
  const stopAllTracks = (mediaStream: MediaStream | null) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
  };

  // Start the media stream with the given options
  const startStream = async (options: MediaStreamOptions = { video: true, audio: true }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop any existing stream
      stopAllTracks(stream);
      
      // Request new stream with specified options
      const newStream = await navigator.mediaDevices.getUserMedia(options);
      setStream(newStream);
      setIsStreamActive(true);

      // Connect stream to video element if video is enabled
      if (options.video && videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Connect stream to audio element if audio is enabled and video is disabled
      if (options.audio && !options.video && audioRef.current) {
        audioRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Permission denied. Please allow access to camera and/or microphone.');
        } else if (err.name === 'NotFoundError') {
          setError('Camera or microphone not found. Please check your device connections.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera or microphone is already in use by another application.');
        } else {
          setError(`Error accessing media: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while accessing media devices.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Stop the media stream
  const stopStream = () => {
    stopAllTracks(stream);
    setStream(null);
    setIsStreamActive(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllTracks(stream);
    };
  }, [stream]);

  return {
    stream,
    error,
    isLoading,
    startStream,
    stopStream,
    videoRef,
    audioRef,
    isStreamActive
  };
}
