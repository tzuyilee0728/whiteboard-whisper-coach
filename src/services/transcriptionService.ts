
import { toast } from 'sonner';

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
  private onFeedbackCallback: ((feedback: string) => void) | null = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';
  private isRecognitionActive: boolean = false;
  private apiConfig: TranscriptionAPIConfig | null = null;
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
        console.error('Microphone access denied');
      } else if (event.error === 'network') {
        // Silently handle network errors, which are common in development
        console.log('Network error in speech recognition - this is normal in development');
      } else {
        console.error(`Speech recognition error: ${event.error}`);
      }
    };
  }

  // Configure the external API
  public configureAPI(config: TranscriptionAPIConfig) {
    this.apiConfig = config;
    this.isUsingAPI = true;
    console.log('Transcription API configured');
  }

  // Process audio chunk with external API
  public async processAudioChunk(audioChunk: Blob) {
    if (!this.isUsingAPI || !this.apiConfig) {
      return; // Skip if not using API or API not configured
    }

    this.audioQueue.push(audioChunk);
    
    // Process the audio queue if not already processing
    if (!this.isProcessingAudio) {
      this.processAudioQueue();
    }
  }

  private async processAudioQueue() {
    if (this.audioQueue.length === 0 || this.isProcessingAudio) {
      return;
    }

    this.isProcessingAudio = true;
    
    try {
      const audioChunk = this.audioQueue.shift();
      
      if (!audioChunk || !this.apiConfig) {
        this.isProcessingAudio = false;
        return;
      }

      // Convert blob to base64 for API transmission
      const arrayBuffer = await audioChunk.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      // Create FormData or JSON payload based on the API requirements
      const payload = JSON.stringify({
        audio: base64Audio,
        language: this.apiConfig.language,
        // Add other parameters as required by your API
      });

      // Make API request
      const response = await fetch(this.apiConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.apiKey}`,
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Update transcript with API response
      if (data.text || data.transcript) {
        const transcriptText = data.text || data.transcript;
        
        // Append to final transcript
        this.finalTranscript += ' ' + transcriptText;
        
        // Update UI
        if (this.onTranscriptUpdateCallback) {
          this.onTranscriptUpdateCallback(this.finalTranscript);
        }
      }
    } catch (error) {
      console.error('Error processing audio for transcription:', error);
      // Only show one toast error to avoid spamming
      if (this.audioQueue.length === 0) {
        console.error('Error connecting to transcription API');
      }
    } finally {
      this.isProcessingAudio = false;
      
      // Process next chunk if available
      if (this.audioQueue.length > 0) {
        setTimeout(() => this.processAudioQueue(), 100);
      }
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
    if (this.isUsingAPI && this.apiConfig) {
      // When using external API, we just mark as active
      this.isRecognitionActive = true;
      return true;
    } else if (this.recognitionInstance) {
      try {
        // Only start if not already active
        if (!this.isRecognitionActive) {
          this.recognitionInstance.start();
          this.isRecognitionActive = true;
          return true;
        }
        return true; // Already running is considered a success
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        return false;
      }
    }
    return false;
  }

  public stop() {
    if (this.isUsingAPI) {
      // When using external API, we just mark as inactive
      this.isRecognitionActive = false;
      this.audioQueue = []; // Clear the queue
      return true;
    } else if (this.recognitionInstance) {
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
    this.audioQueue = []; // Clear any pending audio
  }

  public onTranscriptUpdate(callback: (transcript: string) => void) {
    this.onTranscriptUpdateCallback = callback;
  }

  public unsubscribeTranscriptUpdate(callback: (transcript: string) => void) {
    if (this.onTranscriptUpdateCallback === callback) {
      this.onTranscriptUpdateCallback = null;
    }
  }

  public onFeedback(callback: (feedback: string) => void) {
    this.onFeedbackCallback = callback;
    console.log("Feedback callback registered");
  }

  public unsubscribeFeedback(callback: (feedback: string) => void) {
    if (this.onFeedbackCallback === callback) {
      this.onFeedbackCallback = null;
    }
  }

  public updateTranscript(transcript: string) {
    console.log("updateTranscript called with:", transcript);
    this.finalTranscript += ' ' + transcript;
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback(transcript);
    }
  }

  public updateFeedback(feedback: string) {
    console.log("updateFeedback called with:", feedback);
    if (this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    } else {
      console.warn("No feedback callback registered");
    }
  }

  public getCurrentTranscript(): string {
    return this.finalTranscript + ' ' + this.interimTranscript;
  }
}

// Create a singleton instance to be used throughout the app
export const transcriptionService = new TranscriptionService();
