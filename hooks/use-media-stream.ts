import { useCallback, useRef } from 'react';

interface MediaStreamOptions {
  video?: boolean;
  audio?: boolean;
}

export function useMediaStream() {
  const streamRef = useRef<MediaStream | null>(null);

  const getMediaStream = useCallback(async (options: MediaStreamOptions = { video: true, audio: true }) => {
    try {
      // Check if we're in a browser environment with navigator.mediaDevices
      if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Stop any existing stream
        if (streamRef.current) {
          stopMediaStream();
        }

        // Get new stream
        const stream = await navigator.mediaDevices.getUserMedia(options);
        streamRef.current = stream;
        return stream;
      } else {
        throw new Error('Media devices not available in this environment');
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  return {
    getMediaStream,
    stopMediaStream,
    currentStream: streamRef.current
  };
}
