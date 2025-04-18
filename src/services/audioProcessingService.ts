
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AudioProcessingService {
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;

  public async processAudioChunk(audioChunk: Blob) {
    try {
      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      return data?.transcription || '';
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
      toast.error('Error processing audio');
      return '';
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  }
}

export const audioProcessingService = new AudioProcessingService();
