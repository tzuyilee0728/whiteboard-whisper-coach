
import { useCallback } from 'react';
import { AudioRecording } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { arrayBufferToBase64 } from '@/utils/audioUtils';
import { toast } from 'sonner';

export const useSessionRecording = (state: ReturnType<typeof import('./useSessionState').useSessionState>) => {
  const saveRecordingToDatabase = async (audioBlob: Blob, sessionId: string) => {
    try {
      if (!audioBlob || audioBlob.size === 0) {
        console.error("No audio data to save");
        return;
      }
      
      console.log(`Saving recording for session ${sessionId}, size: ${audioBlob.size} bytes`);
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = arrayBufferToBase64(arrayBuffer);
      
      const { data, error } = await supabase.rpc('save_session_recording', {
        p_session_id: sessionId,
        p_audio_data: base64Audio
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Recording saved successfully:", data);
      toast.success("Session recording saved to database");
      
    } catch (err) {
      console.error("Error saving recording:", err);
      toast.error("Failed to save recording");
    }
  };

  const addRecording = useCallback((recording: AudioRecording) => {
    state.setAudioRecordings(prev => [...prev, recording]);
  }, [state]);

  return {
    saveRecordingToDatabase,
    addRecording
  };
};
