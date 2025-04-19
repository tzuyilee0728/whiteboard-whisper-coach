
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';

export const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioChunksRef = useRef<Blob[]>([]);
  const { isRecording, setIsRecording, currentSession, updateRecordingTime } = useSession();
  
  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      setAudioStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      console.error('Microphone permission error:', err);
      setError('Microphone permission denied. Please allow microphone access.');
      toast.error('Microphone permission denied. Please allow microphone access.');
      return null;
    }
  };

  // Initialize media recorder when audio stream is available
  useEffect(() => {
    if (audioStream) {
      console.log('Audio stream available, initializing MediaRecorder');
      const recorder = new MediaRecorder(audioStream, { 
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg' 
      });
      
      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          console.log(`Audio data available: ${e.data.size} bytes`);
          audioChunksRef.current.push(e.data);
          
          // Send the latest audio chunk to the transcription service
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
      
      setMediaRecorder(recorder);
      
      return () => {
        recorder.ondataavailable = null;
      };
    }
  }, [audioStream, isRecording]);

  // Start recording function
  const startRecording = async () => {
    console.log('Starting recording, audioStream exists:', !!audioStream);
    
    if (!audioStream) {
      const stream = await requestMicrophonePermission();
      if (!stream) return;
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      audioChunksRef.current = [];
      // Initialize the transcription service
      console.log('Initializing transcription service');
      const initialized = transcriptionService.start();
      console.log('Transcription service initialized:', initialized);
      
      // Start recording in smaller chunks for real-time processing
      mediaRecorder.start(500); // Get data every 500ms for more frequent updates
      console.log('MediaRecorder started');
      setIsRecording(true);
    } else {
      console.warn('Cannot start recording - recorder not initialized or already recording');
    }
  };

  // Stop recording function
  const stopRecording = () => {
    console.log('Stopping recording, mediaRecorder state:', mediaRecorder?.state);
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      transcriptionService.stop();
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
