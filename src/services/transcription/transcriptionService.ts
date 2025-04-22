
import { toast } from 'sonner';
import { TranscriptionAPIConfig } from './types';
import { WebSpeechService } from './webSpeechService';
import { arrayBufferToBase64 } from './audioUtils';

export class TranscriptionService {
  private webSpeechService: WebSpeechService;
  private onTranscriptUpdateCallback: ((transcript: string) => void) | null = null;
  private onFeedbackCallback: ((feedback: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';
  private isRecognitionActive: boolean = false;
  private apiConfig: TranscriptionAPIConfig | null = null;
  private isUsingAPI: boolean = false;
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

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
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        } else {
          toast.error(error);
        }
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

      console.log(`Processing audio chunk. Size: ${audioChunk.size} bytes, Type: ${audioChunk.type}`);

      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = arrayBufferToBase64(arrayBuffer);
      
      const payload = JSON.stringify({
        audio: base64Audio,
        language: this.apiConfig.language,
      });

      console.log('Sending audio to Supabase edge function...');
      
      const response = await fetch('https://xqbazrlsytdhzfitmtcc.functions.supabase.co/transcribe-and-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.apiKey}`,
        },
        body: payload
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.transcription) {
        console.log('Received transcription:', data.transcription);
        this.finalTranscript += ' ' + data.transcription;
        
        if (this.onTranscriptUpdateCallback) {
          this.onTranscriptUpdateCallback(data.transcription);
        }
      }
      
      if (data.feedback) {
        console.log('Received feedback:', data.feedback);
        if (this.onFeedbackCallback) {
          this.onFeedbackCallback(data.feedback);
        }
      }
      
      // Reset retry counter on success
      this.retryCount = 0;
      
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying transcription (${this.retryCount}/${this.maxRetries})...`);
        // Put the chunk back at the front of the queue for retry
        if (this.audioQueue.length > 0) {
          this.audioQueue.unshift(this.audioQueue[0]);
        }
      } else {
        // After max retries, report the error
        this.retryCount = 0;
        if (this.onErrorCallback) {
          this.onErrorCallback(`Transcription failed: ${error.message}`);
        } else {
          toast.error('Error connecting to transcription service');
        }
      }
    } finally {
      this.isProcessingAudio = false;
      
      // Process next chunk if available
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
    this.retryCount = 0;
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
  
  public onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }
  
  public unsubscribeError(callback: (error: string) => void) {
    if (this.onErrorCallback === callback) {
      this.onErrorCallback = null;
    }
  }

  public updateTranscript(transcript: string) {
    if (transcript && transcript.trim()) {
      this.finalTranscript += ' ' + transcript;
      if (this.onTranscriptUpdateCallback) {
        this.onTranscriptUpdateCallback(transcript);
      }
    }
  }

  public updateFeedback(feedback: string) {
    if (feedback && feedback.trim() && this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    }
  }

  public reportError(error: string) {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  public getCurrentTranscript(): string {
    return this.finalTranscript + ' ' + this.interimTranscript;
  }
}

// Create a singleton instance to be used throughout the app
export const transcriptionService = new TranscriptionService();
