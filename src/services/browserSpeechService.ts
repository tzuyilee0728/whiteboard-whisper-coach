
import { toast } from 'sonner';
import { SpeechRecognition, SpeechRecognitionEvent } from '@/types/speechRecognition';

export class BrowserSpeechService {
  private recognitionInstance: SpeechRecognition | null = null;
  private onTranscriptCallback: ((transcript: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';

  constructor() {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognitionInstance = new SpeechRecognition();
      this.configureRecognition();
    } else {
      console.log('Speech Recognition API not supported in this browser');
    }
  }

  private configureRecognition() {
    if (!this.recognitionInstance) return;

    this.recognitionInstance.continuous = true;
    this.recognitionInstance.interimResults = true;
    this.recognitionInstance.lang = 'en-US';

    this.recognitionInstance.onresult = this.handleRecognitionResult.bind(this);
    this.recognitionInstance.onerror = this.handleRecognitionError.bind(this);
  }

  private handleRecognitionResult(event: SpeechRecognitionEvent) {
    this.interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        this.finalTranscript += ' ' + transcript;
      } else {
        this.interimTranscript += transcript;
      }
    }
    
    if (this.onTranscriptCallback) {
      this.onTranscriptCallback(this.finalTranscript + ' ' + this.interimTranscript);
    }
  }

  private handleRecognitionError(event: SpeechRecognitionEvent) {
    if (event.error === 'not-allowed') {
      toast.error('Microphone access denied. Please allow microphone access.');
    } else if (event.error === 'network') {
      console.log('Network error in speech recognition - this is normal in development');
    } else {
      toast.error(`Speech recognition error: ${event.error}`);
    }
  }

  public start(): boolean {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.start();
        return true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to start speech recognition.');
        return false;
      }
    }
    return false;
  }

  public stop(): boolean {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
        return true;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        return false;
      }
    }
    return false;
  }

  public reset() {
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    this.onTranscriptCallback = callback;
  }

  public getCurrentTranscript(): string {
    return this.finalTranscript + ' ' + this.interimTranscript;
  }
}

export const browserSpeechService = new BrowserSpeechService();
