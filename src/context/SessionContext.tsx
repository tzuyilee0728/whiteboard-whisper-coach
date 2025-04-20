import React, { createContext, useContext } from 'react';
import { Challenge, Session, WhiteboardSection, AudioRecording, Category } from '@/types';
import { SessionProvider } from './SessionProvider';

interface SessionContextType {
  challenges: Challenge[];
  sessions: Session[];
  currentChallenge: Challenge | null;
  currentSession: Session | null;
  currentSection: WhiteboardSection;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  recordingTime: number;
  sectionProgress: Record<WhiteboardSection, number>;
  audioRecordings: AudioRecording[];
  customSessionTime: number;
  isPaused: boolean;
  selectedIndustry: Category | null;
  selectIndustry: (industry: Category) => void;
  selectChallenge: (challengeId: string) => void;
  startSession: () => void;
  endSession: () => void;
  setCurrentSection: (section: WhiteboardSection) => void;
  startRecording: () => void;
  stopRecording: () => void;
  updateSectionProgress: (section: WhiteboardSection, progress: number) => void;
  addRecording: (recording: AudioRecording) => void;
  updateRecordingTime: (time: number) => void;
  setCustomSessionTime: (time: number) => void;
  handlePauseResumeSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export { SessionContext, SessionProvider };
