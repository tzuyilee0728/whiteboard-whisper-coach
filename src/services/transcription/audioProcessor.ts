
export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  async initializeAudio(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      return true;
    } catch (error) {
      console.error('Audio initialization error:', error);
      return false;
    }
  }

  startRecording(onDataAvailable: (data: Blob) => void) {
    if (!this.stream) return false;

    try {
      this.recorder = new MediaRecorder(this.stream);
      this.recorder.ondataavailable = (e) => onDataAvailable(e.data);
      this.recorder.start();
      return true;
    } catch (error) {
      console.error('Recording start error:', error);
      return false;
    }
  }

  stopRecording() {
    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.stop();
      return true;
    }
    return false;
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.recorder = null;
  }
}
