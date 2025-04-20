
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AudioProcessingService {
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;
  private currentTranscript: string = '';
  private transcriptCallback: ((transcript: string) => void) | null = null;
  private debugMode: boolean = true;
  private processingTimerId: ReturnType<typeof setTimeout> | null = null;
  private processingErrors: number = 0;
  private maxErrors: number = 5;

  private log(...args: any[]) {
    if (this.debugMode) {
      console.log('[AudioProcessingService]', ...args);
    }
  }

  public async processAudioChunk(audioChunk: Blob) {
    try {
      this.log('Processing audio chunk, size:', audioChunk.size, 'bytes');
      
      // Ignore tiny audio chunks (probably silence)
      if (audioChunk.size < 1000) {
        this.log('Audio chunk too small, likely silence - skipping');
        return '';
      }

      // Add to queue and process if not already processing
      this.audioQueue.push(audioChunk);
      
      if (!this.isProcessingAudio) {
        this.processQueue();
      }
      
      return '';
    } catch (error) {
      console.error('Error queueing audio chunk:', error);
      return '';
    }
  }

  private async processQueue() {
    if (this.audioQueue.length === 0 || this.isProcessingAudio) {
      return;
    }

    this.isProcessingAudio = true;

    try {
      // Process multiple chunks together for better results
      const combinedChunks = this.combineAudioChunks(this.audioQueue.splice(0, Math.min(3, this.audioQueue.length)));
      this.log('Processing combined audio chunk, size:', combinedChunks.size, 'bytes');
      
      const arrayBuffer = await combinedChunks.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      this.log('Sending audio to server for transcription, base64 length:', base64Audio.length);
      
      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: { audio: base64Audio }
      });

      if (error) {
        this.processingErrors++;
        console.error('Supabase function error:', error);
        
        if (this.processingErrors > this.maxErrors) {
          toast.error('Too many errors processing audio. Please try again later.');
          this.processingErrors = 0;
          this.audioQueue = []; // Clear queue after too many errors
        }
        
        throw error;
      }

      const transcription = data?.transcription || '';
      this.log('Received transcription:', transcription);
      
      if (transcription && transcription.trim() !== '') {
        this.currentTranscript += ' ' + transcription;
        this.currentTranscript = this.currentTranscript.trim();
        
        // Reset error counter on success
        this.processingErrors = 0;
        
        // Call the callback if it exists
        if (this.transcriptCallback) {
          this.log('Calling transcript callback with updated text');
          this.transcriptCallback(this.currentTranscript);
        }
      } else {
        this.log('No transcription received from server');
      }
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
    } finally {
      this.isProcessingAudio = false;
      
      // Process next chunks if any
      if (this.audioQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  private combineAudioChunks(chunks: Blob[]): Blob {
    if (chunks.length === 1) return chunks[0];
    
    this.log(`Combining ${chunks.length} audio chunks`);
    return new Blob(chunks, { type: chunks[0].type });
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
