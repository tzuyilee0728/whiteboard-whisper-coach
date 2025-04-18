
import { browserSpeechService } from './browserSpeechService';
import { audioProcessingService } from './audioProcessingService';

export class TranscriptionService {
  private isUsingAPI: boolean = false;

  constructor() {
    // If browser speech recognition isn't available, use API fallback
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      this.isUsingAPI = true;
      console.log('Speech Recognition API not supported in this browser, will use external API');
    }
  }

  public async processAudioChunk(audioChunk: Blob) {
    if (this.isUsingAPI) {
      return await audioProcessingService.processAudioChunk(audioChunk);
    }
    return '';
  }

  public start() {
    return browserSpeechService.start();
  }

  public stop() {
    return browserSpeechService.stop();
  }

  public reset() {
    browserSpeechService.reset();
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    browserSpeechService.onTranscriptUpdate(callback);
  }

  public getCurrentTranscript(): string {
    return browserSpeechService.getCurrentTranscript();
  }
}

export const transcriptionService = new TranscriptionService();
