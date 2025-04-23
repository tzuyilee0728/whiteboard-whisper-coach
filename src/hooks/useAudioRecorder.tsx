
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcription';
import { supabase } from '@/integrations/supabase/client';
import { useAudioStream } from './useAudioStream';
import { blobToBase64, getAudioMimeType } from '@/utils/audioUtils';

export const useAudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { 
    isRecording, 
    setIsRecording, 
    currentSession, 
    updateRecordingTime, 
    currentSection, 
    isPaused 
  } = useSession();

  const { 
    audioStream, 
    requestMicrophonePermission, 
    error: streamError 
  } = useAudioStream();

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || "";
  };

  useEffect(() => {
    if (audioStream) {
      const mimeType = getAudioMimeType();
      console.log(`Using MediaRecorder with MIME type: ${mimeType}`);

      try {
        const recorder = new MediaRecorder(audioStream, { mimeType });

        recorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && !isPaused) {
            console.log(`Audio chunk received: ${e.data.size} bytes, type: ${e.data.type}`);
            audioChunksRef.current.push(e.data);

            if (isRecording && currentSession) {
              try {
                const base64Audio = await blobToBase64(e.data);
                console.log('Sending audio chunk to edge function...');
                
                try {
                  const accessToken = await getAccessToken();
                  
                  const response = await fetch('https://xqbazrlsytdhzfitmtcc.functions.supabase.co/transcribe-and-analyze', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                      audio: base64Audio,
                      section: currentSection,
                    }),
                  });

                  if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Function returned error ${response.status}: ${errorText}`);
                  }

                  const data = await response.json();
                  console.log('Edge function response:', data);

                  if (data?.transcription) {
                    console.log('Received transcription:', data.transcription);
                    transcriptionService.updateTranscript(data.transcription);
                  }

                  if (data?.feedback) {
                    console.log('Received feedback:', data.feedback);
                    transcriptionService.updateFeedback(data.feedback);
                  }

                  if (data?.error) {
                    console.error('Edge function reported error:', data.error);
                    transcriptionService.reportError(data.error);
                  }
                } catch (err: any) {
                  console.error('Error calling edge function:', err);
                  transcriptionService.reportError(`Failed to call edge function: ${err.message || 'Unknown error'}`);
                }
              } catch (err: any) {
                console.error('Transcription error:', err);
                transcriptionService.reportError(`Failed to process audio: ${err.message || 'Unknown error'}`);
              }
            }
          }
        };

        recorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          toast.error('Recording error occurred. Please try again.');
        };

        if (isRecording && !isPaused && recorder.state === 'inactive') {
          recorder.start(2000);
          console.log('MediaRecorder started with 2s timeslice');
        }

        setMediaRecorder(recorder);

        return () => {
          recorder.ondataavailable = null;
          recorder.onerror = null;
        };
      } catch (err: any) {
        console.error('Error creating MediaRecorder:', err);
        toast.error(`Could not start recording: ${err.message || 'Unknown error'}`);
        return () => {};
      }
    }
  }, [audioStream, isRecording, currentSession, currentSection, isPaused]);

  useEffect(() => {
    if (currentSession && !audioStream) {
      requestMicrophonePermission();
    }
  }, [currentSession]);

  useEffect(() => {
    if (mediaRecorder) {
      try {
        if (isPaused && mediaRecorder.state === 'recording') {
          console.log('Pausing recording');
          mediaRecorder.stop();
        } else if (!isPaused && mediaRecorder.state === 'inactive' && isRecording) {
          console.log('Resuming recording');
          mediaRecorder.start(2000);
        }
      } catch (err) {
        console.error('Error toggling recording state:', err);
      }
    }
  }, [isPaused, mediaRecorder, isRecording]);

  const startRecording = async () => {
    if (!audioStream) {
      const stream = await requestMicrophonePermission();
      if (!stream) return false;
    }

    if (mediaRecorder) {
      try {
        if (mediaRecorder.state !== 'recording') {
          audioChunksRef.current = [];
          mediaRecorder.start(2000);
          setIsRecording(true);
          console.log('Recording started');
        }
        return true;
      } catch (err: any) {
        console.error('Error starting recording:', err);
        toast.error(`Could not start recording: ${err.message || 'Unknown error'}`);
        return false;
      }
    }
    return false;
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      try {
        mediaRecorder.stop();
        setIsRecording(false);
        console.log('Recording stopped');
        return new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
      } catch (err: any) {
        console.error('Error stopping recording:', err);
        toast.error(`Could not stop recording: ${err.message || 'Unknown error'}`);
        return null;
      }
    }
    return null;
  };

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
    error: streamError,
    getLatestAudioChunk,
    getAllAudioChunks,
    audioChunksRef,
  };
};
