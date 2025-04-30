
import { toast } from 'sonner';
import { WebSocketService } from './websocketService';
import { AudioProcessor } from './audioProcessor';
import { TranscriptionAPIConfig, TranscriptUpdateCallback, FeedbackCallback } from './types';
import { WebSpeechRecognition } from './webSpeechRecognition';
import { ApiTranscriptionService } from './apiTranscriptionService';
import { supabase } from '@/integrations/supabase/client';

// Add AI Response callback
type AIResponseCallback = (response: string) => void;

export class TranscriptionService {
  private webSocketService: WebSocketService;
  private audioProcessor: AudioProcessor;
  private webSpeechRecognition: WebSpeechRecognition;
  private apiTranscriptionService: ApiTranscriptionService;
  
  private onTranscriptUpdateCallback: TranscriptUpdateCallback | null = null;
  private onFeedbackCallback: FeedbackCallback | null = null;
  private onAIResponseCallback: AIResponseCallback | null = null;
  private isRecognitionActive: boolean = false;
  private apiConfig: TranscriptionAPIConfig | null = null;
  private currentTranscript: string = '';
  private isUsingAPI: boolean = false;
  private sessionContext: string = '';

  constructor() {
    this.webSocketService = new WebSocketService();
    this.audioProcessor = new AudioProcessor();
    this.webSpeechRecognition = new WebSpeechRecognition();
    this.apiTranscriptionService = new ApiTranscriptionService();
    
    this.configureWebSocket();
    this.configureCallbacks();
  }

  private configureWebSocket() {
    this.webSocketService.configure(
      (data) => {
        if (data.transcription) {
          this.handleTranscriptionUpdate(data.transcription);
        }
        if (data.feedback) {
          this.handleFeedbackUpdate(data.feedback);
        }
        if (data.aiResponse) {
          this.handleAIResponse(data.aiResponse);
        }
      },
      (error) => toast.error(error)
    );
  }

  private configureCallbacks() {
    // Set up callbacks from web speech recognition to main service
    this.webSpeechRecognition.setTranscriptCallback((transcript) => {
      this.handleTranscriptionUpdate(transcript);
    });

    // Set up callbacks from API transcription to main service
    this.apiTranscriptionService.setTranscriptCallback((transcript) => {
      this.handleTranscriptionUpdate(transcript);
    });
  }

  private handleTranscriptionUpdate(transcript: string) {
    this.currentTranscript += transcript;
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback(transcript);
    }
    // Update session context
    this.sessionContext += ' ' + transcript;
  }

  private handleFeedbackUpdate(feedback: string) {
    if (this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    }
  }

  private handleAIResponse(response: string) {
    if (this.onAIResponseCallback) {
      this.onAIResponseCallback(response);
    }
  }

  public configureAPI(config: TranscriptionAPIConfig) {
    this.apiConfig = config;
    this.isUsingAPI = true;
    this.apiTranscriptionService.configure(config);
    console.log('Transcription API configured');
  }

  public async start(): Promise<boolean> {
    if (this.isUsingAPI) {
      if (!await this.audioProcessor.initializeAudio()) {
        return false;
      }

      this.isRecognitionActive = true;
      return this.audioProcessor.startRecording((audioChunk) => {
        this.processAudioChunk(audioChunk);
      });
    } else {
      // Use browser's Speech Recognition
      this.isRecognitionActive = true;
      return this.webSpeechRecognition.start();
    }
  }

  public stop(): boolean {
    this.isRecognitionActive = false;
    
    if (this.isUsingAPI) {
      return this.audioProcessor.stopRecording();
    } else {
      return this.webSpeechRecognition.stop();
    }
  }

  public reset() {
    this.audioProcessor.cleanup();
    this.webSocketService.disconnect();
    this.webSpeechRecognition.reset();
    this.apiTranscriptionService.clearQueue();
    this.currentTranscript = '';
    this.sessionContext = '';
  }

  public async processAudioChunk(audioChunk: Blob): Promise<void> {
    if (this.isUsingAPI) {
      await this.apiTranscriptionService.processAudioChunk(audioChunk);
    } else {
      // For browser-based recognition, this is handled internally
      console.log('Processing audio chunk:', audioChunk);
    }
  }

  public onTranscriptUpdate(callback: TranscriptUpdateCallback) {
    this.onTranscriptUpdateCallback = callback;
  }

  public unsubscribeTranscriptUpdate(callback: TranscriptUpdateCallback) {
    if (this.onTranscriptUpdateCallback === callback) {
      this.onTranscriptUpdateCallback = null;
    }
  }

  public onFeedback(callback: FeedbackCallback) {
    this.onFeedbackCallback = callback;
  }

  public unsubscribeFeedback(callback: FeedbackCallback) {
    if (this.onFeedbackCallback === callback) {
      this.onFeedbackCallback = null;
    }
  }

  public onAIResponse(callback: AIResponseCallback) {
    this.onAIResponseCallback = callback;
  }

  public unsubscribeAIResponse(callback: AIResponseCallback) {
    if (this.onAIResponseCallback === callback) {
      this.onAIResponseCallback = null;
    }
  }

  public updateTranscript(transcript: string) {
    this.currentTranscript += transcript;
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback(transcript);
    }
    // Update session context
    this.sessionContext += ' ' + transcript;
  }

  public updateFeedback(feedback: string) {
    if (this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    }
  }

  public updateAIResponse(response: string) {
    if (this.onAIResponseCallback) {
      this.onAIResponseCallback(response);
    }
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  public async askQuestion(question: string, section: string): Promise<void> {
    try {
      // Create a small audio blob to simulate audio input
      const dummyAudio = new Blob([new Uint8Array(10)], { type: 'audio/webm' });
      const base64Audio = await this.blobToBase64(dummyAudio);

      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: JSON.stringify({
          audio: base64Audio,
          section: section,
          sessionContext: this.sessionContext,
          isQuestion: true,
          question: question
        })
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (data?.aiResponse) {
        console.log('Received AI response:', data.aiResponse);
        this.updateAIResponse(data.aiResponse);
        return;
      }
      
      throw new Error('No response received from AI');
    } catch (err) {
      console.error('Error asking question:', err);
      toast.error('Failed to get response from AI');
      throw err;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Create a singleton instance to be used throughout the app
export const transcriptionService = new TranscriptionService();
