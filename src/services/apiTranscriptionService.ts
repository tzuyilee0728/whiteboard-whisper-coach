
import { toast } from 'sonner';

export interface TranscriptionAPIConfig {
  apiKey: string;
  apiUrl: string;
  language: string;
}

export class APITranscriptionService {
  private apiConfig: TranscriptionAPIConfig | null = null;
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;
  private onTranscriptCallback: ((transcript: string) => void) | null = null;
  private transcript: string = '';

  public configure(config: TranscriptionAPIConfig) {
    this.apiConfig = config;
    console.log('API Transcription service configured');
  }

  public async processAudioChunk(audioChunk: Blob) {
    if (!this.apiConfig) return;

    this.audioQueue.push(audioChunk);
    
    if (!this.isProcessingAudio) {
      this.processAudioQueue();
    }
  }

  private async processAudioQueue() {
    if (this.audioQueue.length === 0 || this.isProcessingAudio) {
      return;
    }

    this.isProcessingAudio = true;
    
    try {
      const audioChunk = this.audioQueue.shift();
      
      if (!audioChunk || !this.apiConfig) {
        this.isProcessingAudio = false;
        return;
      }

      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      const payload = JSON.stringify({
        audio: base64Audio,
        language: this.apiConfig.language,
      });

      const response = await fetch(this.apiConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.apiKey}`,
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.text || data.transcript) {
        const transcriptText = data.text || data.transcript;
        this.transcript += ' ' + transcriptText;
        
        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(this.transcript);
        }
      }
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
      if (this.audioQueue.length === 0) {
        toast.error('Error connecting to transcription API');
      }
    } finally {
      this.isProcessingAudio = false;
      
      if (this.audioQueue.length > 0) {
        setTimeout(() => this.processAudioQueue(), 100);
      }
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

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    this.onTranscriptCallback = callback;
  }

  public reset() {
    this.transcript = '';
    this.audioQueue = [];
  }

  public getCurrentTranscript(): string {
    return this.transcript;
  }
}
