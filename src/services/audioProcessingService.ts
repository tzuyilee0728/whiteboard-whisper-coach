
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AudioProcessingService {
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;
  private currentTranscript: string = '';
  private transcriptCallback: ((transcript: string) => void) | null = null;
  private debugMode: boolean = true;

  private log(...args: any[]) {
    if (this.debugMode) {
      console.log('[AudioProcessingService]', ...args);
    }
  }

  public async processAudioChunk(audioChunk: Blob) {
    try {
      this.log('Processing audio chunk, size:', audioChunk.size, 'bytes');
      
      // Ignore tiny audio chunks (probably silence)
      if (audioChunk.size < 100) {
        this.log('Audio chunk too small, likely silence - skipping');
        return '';
      }
      
      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      this.log('Sending audio to server for transcription, base64 length:', base64Audio.length);
      
      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const transcription = data?.transcription || '';
      this.log('Received transcription:', transcription);
      
      if (transcription && transcription.trim() !== '') {
        this.currentTranscript += ' ' + transcription;
        this.currentTranscript = this.currentTranscript.trim();
        
        // Call the callback if it exists
        if (this.transcriptCallback) {
          this.log('Calling transcript callback with updated text');
          this.transcriptCallback(this.currentTranscript);
        }
      } else {
        this.log('No transcription received from server');
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
    this.log('Transcript callback set');
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  public resetTranscript(): void {
    this.log('Resetting transcript');
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
