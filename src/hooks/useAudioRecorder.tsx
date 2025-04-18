
import { useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';
import { useAudioStream } from './useAudioStream';
import { useMediaRecorder } from './useMediaRecorder';

export const useAudioRecorder = () => {
  const { isRecording, setIsRecording, currentSession, updateRecordingTime, isPaused } = useSession();
  const { audioStream, error, requestMicrophonePermission } = useAudioStream();
  const { startRecording: startMediaRecording, stopRecording: stopMediaRecording, audioChunksRef } = useMediaRecorder(audioStream);

  // Auto-start recording when isRecording becomes true
  useEffect(() => {
    if (isRecording && !audioStream) {
      console.log("No audioStream yet, requesting microphone permission");
      requestMicrophonePermission();
    } else if (isRecording && audioStream) {
      startMediaRecording();
    }
  }, [isRecording, audioStream]);

  // Start recording function
  const startRecording = async () => {
    console.log("startRecording called");
    if (!audioStream) {
      console.log("No audio stream, requesting microphone permission");
      const stream = await requestMicrophonePermission();
      if (!stream) {
        console.log("Failed to get microphone permission");
        return;
      }
    }
    
    setIsRecording(true);
    console.log("isRecording set to true");
  };

  // Stop recording function
  const stopRecording = () => {
    console.log("stopRecording called");
    setIsRecording(false);
    return stopMediaRecording();
  };

  // Get latest audio chunk for real-time processing
  const getLatestAudioChunk = () => {
    if (audioChunksRef.current.length > 0) {
      return audioChunksRef.current[audioChunksRef.current.length - 1];
    }
    return null;
  };

  // Get all audio chunks
  const getAllAudioChunks = () => {
    return audioChunksRef.current;
  };
  
  // Get all audio as a single blob
  const getAllAudioAsBlob = () => {
    if (audioChunksRef.current.length === 0) return null;
    return new Blob(audioChunksRef.current, { type: 'audio/webm' });
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    error,
    getLatestAudioChunk,
    getAllAudioChunks,
    getAllAudioAsBlob,
    audioChunksRef
  };
};
