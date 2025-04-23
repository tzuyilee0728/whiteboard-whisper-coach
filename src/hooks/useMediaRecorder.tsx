
import { useEffect, useRef, useState } from "react";
import { blobToBase64, getAudioMimeType } from "@/utils/audioUtils";
import { transcriptionService } from "@/services/transcription";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/supabaseAuth";

/**
 * Custom hook to encapsulate MediaRecorder setup and events.
 */
export const useMediaRecorderWithStream = ({
  audioStream,
  isRecording,
  setIsRecording,
  currentSession,
  currentSection,
  isPaused,
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Extract the MediaRecorder setup out of useAudioRecorder
  useEffect(() => {
    if (!audioStream) return;

    const mimeType = getAudioMimeType();
    let recorder: MediaRecorder | null = null;
    try {
      recorder = new MediaRecorder(audioStream, { mimeType });

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0 && !isPaused) {
          audioChunksRef.current.push(e.data);

          if (isRecording && currentSession) {
            try {
              const base64Audio = await blobToBase64(e.data);

              try {
                const accessToken = await getAccessToken();

                const response = await fetch(
                  'https://xqbazrlsytdhzfitmtcc.functions.supabase.co/transcribe-and-analyze',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                      audio: base64Audio,
                      section: currentSection,
                    }),
                  }
                );

                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`Function returned error ${response.status}: ${errorText}`);
                }

                const data = await response.json();

                if (data?.transcription) {
                  transcriptionService.updateTranscript(data.transcription);
                }

                if (data?.feedback) {
                  transcriptionService.updateFeedback(data.feedback);
                }

                if (data?.error) {
                  transcriptionService.reportError(data.error);
                }
              } catch (err: any) {
                transcriptionService.reportError(`Failed to call edge function: ${err.message || 'Unknown error'}`);
              }
            } catch (err: any) {
              transcriptionService.reportError(`Failed to process audio: ${err.message || 'Unknown error'}`);
            }
          }
        }
      };

      recorder.onerror = (event) => {
        toast.error("Recording error occurred. Please try again.");
      };

      // Only start on mount if necessary
      if (isRecording && !isPaused && recorder.state === "inactive") {
        recorder.start(2000);
      }

      setMediaRecorder(recorder);

      // Clean up
      return () => {
        recorder.ondataavailable = null;
        recorder.onerror = null;
        if (recorder.state === "recording") recorder.stop();
      };
    } catch (err: any) {
      setError(`Could not start recording: ${err.message || "Unknown error"}`);
      toast.error(`Could not start recording: ${err.message || "Unknown error"}`);
      setMediaRecorder(null);
      return () => {};
    }
  // Only re-run if key dependencies change
  }, [audioStream, isRecording, currentSession, currentSection, isPaused]);

  // Pause or resume based on external state changes
  useEffect(() => {
    if (!mediaRecorder) return;
    try {
      if (isPaused && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      } else if (!isPaused && mediaRecorder.state === "inactive" && isRecording) {
        audioChunksRef.current = [];
        mediaRecorder.start(2000);
      }
    } catch (err) {
      // Already handled error elsewhere
    }
  }, [isPaused, mediaRecorder, isRecording]);

  // API methods
  const startRecording = async () => {
    if (!mediaRecorder) return false;
    try {
      if (mediaRecorder.state !== "recording") {
        audioChunksRef.current = [];
        mediaRecorder.start(2000);
        setIsRecording(true);
      }
      return true;
    } catch (err: any) {
      toast.error(`Could not start recording: ${err.message || "Unknown error"}`);
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      try {
        mediaRecorder.stop();
        setIsRecording(false);
        return new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
      } catch (err: any) {
        toast.error(`Could not stop recording: ${err.message || "Unknown error"}`);
        return null;
      }
    }
    return null;
  };

  return {
    startRecording,
    stopRecording,
    error,
    audioChunksRef,
    getLatestAudioChunk: () =>
      audioChunksRef.current.length > 0
        ? audioChunksRef.current[audioChunksRef.current.length - 1]
        : null,
    getAllAudioChunks: () => audioChunksRef.current,
  };
};
