
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcription';

export const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { isRecording, setIsRecording, currentSession, updateRecordingTime, currentSection, isPaused } = useSession();

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setAudioStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      const errorMessage = 'Microphone permission denied. Please allow microphone access.';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    if (audioStream) {
      let mimeType = 'audio/webm';

      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      console.log(`Using MediaRecorder with MIME type: ${mimeType}`);

      try {
        const recorder = new MediaRecorder(audioStream, { mimeType });

        recorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && !isPaused) {
            console.log(`Audio chunk received: ${e.data.size} bytes, type: ${e.data.type}`);
            audioChunksRef.current.push(e.data);

            if (isRecording && currentSession) {
              try {
                // Convert blob chunk to base64
                const base64Audio = await blobToBase64(e.data);

                // Send to Supabase edge function
                console.log('Sending audio chunk to edge function...');
                const { data, error: supabaseError } = await fetch(
                  'https://xqbazrlsytdhzfitmtcc.functions.supabase.co/transcribe-and-analyze',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`, // Use env or supabase client if possible, or remove if not needed
                    },
                    body: JSON.stringify({
                      audio: base64Audio,
                      section: currentSection,
                    }),
                  }
                ).then(async (res) => {
                  try {
                    return await res.json();
                  } catch (e) {
                    console.error('Error parsing edge function response as JSON', e);
                    return {};
                  }
                }).catch((fetchError) => {
                  console.error('Error from edge function fetch', fetchError);
                  return { error: fetchError.message };
                });

                if (supabaseError) {
                  console.error('Edge function error:', supabaseError);
                  transcriptionService.reportError(`Connection error: ${supabaseError.message}`);
                  throw supabaseError;
                }

                if (data?.transcription) {
                  console.log('Received transcription:', data.transcription);
                  // Update transcription service with incremental transcript
                  transcriptionService.updateTranscript(data.transcription);
                }

                if (data?.feedback) {
                  console.log('Received feedback:', data.feedback);
                  transcriptionService.updateFeedback(data.feedback);
                }

                if (data?.error) {
                  transcriptionService.reportError(data.error);
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
          setError('Recording error occurred. Please try again.');
        };

        // Start recording if flag is true and not paused
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
        setError(`Could not start recording: ${err.message || 'Unknown error'}`);
        return () => {};
      }
    }
  }, [audioStream, isRecording, currentSession, currentSection, isPaused]);

  useEffect(() => {
    // Automatically request mic and set stream when session starts
    if (currentSession && !audioStream) {
      requestMicrophonePermission();
    }
  }, [currentSession]);

  useEffect(() => {
    // Handle pause/resume mediaRecorder state change
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
        setError(`Could not start recording: ${err.message || 'Unknown error'}`);
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
        setError(`Could not stop recording: ${err.message || 'Unknown error'}`);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
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
    audioChunksRef,
  };
};

