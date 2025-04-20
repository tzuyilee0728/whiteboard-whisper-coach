
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';

export const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { isRecording, setIsRecording, currentSession, updateRecordingTime } = useSession();
  
  // Request microphone access
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      setError('Microphone permission denied. Please allow microphone access.');
      toast.error('Microphone permission denied. Please allow microphone access.');
      return null;
    }
  };

  // Initialize media recorder when audio stream is available
  useEffect(() => {
    if (audioStream) {
      const recorder = new MediaRecorder(audioStream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          
          // Send the latest audio chunk to the transcription service
          if (isRecording) {
            transcriptionService.processAudioChunk(e.data);
          }
        }
      };
      
      setMediaRecorder(recorder);
      
      return () => {
        recorder.ondataavailable = null;
      };
    }
  }, [audioStream, isRecording]);

  // Start recording function
  const startRecording = async () => {
    if (!audioStream) {
      const stream = await requestMicrophonePermission();
      if (!stream) return;
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      audioChunksRef.current = [];
      mediaRecorder.start(1000); // Capture in 1-second chunks for real-time processing
      setIsRecording(true);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      return new Blob(audioChunksRef.current, { type: 'audio/webm' });
    }
    return null;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  // Return the latest audio chunk for real-time processing
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

  return {
    startRecording,
    stopRecording,
    isRecording,
    error,
    getLatestAudioChunk,
    getAllAudioChunks,
    audioChunksRef
  };
};
