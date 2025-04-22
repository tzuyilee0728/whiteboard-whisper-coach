
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSpeechService } from '../webSpeechService';

describe('WebSpeechService', () => {
  let webSpeechService: WebSpeechService;
  
  beforeEach(() => {
    // Mock the SpeechRecognition API
    global.SpeechRecognition = vi.fn().mockImplementation(() => ({
      continuous: false,
      interimResults: false,
      lang: '',
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onerror: null,
    }));
    
    webSpeechService = new WebSpeechService();
  });

  it('should initialize correctly', () => {
    expect(webSpeechService).toBeDefined();
  });

  it('should configure speech recognition with correct parameters', () => {
    const onTranscriptUpdate = vi.fn();
    const onError = vi.fn();
    
    webSpeechService.configure(onTranscriptUpdate, onError);
    
    const recognition = (webSpeechService as any).recognitionInstance;
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.lang).toBe('en-US');
  });

  it('should start speech recognition', () => {
    const result = webSpeechService.start();
    expect(result).toBe(true);
  });

  it('should stop speech recognition', () => {
    const result = webSpeechService.stop();
    expect(result).toBe(true);
  });
});
