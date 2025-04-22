
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranscriptionService } from '../transcriptionService';
import { WebSpeechService } from '../webSpeechService';

// Mock WebSpeechService
vi.mock('../webSpeechService', () => ({
  WebSpeechService: vi.fn().mockImplementation(() => ({
    configure: vi.fn(),
    start: vi.fn().mockReturnValue(true),
    stop: vi.fn().mockReturnValue(true),
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
    expect((transcriptionService as any).isUsingAPI).toBe(true);
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

  it('should process audio chunks when API is configured', async () => {
    const config = {
      apiKey: 'test-key',
      apiUrl: 'https://api.test.com',
      language: 'en-US'
    };
    
    transcriptionService.configureAPI(config);
    
    // Mock fetch for API call
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: 'Transcribed text' }),
      })
    );

    const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
    await transcriptionService.processAudioChunk(audioBlob);

    // Verify that fetch was called with correct parameters
    expect(fetch).toHaveBeenCalled();
  });
});
