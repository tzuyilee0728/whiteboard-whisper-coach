import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Add TypeScript declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
}

// API configuration
interface TranscriptionAPIConfig {
  apiKey: string;
  apiUrl: string;
  language: string;
}

export class TranscriptionService {
  private recognitionInstance: SpeechRecognition | null = null;
  private onTranscriptUpdateCallback: ((transcript: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';
  private isRecognitionActive: boolean = false;
  private isUsingAPI: boolean = false;
  private audioQueue: Blob[] = [];
  private isProcessingAudio: boolean = false;

  constructor() {
    // Check if browser supports the Web Speech API as fallback
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognitionInstance = new SpeechRecognition();
      this.configureRecognition();
    } else {
      console.log('Speech Recognition API not supported in this browser, will use external API');
      this.isUsingAPI = true;
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
    };

    this.recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'network') {
        // Silently handle network errors, which are common in development
        console.log('Network error in speech recognition - this is normal in development');
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };
  }

  public async processAudioChunk(audioChunk: Blob) {
    try {
      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data?.transcription) {
        this.finalTranscript += ' ' + data.transcription;
        
        if (this.onTranscriptUpdateCallback) {
          this.onTranscriptUpdateCallback(this.finalTranscript);
        }
      }
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
      toast.error('Error processing audio');
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  }

  public start() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.start();
        this.isRecognitionActive = true;
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
        this.isRecognitionActive = false;
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

export const transcriptionService = new TranscriptionService();
