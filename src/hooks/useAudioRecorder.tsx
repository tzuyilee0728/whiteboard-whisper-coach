
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { transcriptionService } from '@/services/transcriptionService';
import { requestMicrophonePermission, checkMicrophonePermission, type PermissionStatus } from '@/utils/microphonePermission';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { toast } from 'sonner';

export const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('initial');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasInitializedRef = useRef(false);
  
  const { mediaRecorder } = useMediaRecorder(audioStream);

  useEffect(() => {
    const initializeMicrophone = async () => {
      if (!hasInitializedRef.current) {
        const { stream, status, error: micError } = await requestMicrophonePermission();
        setAudioStream(stream);
        setPermissionStatus(status);
        setError(micError);
        hasInitializedRef.current = true;
      }
    };

    initializeMicrophone();
  }, []);

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
  }, [mediaRecorder, isRecording, isProcessing]);

  const startRecording = async () => {
    console.log('Starting recording, audioStream exists:', !!audioStream);
    
    if (!audioStream) {
      const { stream, status, error: micError } = await requestMicrophonePermission();
      if (!stream) {
        setError(micError);
        return;
      }
      setAudioStream(stream);
      setPermissionStatus(status);
      setError(null);
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      audioChunksRef.current = [];
      
      console.log('Initializing transcription service');
      transcriptionService.start();
      
      mediaRecorder.start(1000);
      console.log('MediaRecorder started with state:', mediaRecorder.state);
      setIsRecording(true);
      
      toast.success('Recording started');
    } else {
      console.warn('Cannot start recording - recorder not initialized or already recording');
      
      if (!mediaRecorder) {
        const hasPermission = await checkMicrophonePermission();
        if (hasPermission) {
          toast.info('Please try recording again in a moment');
        }
      }
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording, mediaRecorder state:', mediaRecorder?.state);
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      transcriptionService.stop();
      setIsRecording(false);
      toast.info('Recording stopped');
      return new Blob(audioChunksRef.current, { type: 'audio/webm' });
    }
    return null;
  };

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  return {
    startRecording,
    stopRecording,
    requestMicrophonePermission,
    checkMicrophonePermission,
    permissionStatus,
    audioStream,
    mediaRecorder,
    error,
    isRecording,
    isProcessing
  };
};
