
import { useState } from 'react';
import { PermissionStatus } from '@/utils/microphonePermission';

export const useRecordingState = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('initial');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  return {
    audioStream,
    setAudioStream,
    error,
    setError,
    permissionStatus,
    setPermissionStatus,
    isRecording,
    setIsRecording,
    isProcessing,
    setIsProcessing
  };
};
