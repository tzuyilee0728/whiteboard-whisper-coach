
import { describe, it, expect } from 'vitest';
import { arrayBufferToBase64 } from '../audioUtils';

describe('audioUtils', () => {
  it('should convert ArrayBuffer to base64 string', () => {
    // Create a sample ArrayBuffer with known content
    const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello" in ASCII
    const result = arrayBufferToBase64(buffer);
    
    // The expected base64 string for "Hello"
    expect(result).toBe('SGVsbG8=');
  });

  it('should handle empty ArrayBuffer', () => {
    const buffer = new Uint8Array([]).buffer;
    const result = arrayBufferToBase64(buffer);
    expect(result).toBe('');
  });
});
