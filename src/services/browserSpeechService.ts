
import { toast } from 'sonner';
import { SpeechRecognition, SpeechRecognitionEvent } from '@/types/speechRecognition';

export class BrowserSpeechService {
  private recognitionInstance: SpeechRecognition | null = null;
  private onTranscriptCallback: ((transcript: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';
  private debugMode: boolean = true;
  private isInitialized: boolean = false;
  private hasPermission: boolean = false;

  constructor() {
    this.initialize();
  }

  public initialize(): boolean {
    if (this.isInitialized) return true;
    
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      try {
        // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognitionInstance = new SpeechRecognition();
        this.configureRecognition();
        this.log('Browser Speech Recognition initialized');
        this.isInitialized = true;
        return true;
      } catch (error) {
        this.log('Error initializing speech recognition:', error);
        return false;
      }
    } else {
      this.log('Speech Recognition API not supported in this browser');
      return false;
    }
  }

  private log(...args: any[]) {
    if (this.debugMode) {
      console.log('[BrowserSpeechService]', ...args);
    }
  }

  private configureRecognition() {
    if (!this.recognitionInstance) return;

    this.recognitionInstance.continuous = true;
    this.recognitionInstance.interimResults = true;
    this.recognitionInstance.lang = 'en-US';
    this.log('Recognition configured with continuous=true, interimResults=true, lang=en-US');

    this.recognitionInstance.onresult = this.handleRecognitionResult.bind(this);
    this.recognitionInstance.onerror = this.handleRecognitionError.bind(this);
    this.recognitionInstance.onstart = () => {
      this.log('Speech recognition started');
      this.hasPermission = true;
    };
    this.recognitionInstance.onend = () => {
      this.log('Speech recognition ended - restarting');
      // Auto restart recognition if it ends unexpectedly and we have permission
      if (this.recognitionInstance && this.hasPermission) {
        try {
          // Small delay to prevent rapid restart cycles
          setTimeout(() => {
            if (this.hasPermission) {
              this.recognitionInstance?.start();
              this.log('Recognition restarted after end event');
            }
          }, 300);
        } catch (e) {
          this.log('Error restarting recognition:', e);
        }
      }
    };
  }

  private handleRecognitionResult(event: SpeechRecognitionEvent) {
    this.log('Recognition result received', event.results);
    this.interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        this.log('Final transcript:', transcript);
        this.finalTranscript += ' ' + transcript;
      } else {
        this.log('Interim transcript:', transcript);
        this.interimTranscript += transcript;
      }
    }
    
    const fullTranscript = (this.finalTranscript + ' ' + this.interimTranscript).trim();
    this.log('Full transcript:', fullTranscript);
    
    if (this.onTranscriptCallback) {
      this.onTranscriptCallback(fullTranscript);
    }
  }

  private handleRecognitionError(event: SpeechRecognitionEvent) {
    this.log('Recognition error:', event.error);
    
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      toast.error('Microphone access denied. Please allow microphone access.');
      this.hasPermission = false;
    } else if (event.error === 'network') {
      this.log('Network error in speech recognition - this is normal in development');
    } else if (event.error === 'no-speech') {
      this.log('No speech detected - this is normal during silence');
    } else {
      toast.error(`Speech recognition error: ${event.error}`);
    }
  }

  public start(): boolean {
    if (!this.isInitialized) {
      if (!this.initialize()) {
        return false;
      }
    }
    
    if (this.recognitionInstance) {
      try {
        this.log('Starting speech recognition');
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
        this.log('Stopping speech recognition');
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
    this.log('Resetting transcripts');
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    this.log('Setting transcript callback');
    this.onTranscriptCallback = callback;
  }

  public getCurrentTranscript(): string {
    return (this.finalTranscript + ' ' + this.interimTranscript).trim();
  }
}

export const browserSpeechService = new BrowserSpeechService();
