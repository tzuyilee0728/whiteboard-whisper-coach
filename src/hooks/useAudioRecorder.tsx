
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';

export const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { isRecording, setIsRecording, currentSession, updateRecordingTime, isPaused } = useSession();
  
  // Request microphone access
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setError(null);
      console.log("Microphone access granted");
      return stream;
    } catch (err) {
      const errorMessage = 'Microphone permission denied. Please allow microphone access.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Microphone error:", err);
      return null;
    }
  };

  // Initialize media recorder when audio stream is available
  useEffect(() => {
    if (audioStream) {
      try {
        const recorder = new MediaRecorder(audioStream);
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
            console.log(`Audio chunk captured: ${e.data.size} bytes`);
            
            // Dispatch audio data as custom event for TranscriptionView to process
            const audioDataEvent = new CustomEvent('audioData', { 
              detail: e.data
            });
            window.dispatchEvent(audioDataEvent);
            
            // Send the latest audio chunk to the transcription service
            if (isRecording && !isPaused && currentSession) {
              transcriptionService.processAudioChunk(e.data);
            }
          }
        };
        
        setMediaRecorder(recorder);
        console.log("MediaRecorder initialized successfully");
        
        return () => {
          recorder.ondataavailable = null;
        };
      } catch (err) {
        console.error("Error initializing MediaRecorder:", err);
        setError("Failed to initialize audio recorder");
      }
    }
  }, [audioStream, isRecording, isPaused, currentSession]);

  // Auto-start recording when isRecording becomes true
  useEffect(() => {
    console.log("Recording state changed:", isRecording, "MediaRecorder state:", mediaRecorder?.state);
    
    if (isRecording && !mediaRecorder) {
      console.log("No mediaRecorder yet, requesting microphone permission");
      // Request microphone permission and start recording
      requestMicrophonePermission().then((stream) => {
        if (stream) {
          console.log("Got stream, mediaRecorder will be set up in the next effect");
          // The mediaRecorder will be set in the other useEffect
        }
      });
    } else if (isRecording && mediaRecorder && mediaRecorder.state !== 'recording') {
      try {
        audioChunksRef.current = [];
        mediaRecorder.start(1000); // Capture in 1-second chunks for real-time processing
        console.log("MediaRecorder started");
      } catch (err) {
        console.error("Error starting MediaRecorder:", err);
        setError("Failed to start audio recording");
      }
    } else if (!isRecording && mediaRecorder && mediaRecorder.state === 'recording') {
      try {
        mediaRecorder.stop();
        console.log("MediaRecorder stopped");
      } catch (err) {
        console.error("Error stopping MediaRecorder:", err);
      }
    }
  }, [isRecording, mediaRecorder]);

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
    
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      try {
        audioChunksRef.current = [];
        mediaRecorder.start(1000); // Capture in 1-second chunks for real-time processing
        setIsRecording(true);
        console.log("Recording started via startRecording()");
      } catch (err) {
        console.error("Error in startRecording:", err);
        setError("Failed to start recording");
      }
    } else if (!mediaRecorder) {
      // If mediaRecorder isn't ready yet, just set isRecording to true
      // and let the useEffect handle it when mediaRecorder is ready
      setIsRecording(true);
      console.log("isRecording set to true, waiting for mediaRecorder");
    }
  };

  // Stop recording function
  const stopRecording = () => {
    console.log("stopRecording called");
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      try {
        mediaRecorder.stop();
        setIsRecording(false);
        console.log("Recording stopped via stopRecording()");
        
        // Create a combined blob of all audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        return audioBlob;
      } catch (err) {
        console.error("Error in stopRecording:", err);
        setError("Failed to stop recording");
      }
    }
    return null;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => {
          track.stop();
          console.log("Audio track stopped on cleanup");
        });
      }
      
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        try {
          mediaRecorder.stop();
          console.log("MediaRecorder stopped on cleanup");
        } catch (err) {
          console.error("Error stopping MediaRecorder on cleanup:", err);
        }
      }
    };
  }, [audioStream, mediaRecorder]);

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
