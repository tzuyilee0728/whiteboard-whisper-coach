import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Challenge, Session, WhiteboardSection, AudioRecording, Feedback } from '@/types';
import { mockChallenges, mockSessions, sectionTimings, generateMockFeedback } from '@/services/mockData';
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

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  // All useState hooks at the component level
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
    ideation: 0,
    prioritization: 0,
    user_flow_wireframe: 0,
    final_wrap_up: 0
  });

  // Handler functions
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

  const generateSessionFeedback = (): Feedback => {
    if (!currentSession) {
      // Create a default feedback object that matches the Feedback type
      return {
        id: "default",
        sessionId: "default",
        strengths: ["No session data available"],
        improvements: ["No session data available"],
        sectionFeedback: {
          problem_discovery: "No data",
          problem_definition: "No data",
          ideation: "No data",
          prioritization: "No data",
          user_flow_wireframe: "No data",
          final_wrap_up: "No data"
        },
        overallRating: 0
      };
    }
    
    // Generate feedback for each section
    const sectionFeedback: Record<WhiteboardSection, string> = {
      problem_discovery: generateMockFeedback('problem_discovery'),
      problem_definition: generateMockFeedback('problem_definition'),
      ideation: generateMockFeedback('ideation'),
      prioritization: generateMockFeedback('prioritization'),
      user_flow_wireframe: generateMockFeedback('user_flow_wireframe'),
      final_wrap_up: generateMockFeedback('final_wrap_up')
    };
    
    // Generate random strengths and improvements
    const allFeedback = Object.values(sectionFeedback);
    const strengths = allFeedback
      .filter(feedback => !feedback.includes("Consider") && !feedback.includes("Try"))
      .slice(0, 2);
    
    const improvements = allFeedback
      .filter(feedback => feedback.includes("Consider") || feedback.includes("Try"))
      .slice(0, 2);
    
    // If we don't have enough strengths or improvements, add defaults
    if (strengths.length === 0) {
      strengths.push("Good effort overall");
    }
    if (improvements.length === 0) {
      improvements.push("Consider practicing more regularly");
    }
    
    // Random rating between 3 and 5
    const overallRating = Number((3 + Math.random() * 2).toFixed(1));
    
    // Return a properly typed Feedback object
    return {
      id: `f${currentSession.id.substring(1)}`,
      sessionId: currentSession.id,
      strengths,
      improvements,
      sectionFeedback,
      overallRating
    };
  };

  const endSession = () => {
    if (currentSession) {
      // Generate feedback
      const feedback: Feedback = generateSessionFeedback();
      
      // Create an updated session with the correct typing
      const updatedSession: Session = { 
        ...currentSession, 
        status: 'completed',
        feedback: feedback
      };
      
      // Update sessions with type-safe approach
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

  // Create a stable context value object
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

  // Return the provider with the context value
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
