
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useAudioStream = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setError(null);
      console.log("Microphone access granted");
      return stream;
    } catch (err) {
      const errorMessage = 'Microphone permission denied. Please allow microphone access.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Microphone error:", err);
      return null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => {
          track.stop();
          console.log("Audio track stopped on cleanup");
        });
      }
    };
  }, [audioStream]);

  return {
    audioStream,
    error,
    requestMicrophonePermission
  };
};
