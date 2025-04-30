
import { toast } from 'sonner';
import { WebSocketService } from './websocketService';
import { AudioProcessor } from './audioProcessor';
import { TranscriptionAPIConfig, TranscriptUpdateCallback, FeedbackCallback } from './types';
import { WebSpeechRecognition } from './webSpeechRecognition';
import { ApiTranscriptionService } from './apiTranscriptionService';

export class TranscriptionService {
  private webSocketService: WebSocketService;
  private audioProcessor: AudioProcessor;
  private webSpeechRecognition: WebSpeechRecognition;
  private apiTranscriptionService: ApiTranscriptionService;
  
  private onTranscriptUpdateCallback: TranscriptUpdateCallback | null = null;
  private onFeedbackCallback: FeedbackCallback | null = null;
  private isRecognitionActive: boolean = false;
  private apiConfig: TranscriptionAPIConfig | null = null;
  private currentTranscript: string = '';
  private isUsingAPI: boolean = false;

  constructor() {
    this.webSocketService = new WebSocketService();
    this.audioProcessor = new AudioProcessor();
    this.webSpeechRecognition = new WebSpeechRecognition();
    this.apiTranscriptionService = new ApiTranscriptionService();
    
    this.configureWebSocket();
    this.configureCallbacks();
  }

  private configureWebSocket() {
    this.webSocketService.configure(
      (data) => {
        if (data.transcription) {
          this.handleTranscriptionUpdate(data.transcription);
        }
        if (data.feedback) {
          this.handleFeedbackUpdate(data.feedback);
        }
      },
      (error) => toast.error(error)
    );
  }

  private configureCallbacks() {
    // Set up callbacks from web speech recognition to main service
    this.webSpeechRecognition.setTranscriptCallback((transcript) => {
      this.handleTranscriptionUpdate(transcript);
    });

    // Set up callbacks from API transcription to main service
    this.apiTranscriptionService.setTranscriptCallback((transcript) => {
      this.handleTranscriptionUpdate(transcript);
    });
  }

  private handleTranscriptionUpdate(transcript: string) {
    this.currentTranscript += transcript;
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback(transcript);
    }
  }

  private handleFeedbackUpdate(feedback: string) {
    if (this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    }
  }

  public configureAPI(config: TranscriptionAPIConfig) {
    this.apiConfig = config;
    this.isUsingAPI = true;
    this.apiTranscriptionService.configure(config);
    console.log('Transcription API configured');
  }

  public async start(): Promise<boolean> {
    if (this.isUsingAPI) {
      if (!await this.audioProcessor.initializeAudio()) {
        return false;
      }

      this.isRecognitionActive = true;
      return this.audioProcessor.startRecording((audioChunk) => {
        this.processAudioChunk(audioChunk);
      });
    } else {
      // Use browser's Speech Recognition
      this.isRecognitionActive = true;
      return this.webSpeechRecognition.start();
    }
  }

  public stop(): boolean {
    this.isRecognitionActive = false;
    
    if (this.isUsingAPI) {
      return this.audioProcessor.stopRecording();
    } else {
      return this.webSpeechRecognition.stop();
    }
  }

  public reset() {
    this.audioProcessor.cleanup();
    this.webSocketService.disconnect();
    this.webSpeechRecognition.reset();
    this.apiTranscriptionService.clearQueue();
    this.currentTranscript = '';
  }

  public async processAudioChunk(audioChunk: Blob): Promise<void> {
    if (this.isUsingAPI) {
      await this.apiTranscriptionService.processAudioChunk(audioChunk);
    } else {
      // For browser-based recognition, this is handled internally
      console.log('Processing audio chunk:', audioChunk);
    }
  }

  public onTranscriptUpdate(callback: TranscriptUpdateCallback) {
    this.onTranscriptUpdateCallback = callback;
  }

  public unsubscribeTranscriptUpdate(callback: TranscriptUpdateCallback) {
    if (this.onTranscriptUpdateCallback === callback) {
      this.onTranscriptUpdateCallback = null;
    }
  }

  public onFeedback(callback: FeedbackCallback) {
    this.onFeedbackCallback = callback;
  }

  public unsubscribeFeedback(callback: FeedbackCallback) {
    if (this.onFeedbackCallback === callback) {
      this.onFeedbackCallback = null;
    }
  }

  public updateTranscript(transcript: string) {
    this.currentTranscript += transcript;
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
    return this.currentTranscript;
  }
}

// Create a singleton instance to be used throughout the app
export const transcriptionService = new TranscriptionService();
