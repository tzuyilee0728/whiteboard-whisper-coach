
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
};

export const createAudioBlobFromBase64 = (base64: string, mimeType = 'audio/webm'): Blob => {
  const arrayBuffer = base64ToArrayBuffer(base64);
  return new Blob([arrayBuffer], { type: mimeType });
};

export const playAudioBlob = (blob: Blob): HTMLAudioElement => {
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
  
  audio.play();
  return audio;
};

// Helper function to compress large audio blobs if needed
export const compressAudioIfNeeded = async (blob: Blob, maxSizeMB: number = 5): Promise<Blob> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (blob.size <= maxSizeBytes) {
    return blob; // No compression needed
  }
  
  console.log(`Audio blob size (${(blob.size / 1024 / 1024).toFixed(2)}MB) exceeds limit, compressing...`);
  
  // Simple compression - convert to mp3 or lower quality format
  // This is a placeholder - actual implementation would depend on available libraries
  // For now, just return the original blob
  return blob;
};
