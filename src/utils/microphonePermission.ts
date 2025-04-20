
import { toast } from 'sonner';

export type PermissionStatus = 'initial' | 'granted' | 'denied';

export const requestMicrophonePermission = async () => {
  try {
    console.log('Requesting microphone permission...');
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    console.log('Microphone permission granted');
    return {
      stream,
      status: 'granted' as PermissionStatus,
      error: null
    };
  } catch (err) {
    console.error('Microphone permission error:', err);
    let errorMessage = 'Unable to access microphone. An unknown error occurred.';
    
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage = 'Microphone access was denied. Please allow microphone permissions in your browser settings.';
          toast.error('Microphone access denied. Please check your browser settings.');
          break;
        case 'NotFoundError':
          errorMessage = 'No microphone device found. Please connect a microphone.';
          toast.error('No microphone detected. Please connect a microphone.');
          break;
      }
    }
    
    return {
      stream: null,
      status: 'denied' as PermissionStatus,
      error: errorMessage
    };
  }
};

export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
    
    if (audioInputDevices.length === 0) {
      toast.warning('No microphone devices found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking microphone devices:', error);
    return false;
  }
};
