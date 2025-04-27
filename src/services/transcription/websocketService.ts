
import { toast } from 'sonner';

export class WebSocketService {
  private webSocket: WebSocket | null = null;
  private onDataCallback: ((data: any) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  configure(onData: (data: any) => void, onError: (error: string) => void) {
    this.onDataCallback = onData;
    this.onErrorCallback = onError;
  }

  connect(url: string) {
    try {
      this.webSocket = new WebSocket(url);
      
      this.webSocket.onmessage = (event) => {
        if (this.onDataCallback) {
          this.onDataCallback(JSON.parse(event.data));
        }
      };

      this.webSocket.onerror = () => {
        if (this.onErrorCallback) {
          this.onErrorCallback('WebSocket connection error');
        }
      };

      return true;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return false;
    }
  }

  disconnect() {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  send(data: any): boolean {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }
}
