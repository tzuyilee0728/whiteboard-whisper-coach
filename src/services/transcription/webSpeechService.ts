
import { toast } from 'sonner';
import { SpeechRecognition, SpeechRecognitionEvent } from './types';

export class WebSpeechService {
  private recognitionInstance: SpeechRecognition | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognitionInstance = new SpeechRecognition();
    } else {
      console.log('Speech Recognition API not supported in this browser');
    }
  }

  public configure(
    onTranscriptUpdate: (transcript: string) => void,
    onError: (error: string) => void
  ) {
    if (!this.recognitionInstance) return;

    this.recognitionInstance.continuous = true;
    this.recognitionInstance.interimResults = true;
    this.recognitionInstance.lang = 'en-US';

    this.recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      onTranscriptUpdate(finalTranscript + ' ' + interimTranscript);
    };

    this.recognitionInstance.onerror = (event: SpeechRecognitionEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onError('Microphone access denied');
      } else if (event.error === 'network') {
        console.log('Network error in speech recognition - this is normal in development');
      } else {
        onError(`Speech recognition error: ${event.error}`);
      }
    };
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
}
