
import { BrowserSpeechService } from './browserSpeechService';
import { APITranscriptionService, TranscriptionAPIConfig } from './apiTranscriptionService';

export class TranscriptionService {
  private browserService: BrowserSpeechService;
  private apiService: APITranscriptionService;
  private isUsingAPI: boolean = false;
  private isRecognitionActive: boolean = false;

  constructor() {
    this.browserService = new BrowserSpeechService();
    this.apiService = new APITranscriptionService();
  }

  public configureAPI(config: TranscriptionAPIConfig) {
    this.apiService.configure(config);
    this.isUsingAPI = true;
  }

  public processAudioChunk(audioChunk: Blob) {
    if (this.isUsingAPI && this.isRecognitionActive) {
      this.apiService.processAudioChunk(audioChunk);
    }
  }

  public start() {
    if (this.isUsingAPI) {
      this.isRecognitionActive = true;
      return true;
    } else {
      const started = this.browserService.start();
      if (started) {
        this.isRecognitionActive = true;
      }
      return started;
    }
  }

  public stop() {
    if (this.isUsingAPI) {
      this.isRecognitionActive = false;
      return true;
    } else {
      const stopped = this.browserService.stop();
      if (stopped) {
        this.isRecognitionActive = false;
      }
      return stopped;
    }
  }

  public reset() {
    this.browserService.reset();
    this.apiService.reset();
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    this.browserService.onTranscriptUpdate(callback);
    this.apiService.onTranscriptUpdate(callback);
  }

  public getCurrentTranscript(): string {
    return this.isUsingAPI ? 
      this.apiService.getCurrentTranscript() : 
      this.browserService.getCurrentTranscript();
  }
}

// Create and export singleton instance
export const transcriptionService = new TranscriptionService();
