
import { useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { transcriptionService } from '@/services/transcriptionService';
import { requestMicrophonePermission, checkMicrophonePermission } from '@/utils/microphonePermission';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { useRecordingState } from '@/hooks/useRecordingState';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { toast } from 'sonner';

export const useAudioRecorder = () => {
  const {
    audioStream,
    setAudioStream,
    error,
    setError,
    permissionStatus,
    setPermissionStatus,
    isRecording,
    setIsRecording,
    isProcessing,
    setIsProcessing
  } = useRecordingState();

  const hasInitializedRef = useRef(false);
  const { mediaRecorder } = useMediaRecorder(audioStream);
  const { getAudioChunks, clearAudioChunks } = useAudioProcessing(
    mediaRecorder,
    isRecording,
    isProcessing,
    setIsProcessing
  );

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
  }, [setAudioStream, setPermissionStatus, setError]);

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
      clearAudioChunks();
      
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
      return new Blob(getAudioChunks(), { type: 'audio/webm' });
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
