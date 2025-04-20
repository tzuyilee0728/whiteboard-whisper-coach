
import { browserSpeechService } from './browserSpeechService';
import { audioProcessingService } from './audioProcessingService';

export class TranscriptionService {
  private isUsingAPI: boolean = false;
  private isInitialized: boolean = false;
  private debugMode: boolean = true; // Enable debug mode to log more details
  private hasAttemptedInit: boolean = false;

  constructor() {
    // More robust detection of SpeechRecognition
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    if (!hasSpeechRecognition) {
      this.isUsingAPI = true;
      this.log('Speech Recognition API not supported in this browser, will use external API');
    } else {
      this.log('Browser supports Speech Recognition API, will try to use it');
    }

    // Try to initialize immediately
    this.tryInit();
  }

  private tryInit() {
    if (this.hasAttemptedInit) return;
    
    this.hasAttemptedInit = true;
    
    // If we're using browser recognition, try to initialize it early
    if (!this.isUsingAPI) {
      this.log('Attempting early initialization of browser speech recognition');
      try {
        const canInit = browserSpeechService.initialize();
        this.log('Early browser speech init result:', canInit);
      } catch (error) {
        this.log('Error in early browser speech initialization:', error);
        // Fallback to API if browser speech fails to initialize
        this.log('Falling back to API transcription due to browser speech initialization failure');
        this.isUsingAPI = true;
      }
    }
  }

  private log(...args: any[]) {
    if (this.debugMode) {
      console.log('[TranscriptionService]', ...args);
    }
  }

  public async processAudioChunk(audioChunk: Blob) {
    this.log('Processing audio chunk, size:', audioChunk.size, 'bytes');
    
    try {
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
    } catch (error) {
      this.log('Error processing audio chunk:', error);
      return '';
    }
  }

  public start() {
    this.log('Starting transcription service, using API:', this.isUsingAPI);
    this.isInitialized = true;
    
    if (this.isUsingAPI) {
      this.log('Using API transcription service');
      return true; // We're ready to process audio chunks
    }
    
    this.log('Starting browser speech recognition service');
    const startResult = browserSpeechService.start();
    
    // If browser speech fails to start, fallback to API
    if (!startResult) {
      this.log('Browser speech recognition failed to start, falling back to API');
      this.isUsingAPI = true;
      return true; // API mode is always ready
    }
    
    return startResult;
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

  public getMode(): string {
    return this.isUsingAPI ? 'api' : 'browser';
  }
}

export const transcriptionService = new TranscriptionService();
