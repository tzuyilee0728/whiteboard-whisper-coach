
import { toast } from 'sonner';
import { TranscriptionAPIConfig } from './types';
import { WebSpeechService } from './webSpeechService';
import { arrayBufferToBase64 } from './audioUtils';

export class TranscriptionService {
  private webSpeechService: WebSpeechService;
  private onTranscriptUpdateCallback: ((transcript: string) => void) | null = null;
  private onFeedbackCallback: ((feedback: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';
  private isRecognitionActive: boolean = false;
  private apiConfig: TranscriptionAPIConfig | null = null;
  private isUsingAPI: boolean = false;
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;

  constructor() {
    this.webSpeechService = new WebSpeechService();
    this.configureWebSpeech();
  }

  private configureWebSpeech() {
    this.webSpeechService.configure(
      (transcript: string) => {
        if (this.onTranscriptUpdateCallback) {
          this.onTranscriptUpdateCallback(transcript);
        }
      },
      (error: string) => {
        toast.error(error);
      }
    );
  }

  public configureAPI(config: TranscriptionAPIConfig) {
    this.apiConfig = config;
    this.isUsingAPI = true;
    console.log('Transcription API configured');
  }

  public async processAudioChunk(audioChunk: Blob) {
    if (!this.isUsingAPI || !this.apiConfig) return;
    
    this.audioQueue.push(audioChunk);
    
    if (!this.isProcessingAudio) {
      this.processAudioQueue();
    }
  }

  private async processAudioQueue() {
    if (this.audioQueue.length === 0 || this.isProcessingAudio) return;

    this.isProcessingAudio = true;
    
    try {
      const audioChunk = this.audioQueue.shift();
      
      if (!audioChunk || !this.apiConfig) {
        this.isProcessingAudio = false;
        return;
      }

      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = arrayBufferToBase64(arrayBuffer);
      
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
        this.finalTranscript += ' ' + transcriptText;
        
        if (this.onTranscriptUpdateCallback) {
          this.onTranscriptUpdateCallback(this.finalTranscript);
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

  public start(): boolean {
    if (this.isUsingAPI && this.apiConfig) {
      this.isRecognitionActive = true;
      return true;
    }
    
    const started = this.webSpeechService.start();
    if (started) {
      this.isRecognitionActive = true;
    }
    return started;
  }

  public stop(): boolean {
    if (this.isUsingAPI) {
      this.isRecognitionActive = false;
      this.audioQueue = [];
      return true;
    }
    
    const stopped = this.webSpeechService.stop();
    if (stopped) {
      this.isRecognitionActive = false;
    }
    return stopped;
  }

  public reset() {
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.audioQueue = [];
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    this.onTranscriptUpdateCallback = callback;
  }

  public unsubscribeTranscriptUpdate(callback: (transcript: string) => void) {
    if (this.onTranscriptUpdateCallback === callback) {
      this.onTranscriptUpdateCallback = null;
    }
  }

  public onFeedback(callback: (feedback: string) => void) {
    this.onFeedbackCallback = callback;
  }

  public unsubscribeFeedback(callback: (feedback: string) => void) {
    if (this.onFeedbackCallback === callback) {
      this.onFeedbackCallback = null;
    }
  }

  public updateTranscript(transcript: string) {
    this.finalTranscript += ' ' + transcript;
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback(transcript);
    }
  }

  public updateFeedback(feedback: string) {
    if (this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    }
  }

  public getCurrentTranscript(): string {
    return this.finalTranscript + ' ' + this.interimTranscript;
  }
}

// Create a singleton instance to be used throughout the app
export const transcriptionService = new TranscriptionService();
