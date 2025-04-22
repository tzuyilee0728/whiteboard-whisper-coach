
import React, { useEffect } from 'react';
import TranscriptionView from './TranscriptionView';
import { useSession } from '@/context/SessionContext';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

const AIInteraction = () => {
  const { currentSession } = useSession();
  const { startRecording, stopRecording } = useAudioRecorder();
  
  // Start recording automatically when session starts
  useEffect(() => {
    if (currentSession) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [currentSession, startRecording, stopRecording]);

  return (
    <div className="h-full flex flex-col">
      <TranscriptionView />
    </div>
  );
};

export default AIInteraction;
