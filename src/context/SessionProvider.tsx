
import React, { useState, ReactNode, useEffect } from 'react';
import { Challenge, Session, WhiteboardSection, AudioRecording, Feedback } from '@/types';
import { mockChallenges, mockSessions } from '@/services/mockData';
import { generateSessionFeedback } from './sessionUtils';
import { toast } from 'sonner';
import { SessionContext } from './SessionContext';

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

  // We don't need a separate recording timer as we'll use the session timer from useSessionControls
  // Remove the recording timer effect since it will be synchronized with the session timer

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
    setRecordingTime(0);
    toast.success("Session started!");
  };

  const endSession = () => {
    if (currentSession) {
      // Generate feedback
      const feedback: Feedback = generateSessionFeedback(currentSession);
      
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
    toast.success("Recording started");
  };

  const stopRecording = () => {
    setIsRecording(false);
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

  // Method to update recording time from session time
  const updateRecordingTime = (time: number) => {
    if (isRecording) {
      setRecordingTime(time);
    }
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
    addRecording,
    updateRecordingTime
  };

  // Return the provider with the context value
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
