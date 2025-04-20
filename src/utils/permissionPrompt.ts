
import { toast } from 'sonner';

export const showMicrophonePermissionPrompt = async (): Promise<boolean> => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    
    switch (result.state) {
      case 'prompt':
        return new Promise((resolve) => {
          toast.info('Please grant microphone access to start the session', {
            description: 'We need microphone permission to record your practice session.',
            duration: 5000,
            important: true,
            action: {
              label: 'Grant Permission',
              onClick: async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                  toast.success('Microphone access granted');
                  resolve(true);
                } catch (err) {
                  toast.error('Microphone access was denied');
                  resolve(false);
                }
              }
            }
          });
        });
      case 'granted':
        // If already granted, attempt to get the stream to ensure it works
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          return true;
        } catch (err) {
          toast.error('Failed to access microphone');
          return false;
        }
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

