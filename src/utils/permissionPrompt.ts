
import { toast } from 'sonner';

export const showMicrophonePermissionPrompt = async (): Promise<boolean> => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    
    switch (result.state) {
      case 'prompt':
        toast.info('Please grant microphone access to start the session', {
          description: 'We need microphone permission to record your practice session.',
          duration: 5000,
          important: true,
          action: {
            label: 'Grant Permission',
            onClick: () => {
              navigator.mediaDevices.getUserMedia({ audio: true })
                .catch(() => {
                  toast.error('Microphone access was denied');
                });
            }
          }
        });
        return true;
      case 'granted':
        return true;
      case 'denied':
        toast.error('Microphone access is blocked. Please enable it in your browser settings.', {
          description: 'Go to browser settings and allow microphone access for this site.'
        });
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error('Permission check error:', error);
    toast.error('Unable to check microphone permissions');
    return false;
  }
};
