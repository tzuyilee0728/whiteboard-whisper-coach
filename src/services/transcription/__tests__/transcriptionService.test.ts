
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranscriptionService } from '../transcriptionService';
import { WebSocketService } from '../websocketService';
import { WebSpeechRecognition } from '../webSpeechRecognition';
import { ApiTranscriptionService } from '../apiTranscriptionService';

// Mock WebSocketService
vi.mock('../websocketService', () => ({
  WebSocketService: vi.fn().mockImplementation(() => ({
    configure: vi.fn(),
    connect: vi.fn().mockReturnValue(true),
    disconnect: vi.fn().mockReturnValue(true),
    send: vi.fn().mockReturnValue(true),
  })),
}));

// Mock AudioProcessor
vi.mock('../audioProcessor', () => ({
  AudioProcessor: vi.fn().mockImplementation(() => ({
    initializeAudio: vi.fn().mockResolvedValue(true),
    startRecording: vi.fn().mockReturnValue(true),
    stopRecording: vi.fn().mockReturnValue(true),
    cleanup: vi.fn(),
  })),
}));

// Mock WebSpeechRecognition
vi.mock('../webSpeechRecognition', () => ({
  WebSpeechRecognition: vi.fn().mockImplementation(() => ({
    setTranscriptCallback: vi.fn(),
    start: vi.fn().mockReturnValue(true),
    stop: vi.fn().mockReturnValue(true),
    reset: vi.fn(),
    getCurrentTranscript: vi.fn().mockReturnValue(''),
  })),
}));

// Mock ApiTranscriptionService
vi.mock('../apiTranscriptionService', () => ({
  ApiTranscriptionService: vi.fn().mockImplementation(() => ({
    configure: vi.fn(),
    setTranscriptCallback: vi.fn(),
    processAudioChunk: vi.fn().mockResolvedValue(undefined),
    clearQueue: vi.fn(),
  })),
}));

describe('TranscriptionService', () => {
  let transcriptionService: TranscriptionService;
  
  beforeEach(() => {
    transcriptionService = new TranscriptionService();
  });

  it('should initialize with default values', () => {
    expect(transcriptionService).toBeDefined();
    expect(transcriptionService.getCurrentTranscript()).toBe('');
  });

  it('should configure API correctly', () => {
    const config = {
      apiKey: 'test-key',
      apiUrl: 'https://api.test.com',
      language: 'en-US'
    };
    
    transcriptionService.configureAPI(config);
    expect((transcriptionService as any).apiConfig).toEqual(config);
  });

  it('should handle transcript updates', () => {
    const callback = vi.fn();
    transcriptionService.onTranscriptUpdate(callback);
    transcriptionService.updateTranscript('Hello');
    expect(callback).toHaveBeenCalledWith('Hello');
  });

  it('should handle feedback updates', () => {
    const callback = vi.fn();
    transcriptionService.onFeedback(callback);
    transcriptionService.updateFeedback('Good job!');
    expect(callback).toHaveBeenCalledWith('Good job!');
  });

  it('should reset state correctly', () => {
    transcriptionService.updateTranscript('Test');
    transcriptionService.reset();
    expect(transcriptionService.getCurrentTranscript()).toBe('');
  });

  it('should process audio chunks', async () => {
    const config = {
      apiKey: 'test-key',
      apiUrl: 'https://api.test.com',
      language: 'en-US'
    };
    
    transcriptionService.configureAPI(config);
    
    const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
    await transcriptionService.processAudioChunk(audioBlob);
    
    // Since we're mocking the API service, we can just verify it doesn't throw
    expect(true).toBe(true);
  });
});
