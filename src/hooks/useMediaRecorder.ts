
import { useState, useEffect } from 'react';

export const useMediaRecorder = (audioStream: MediaStream | null) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    if (audioStream) {
      console.log('Audio stream available, initializing MediaRecorder');
      
      const options: MediaRecorderOptions = { 
        mimeType: 'audio/webm' 
      };
      
      try {
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.warn(`${options.mimeType} is not supported, falling back to default`);
          const recorder = new MediaRecorder(audioStream);
          setMediaRecorder(recorder);
        } else {
          const recorder = new MediaRecorder(audioStream, options);
          setMediaRecorder(recorder);
        }
      } catch (error) {
        console.error('Error initializing MediaRecorder:', error);
      }
    }
  }, [audioStream]);

  return { mediaRecorder };
};
