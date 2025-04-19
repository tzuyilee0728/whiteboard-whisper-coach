
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AudioProcessingService {
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;
  private currentTranscript: string = '';
  private transcriptCallback: ((transcript: string) => void) | null = null;

  public async processAudioChunk(audioChunk: Blob) {
    try {
      console.log('Processing audio chunk, size:', audioChunk.size);
      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const transcription = data?.transcription || '';
      console.log('Received transcription:', transcription);
      
      if (transcription && transcription.trim() !== '') {
        this.currentTranscript += ' ' + transcription;
        this.currentTranscript = this.currentTranscript.trim();
        
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
    console.log('Transcript callback set in audioProcessingService');
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  public resetTranscript(): void {
    this.currentTranscript = '';
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
