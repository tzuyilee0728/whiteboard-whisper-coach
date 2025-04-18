
import { useState, useEffect, useRef } from 'react';

export const useMediaRecorder = (audioStream: MediaStream | null) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (audioStream) {
      try {
        const recorder = new MediaRecorder(audioStream);
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
            console.log(`Audio chunk captured: ${e.data.size} bytes`);
            
            // Dispatch audio data as custom event
            const audioDataEvent = new CustomEvent('audioData', { 
              detail: e.data
            });
            window.dispatchEvent(audioDataEvent);
          }
        };
        
        setMediaRecorder(recorder);
        console.log("MediaRecorder initialized successfully");
        
        return () => {
          recorder.ondataavailable = null;
        };
      } catch (err) {
        console.error("Error initializing MediaRecorder:", err);
      }
    }
  }, [audioStream]);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      audioChunksRef.current = [];
      mediaRecorder.start(1000);
      console.log("MediaRecorder started");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      console.log("MediaRecorder stopped");
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      return audioBlob;
    }
    return null;
  };

  return {
    startRecording,
    stopRecording,
    mediaRecorder,
    audioChunksRef
  };
};
