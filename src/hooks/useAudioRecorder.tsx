
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
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isRecording, setIsRecording, currentSession, updateRecordingTime } = useSession();
  const hasInitializedRef = useRef(false);
  
  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
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

  // Initialize microphone as early as possible
  useEffect(() => {
    if (!hasInitializedRef.current) {
      requestMicrophonePermission();
      hasInitializedRef.current = true;
    }
    
    // Setup automatic chunk processing
    return () => {
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
      }
    };
  }, []);

  // Initialize media recorder when audio stream is available
  useEffect(() => {
    if (audioStream) {
      console.log('Audio stream available, initializing MediaRecorder');
      
      // Use a consistent encoding format that works well with speech recognition
      const options: MediaRecorderOptions = { 
        mimeType: 'audio/webm' 
      };
      
      // Check if the preferred MIME type is supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported, falling back to default`);
        // Let the browser choose the format
        const recorder = new MediaRecorder(audioStream);
        setMediaRecorder(recorder);
      } else {
        // Use our preferred format
        const recorder = new MediaRecorder(audioStream, options);
        setMediaRecorder(recorder);
      }
    }
  }, [audioStream]);

  // Set up data handling when mediaRecorder is available
  useEffect(() => {
    if (!mediaRecorder) return;
    
    mediaRecorder.ondataavailable = async (e) => {
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
    
    return () => {
      mediaRecorder.ondataavailable = null;
    };
  }, [mediaRecorder, isRecording, isProcessing]);

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
      mediaRecorder.start(1000); // Get data every second for more frequent updates
      console.log('MediaRecorder started with state:', mediaRecorder.state);
      setIsRecording(true);
      
      // Show success toast
      toast.success('Recording started');
    } else {
      console.warn('Cannot start recording - recorder not initialized or already recording');
      
      // If recorder is not initialized, try to initialize it
      if (!mediaRecorder) {
        const stream = await requestMicrophonePermission();
        if (stream) {
          toast.info('Please try recording again in a moment');
        }
      }
    }
  };

  // Stop recording function
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
