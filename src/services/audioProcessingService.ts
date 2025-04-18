
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AudioProcessingService {
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;
  private currentTranscript: string = '';
  private transcriptCallback: ((transcript: string) => void) | null = null;

  public async processAudioChunk(audioChunk: Blob) {
    try {
      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      const transcription = data?.transcription || '';
      if (transcription && transcription.trim() !== '') {
        this.currentTranscript += ' ' + transcription;
        
        // Call the callback if it exists
        if (this.transcriptCallback) {
          this.transcriptCallback(this.currentTranscript);
        }
      }
      
      return transcription;
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
      toast.error('Error processing audio');
      return '';
    }
  }

  public setTranscriptCallback(callback: (transcript: string) => void) {
    this.transcriptCallback = callback;
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
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
