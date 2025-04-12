
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Challenge, Session, WhiteboardSection, AudioRecording } from '@/types';
import { mockChallenges, mockSessions, sectionTimings } from '@/services/mockData';
import { toast } from 'sonner';

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

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [challenges] = useState<Challenge[]>(mockChallenges);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentSection, setCurrentSection] = useState<WhiteboardSection>('problem_discovery');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [sectionProgress, setSectionProgress] = useState<Record<WhiteboardSection, number>>({
    problem_discovery: 0,
    problem_definition: 0,
    brainstorming: 0,
    solution_prioritization: 0,
    wireframing: 0
  });

  const selectChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setCurrentChallenge(challenge);
      toast.success(`Selected challenge: ${challenge.title}`);
    }
  };

  const startSession = () => {
    if (!currentChallenge) {
      toast.error("Please select a challenge first");
      return;
    }
    
    const newSession: Session = {
      id: `s${sessions.length + 1}`,
      date: new Date().toISOString(),
      challenge: currentChallenge,
      duration: 0,
      status: 'in-progress'
    };
    
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    setCurrentSection('problem_discovery');
    toast.success("Session started!");
  };

  const endSession = () => {
    if (currentSession) {
      const updatedSession = { ...currentSession, status: 'completed' as const };
      setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(null);
      toast.success("Session ended! View your feedback on the dashboard.");
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    const recordingInterval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Store interval id in window to clear it later
    (window as any).recordingInterval = recordingInterval;
    toast.success("Recording started");
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval((window as any).recordingInterval);
    toast.success("Recording stopped");
    
    // In a real app, we would process the audio recording here
    // For MVP, we're just simulating this
    if (currentSession) {
      const newRecording: AudioRecording = {
        sessionId: currentSession.id,
        audioBlob: new Blob(), // This would be the actual recording in a real app
      };
      addRecording(newRecording);
    }
  };

  const updateSectionProgress = (section: WhiteboardSection, progress: number) => {
    setSectionProgress(prev => ({
      ...prev,
      [section]: progress
    }));
  };

  const addRecording = (recording: AudioRecording) => {
    setAudioRecordings(prev => [...prev, recording]);
  };

  const contextValue = {
    challenges,
    sessions,
    currentChallenge,
    currentSession,
    currentSection,
    isRecording,
    recordingTime,
    sectionProgress,
    audioRecordings,
    selectChallenge,
    startSession,
    endSession,
    setCurrentSection,
    startRecording,
    stopRecording,
    updateSectionProgress,
    addRecording
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
