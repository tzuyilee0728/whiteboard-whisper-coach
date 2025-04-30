
import { TranscriptionAPIConfig } from './types';
import { arrayBufferToBase64 } from './audioUtils';
import { toast } from 'sonner';

export class ApiTranscriptionService {
  private apiConfig: TranscriptionAPIConfig | null = null;
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;
  private onTranscriptCallback: ((transcript: string) => void) | null = null;

  constructor() {}

  public configure(config: TranscriptionAPIConfig) {
    this.apiConfig = config;
    console.log('API Transcription Service configured');
  }

  public setTranscriptCallback(callback: (transcript: string) => void) {
    this.onTranscriptCallback = callback;
  }

  public async processAudioChunk(audioChunk: Blob) {
    if (!this.apiConfig) {
      console.log('API not configured, skipping audio processing');
      return;
    }

    this.audioQueue.push(audioChunk);
    
    // Process the audio queue if not already processing
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

      // Convert blob to base64 for API transmission
      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = arrayBufferToBase64(arrayBuffer);
      
      // Create payload based on the API requirements
      const payload = JSON.stringify({
        audio: base64Audio,
        language: this.apiConfig.language,
      });

      // Make API request
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
      
      // Update transcript with API response
      if (data.text || data.transcript) {
        const transcriptText = data.text || data.transcript;
        
        // Update UI through callback
        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(transcriptText);
        }
      }
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
      // Only show one toast error to avoid spamming
      if (this.audioQueue.length === 0) {
        console.error('Error connecting to transcription API');
      }
    } finally {
      this.isProcessingAudio = false;
      
      // Process next chunk if available
      if (this.audioQueue.length > 0) {
        setTimeout(() => this.processAudioQueue(), 100);
      }
    }
  }

  public clearQueue() {
    this.audioQueue = [];
    this.isProcessingAudio = false;
  }
}
