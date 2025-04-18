
import { toast } from 'sonner';

// Simulated transcription service for the prototype
// In a real application, this would connect to a Speech-to-Text API like Google's, AWS, or Azure
export class TranscriptionService {
  private recognitionInstance: SpeechRecognition | null = null;
  private onTranscriptUpdateCallback: ((transcript: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';

  constructor() {
    // Check if browser supports the Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognitionInstance = new SpeechRecognition();
      this.configureRecognition();
    } else {
      toast.error('Your browser does not support speech recognition.');
    }
  }

  private configureRecognition() {
    if (!this.recognitionInstance) return;

    this.recognitionInstance.continuous = true;
    this.recognitionInstance.interimResults = true;
    this.recognitionInstance.lang = 'en-US';

    this.recognitionInstance.onresult = (event) => {
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
      
      if (this.onTranscriptUpdateCallback) {
        this.onTranscriptUpdateCallback(currentTranscript);
      }
      
      // If this is real-time, we'd send this to the AI analysis service here
    };

    this.recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };
  }

  public start() {
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

  public stop() {
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
    this.onTranscriptUpdateCallback = callback;
  }

  public getCurrentTranscript(): string {
    return this.finalTranscript + ' ' + this.interimTranscript;
  }
}

// Create a singleton instance to be used throughout the app
export const transcriptionService = new TranscriptionService();
