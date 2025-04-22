
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcription';
import { supabase } from '@/integrations/supabase/client';

export const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { isRecording, setIsRecording, currentSession, updateRecordingTime, currentSection } = useSession();
  
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000
        } 
      });
      setAudioStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      setError('Microphone permission denied. Please allow microphone access.');
      toast.error('Microphone permission denied. Please allow microphone access.');
      return null;
    }
  };

  useEffect(() => {
    if (audioStream) {
      // Use audio/webm;codecs=opus format which is supported by OpenAI
      const recorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          
          if (isRecording && currentSession) {
            try {
              const base64Audio = await blobToBase64(e.data);
              
              const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
                body: JSON.stringify({
                  audio: base64Audio,
                  section: currentSection
                })
              });

              if (error) {
                console.error('Edge function error:', error);
                throw error;
              }
              
              if (data?.transcription) {
                console.log('Received transcription:', data.transcription);
                transcriptionService.updateTranscript(data.transcription);
              }
              
              if (data?.feedback) {
                console.log('Received feedback:', data.feedback);
                transcriptionService.updateFeedback(data.feedback);
              }
            } catch (err) {
              console.error('Transcription error:', err);
            }
          }
        }
      };
      
      setMediaRecorder(recorder);
      
      return () => {
        recorder.ondataavailable = null;
      };
    }
  }, [audioStream, isRecording, currentSession, currentSection]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    if (!audioStream) {
      const stream = await requestMicrophonePermission();
      if (!stream) return false;
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      audioChunksRef.current = [];
      mediaRecorder.start(2000); // Capture audio every 2 seconds
      setIsRecording(true);
      return true;
    }
    return false;
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      return new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
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
    isRecording,
    error,
    getLatestAudioChunk,
    getAllAudioChunks,
    audioChunksRef
  };
};
