
export function processBase64Chunks(base64String: string, chunkSize = 32768) {
  if (!base64String || typeof base64String !== 'string') {
    console.error('Invalid base64 input:', base64String);
    return new Uint8Array(0); // Return empty array for invalid input
  }
  
  try {
    const chunks: Uint8Array[] = [];
    let position = 0;
    
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      try {
        const binaryChunk = atob(chunk);
        const bytes = new Uint8Array(binaryChunk.length);
        
        for (let i = 0; i < binaryChunk.length; i++) {
          bytes[i] = binaryChunk.charCodeAt(i);
        }
        
        chunks.push(bytes);
      } catch (e) {
        console.error('Error processing base64 chunk:', e);
      }
      position += chunkSize;
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (e) {
    console.error('Error in processBase64Chunks:', e);
    return new Uint8Array(0);
  }
}
