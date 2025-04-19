
import { browserSpeechService } from './browserSpeechService';
import { audioProcessingService } from './audioProcessingService';

export class TranscriptionService {
  private isUsingAPI: boolean = false;
  private isInitialized: boolean = false;
  private debugMode: boolean = true; // Enable debug mode to log more details

  constructor() {
    // If browser speech recognition isn't available, use API fallback
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      this.isUsingAPI = true;
      this.log('Speech Recognition API not supported in this browser, will use external API');
    } else {
      this.log('Using browser Speech Recognition API');
    }
  }

  private log(...args: any[]) {
    if (this.debugMode) {
      console.log('[TranscriptionService]', ...args);
    }
  }

  public async processAudioChunk(audioChunk: Blob) {
    this.log('Processing audio chunk, size:', audioChunk.size, 'bytes');
    
    // Ignore very small audio chunks (likely silence)
    if (audioChunk.size < 500) {
      this.log('Audio chunk too small, likely silence - skipping');
      return '';
    }
    
    if (this.isUsingAPI) {
      this.log('Sending to API for processing');
      return await audioProcessingService.processAudioChunk(audioChunk);
    }
    
    // In browser mode, chunks are handled internally by the speech recognition API
    this.log('In browser mode - chunks processed by speech recognition API');
    return '';
  }

  public start() {
    this.log('Starting transcription service');
    this.isInitialized = true;
    
    if (this.isUsingAPI) {
      this.log('Using API transcription service');
      return true; // We're ready to process audio chunks
    }
    
    this.log('Starting browser speech recognition service');
    return browserSpeechService.start();
  }

  public stop() {
    this.log('Stopping transcription service');
    
    if (this.isUsingAPI) {
      return true;
    }
    return browserSpeechService.stop();
  }

  public reset() {
    this.log('Resetting transcription service');
    
    if (this.isUsingAPI) {
      audioProcessingService.resetTranscript();
    } else {
      browserSpeechService.reset();
    }
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    this.log('Setting transcript update callback');
    
    if (this.isUsingAPI) {
      // For API mode, the callback will be called when we process chunks
      audioProcessingService.setTranscriptCallback(callback);
    } else {
      browserSpeechService.onTranscriptUpdate(callback);
    }
  }

  public getCurrentTranscript(): string {
    if (!this.isInitialized) {
      return '';
    }
    
    let transcript = '';
    if (this.isUsingAPI) {
      transcript = audioProcessingService.getCurrentTranscript();
    } else {
      transcript = browserSpeechService.getCurrentTranscript();
    }
    
    this.log('Current transcript:', transcript);
    return transcript;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

export const transcriptionService = new TranscriptionService();
