
import { toast } from 'sonner';
import { WebSocketService } from './websocketService';
import { AudioProcessor } from './audioProcessor';
import { TranscriptionAPIConfig } from './types';

export class TranscriptionService {
  private webSocketService: WebSocketService;
  private audioProcessor: AudioProcessor;
  private onTranscriptUpdateCallback: ((transcript: string) => void) | null = null;
  private onFeedbackCallback: ((feedback: string) => void) | null = null;
  private isRecognitionActive: boolean = false;
  private apiConfig: TranscriptionAPIConfig | null = null;

  constructor() {
    this.webSocketService = new WebSocketService();
    this.audioProcessor = new AudioProcessor();
    this.configureWebSocket();
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

  private handleTranscriptionUpdate(transcript: string) {
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
    console.log('Transcription API configured');
  }

  public async start(): boolean {
    if (!await this.audioProcessor.initializeAudio()) {
      return false;
    }

    this.isRecognitionActive = true;
    return this.audioProcessor.startRecording((audioChunk) => {
      // Process audio chunk
      this.processAudioChunk(audioChunk);
    });
  }

  public stop(): boolean {
    this.isRecognitionActive = false;
    return this.audioProcessor.stopRecording();
  }

  public reset() {
    this.audioProcessor.cleanup();
    this.webSocketService.disconnect();
  }

  private async processAudioChunk(audioChunk: Blob) {
    // Process and send audio chunk logic here
    console.log('Processing audio chunk:', audioChunk);
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
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback(transcript);
    }
  }

  public updateFeedback(feedback: string) {
    if (this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    }
  }
}

// Create a singleton instance to be used throughout the app
export const transcriptionService = new TranscrationService();
