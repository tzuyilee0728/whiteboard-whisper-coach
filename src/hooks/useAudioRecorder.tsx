
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';

export const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'initial' | 'granted' | 'denied'>('initial');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasInitializedRef = useRef(false);

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
      setPermissionStatus('granted');
      setError(null);
      return stream;
    } catch (err) {
      console.error('Microphone permission error:', err);
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Microphone access was denied. Please allow microphone permissions in your browser settings.');
            toast.error('Microphone access denied. Please check your browser settings.');
            break;
          case 'NotFoundError':
            setError('No microphone device found. Please connect a microphone.');
            toast.error('No microphone detected. Please connect a microphone.');
            break;
          default:
            setError('Unable to access microphone. An unknown error occurred.');
            toast.error('Microphone access failed');
        }
      }
      
      setPermissionStatus('denied');
      return null;
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputDevices.length === 0) {
        toast.warning('No microphone devices found');
        setPermissionStatus('denied');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking microphone devices:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeMicrophone = async () => {
      if (!hasInitializedRef.current) {
        await requestMicrophonePermission();
        hasInitializedRef.current = true;
      }
    };

    initializeMicrophone();
  }, []);

  useEffect(() => {
    if (audioStream) {
      console.log('Audio stream available, initializing MediaRecorder');
      
      const options: MediaRecorderOptions = { 
        mimeType: 'audio/webm' 
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported, falling back to default`);
        const recorder = new MediaRecorder(audioStream);
        setMediaRecorder(recorder);
      } else {
        const recorder = new MediaRecorder(audioStream, options);
        setMediaRecorder(recorder);
      }
    }
  }, [audioStream]);

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
      const stream = await requestMicrophonePermission();
      if (!stream) return;
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      audioChunksRef.current = [];
      
      console.log('Initializing transcription service');
      const initialized = transcriptionService.start();
      console.log('Transcription service initialized:', initialized);
      
      mediaRecorder.start(1000);
      console.log('MediaRecorder started with state:', mediaRecorder.state);
      setIsRecording(true);
      
      toast.success('Recording started');
    } else {
      console.warn('Cannot start recording - recorder not initialized or already recording');
      
      if (!mediaRecorder) {
        const stream = await requestMicrophonePermission();
        if (stream) {
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

  const getLatestAudioChunk = () => {
    if (audioChunksRef.current.length > 0) {
      return audioChunksRef.current[audioChunksRef.current.length - 1];
    }
    return null;
  };

  const getAllAudioChunks = () => {
    return audioChunksRef.current;
  };

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
