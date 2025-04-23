
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';
import { useAudioStream } from './useAudioStream';
import { useMediaRecorderWithStream } from './useMediaRecorder';

export const useAudioRecorder = () => {
  const { 
    isRecording, 
    setIsRecording, 
    currentSession, 
    updateRecordingTime, 
    currentSection, 
    isPaused 
  } = useSession();

  const { 
    audioStream, 
    requestMicrophonePermission, 
    error: streamError 
  } = useAudioStream();

  // Defer most logic to the separated/encapsulated hook
  const mediaRecorderApi = useMediaRecorderWithStream({
    audioStream,
    isRecording,
    setIsRecording,
    currentSession,
    currentSection,
    isPaused,
  });

  // Request permission automatically if session just started and no stream yet
  React.useEffect(() => {
    if (currentSession && !audioStream) {
      requestMicrophonePermission();
    }
  }, [currentSession]);

  return {
    ...mediaRecorderApi,
    isRecording,
    error: streamError || mediaRecorderApi.error,
  };
};
