
import { SpeechRecognition, SpeechRecognitionEvent } from './types';
import { toast } from 'sonner';

export class WebSpeechRecognition {
  private recognitionInstance: SpeechRecognition | null = null;
  private onTranscriptCallback: ((transcript: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';

  constructor() {
    // Check if browser supports the Web Speech API
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

    this.recognitionInstance.onresult = (event) => {
      this.handleRecognitionResult(event);
    };

    this.recognitionInstance.onerror = (event) => {
      this.handleRecognitionError(event);
    };
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
    
    const currentTranscript = this.finalTranscript + ' ' + this.interimTranscript;
    
    if (this.onTranscriptCallback) {
      this.onTranscriptCallback(currentTranscript);
    }
  }

  private handleRecognitionError(event: SpeechRecognitionEvent) {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'not-allowed') {
      console.error('Microphone access denied');
    } else if (event.error === 'network') {
      // Silently handle network errors, which are common in development
      console.log('Network error in speech recognition - this is normal in development');
    } else {
      console.error(`Speech recognition error: ${event.error}`);
    }
  }

  public setTranscriptCallback(callback: (transcript: string) => void) {
    this.onTranscriptCallback = callback;
  }

  public start(): boolean {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.start();
        return true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
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

  public getCurrentTranscript(): string {
    return this.finalTranscript + ' ' + this.interimTranscript;
  }
}
