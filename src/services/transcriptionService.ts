
import { browserSpeechService } from './browserSpeechService';
import { audioProcessingService } from './audioProcessingService';

export class TranscriptionService {
  private isUsingAPI: boolean = false;

  constructor() {
    // If browser speech recognition isn't available, use API fallback
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      this.isUsingAPI = true;
      console.log('Speech Recognition API not supported in this browser, will use external API');
    } else {
      console.log('Using browser Speech Recognition API');
    }
  }

  public async processAudioChunk(audioChunk: Blob) {
    if (this.isUsingAPI) {
      console.log('Processing audio chunk via external API');
      return await audioProcessingService.processAudioChunk(audioChunk);
    }
    return '';
  }

  public start() {
    if (this.isUsingAPI) {
      console.log('Using API transcription service');
      return true; // We're ready to process audio chunks
    }
    console.log('Starting browser speech recognition service');
    return browserSpeechService.start();
  }

  public stop() {
    if (this.isUsingAPI) {
      return true;
    }
    return browserSpeechService.stop();
  }

  public reset() {
    if (this.isUsingAPI) {
      audioProcessingService.resetTranscript();
      return;
    }
    browserSpeechService.reset();
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    if (this.isUsingAPI) {
      // For API mode, the callback will be called when we process chunks
      audioProcessingService.setTranscriptCallback(callback);
      return;
    }
    browserSpeechService.onTranscriptUpdate(callback);
  }

  public getCurrentTranscript(): string {
    if (this.isUsingAPI) {
      return audioProcessingService.getCurrentTranscript();
    }
    return browserSpeechService.getCurrentTranscript();
  }
}

export const transcriptionService = new TranscriptionService();
