
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useAudioStream = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setAudioStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      const errorMessage = 'Microphone permission denied. Please allow microphone access.';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStream]);

  return {
    audioStream,
    requestMicrophonePermission,
    error,
    setAudioStream,
  };
};
