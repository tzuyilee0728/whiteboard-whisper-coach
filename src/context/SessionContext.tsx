
import React, { createContext, useContext } from 'react';
import { Challenge, Session, WhiteboardSection, AudioRecording } from '@/types';
import { SessionProvider } from './SessionProvider';

interface SessionContextType {
  challenges: Challenge[];
  sessions: Session[];
  currentChallenge: Challenge | null;
  currentSession: Session | null;
  currentSection: WhiteboardSection;
  isRecording: boolean;
  recordingTime: number;
  sectionProgress: Record<WhiteboardSection, number>;
  audioRecordings: AudioRecording[];
  selectChallenge: (challengeId: string) => void;
  startSession: () => void;
  endSession: () => void;
  setCurrentSection: (section: WhiteboardSection) => void;
  startRecording: () => void;
  stopRecording: () => void;
  updateSectionProgress: (section: WhiteboardSection, progress: number) => void;
  addRecording: (recording: AudioRecording) => void;
}

// Create context with undefined as default value
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Custom hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export { SessionContext, SessionProvider };
