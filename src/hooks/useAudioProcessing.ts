
import { useRef, useEffect } from 'react';
import { transcriptionService } from '@/services/transcriptionService';

export const useAudioProcessing = (
  mediaRecorder: MediaRecorder | null,
  isRecording: boolean,
  isProcessing: boolean,
  setIsProcessing: (value: boolean) => void
) => {
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!mediaRecorder) return;
    
    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        console.log(`Audio data available: ${e.data.size} bytes`);
        audioChunksRef.current.push(e.data);
        
        if (isRecording && !isProcessing) {
          setIsProcessing(true);
          try {
            await transcriptionService.processAudioChunk(e.data);
          } catch (error) {
            console.error('Error processing audio chunk:', error);
          } finally {
            setIsProcessing(false);
          }
        }
      }
    };
    
    return () => {
      mediaRecorder.ondataavailable = null;
    };
  }, [mediaRecorder, isRecording, isProcessing, setIsProcessing]);

  const getAudioChunks = () => audioChunksRef.current;
  const clearAudioChunks = () => {
    audioChunksRef.current = [];
  };

  return {
    getAudioChunks,
    clearAudioChunks
  };
};
