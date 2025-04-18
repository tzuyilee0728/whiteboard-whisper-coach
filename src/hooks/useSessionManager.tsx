
import { useCallback, useEffect } from 'react';
import { Category, Challenge, AudioRecording, WhiteboardSection } from '@/types';
import { generateSessionFeedback } from '@/context/sessionUtils';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';

export const useSessionManager = (state: ReturnType<typeof import('./useSessionState').useSessionState>) => {
  const selectIndustry = useCallback((industry: Category) => {
    state.setSelectedIndustry(industry);
    state.setCurrentChallenge(null);
  }, [state]);

  const generateRandomChallenge = useCallback((industry: Category) => {
    const industrySpecificChallenges = state.challenges.filter(c => c.category === industry);
    if (industrySpecificChallenges.length === 0) {
      toast.error("No challenges found for this industry");
      return null;
    }
    const randomIndex = Math.floor(Math.random() * industrySpecificChallenges.length);
    return industrySpecificChallenges[randomIndex];
  }, [state.challenges]);

  const selectChallenge = useCallback((challengeId: string) => {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (challenge) {
      state.setCurrentChallenge(challenge);
      toast.success(`Selected challenge: ${challenge.title}`);
    }
  }, [state]);

  const startSession = useCallback(() => {
    if (!state.selectedIndustry) {
      toast.error("Please select an industry first");
      return;
    }
    
    let industryForChallenge = state.selectedIndustry;
    
    // Handle random industry selection
    if (state.selectedIndustry === 'random') {
      const availableIndustries: Category[] = ['e-commerce', 'healthcare', 'finance', 'social', 'productivity'];
      const randomIndex = Math.floor(Math.random() * availableIndustries.length);
      industryForChallenge = availableIndustries[randomIndex];
      toast.success(`Selected ${industryForChallenge} industry randomly`);
    }
    
    const randomChallenge = generateRandomChallenge(industryForChallenge);
    if (!randomChallenge) return;
    
    state.setCurrentChallenge(randomChallenge);
    
    const newSession = {
      id: `s${state.sessions.length + 1}`,
      date: new Date().toISOString(),
      challenge: randomChallenge,
      duration: 0,
      status: 'in-progress' as const
    };
    
    state.setSessions([...state.sessions, newSession]);
    state.setCurrentSession(newSession);
    state.setCurrentSection('problem_discovery');
    state.setRecordingTime(0);
    state.setIsPaused(false);
    state.setIsRecording(true);
    
    toast.success("Session started!");
  }, [state, generateRandomChallenge]);

  const endSession = useCallback(() => {
    if (state.currentSession) {
      const feedback = generateSessionFeedback(state.currentSession);
      const updatedSession = { 
        ...state.currentSession, 
        status: 'completed' as const,
        feedback 
      };
      
      state.setSessions(state.sessions.map(s => 
        s.id === state.currentSession.id ? updatedSession : s
      ));
      state.setCurrentSession(null);
      state.setIsPaused(false);
      
      if (state.isRecording) {
        stopRecording();
      }
      
      // Stop transcription and AI analysis services
      transcriptionService.stop();
      aiAnalysisService.stopAnalysis();
      
      toast.success("Session ended! View your feedback on the dashboard.");
    }
  }, [state]);

  const startRecording = useCallback(() => {
    state.setIsRecording(true);
    toast.success("Recording started");
  }, [state]);

  const stopRecording = useCallback(() => {
    state.setIsRecording(false);
    toast.success("Recording stopped");
    
    if (state.currentSession) {
      const newRecording: AudioRecording = {
        sessionId: state.currentSession.id,
        audioBlob: new Blob(),
      };
      addRecording(newRecording);
    }
  }, [state]);

  const updateSectionProgress = useCallback((section: WhiteboardSection, progress: number) => {
    state.setSectionProgress(prev => ({
      ...prev,
      [section]: progress
    }));
  }, [state]);

  const addRecording = useCallback((recording: AudioRecording) => {
    state.setAudioRecordings(prev => [...prev, recording]);
  }, [state]);

  const updateRecordingTime = useCallback((time: number) => {
    if (state.isRecording) {
      state.setRecordingTime(time);
    }
  }, [state]);

  const handlePauseResumeSession = useCallback(() => {
    state.setIsPaused(!state.isPaused);
    
    if (state.isPaused) {
      if (!state.isRecording) {
        startRecording();
      }
      toast("Session resumed");
    } else {
      if (state.isRecording) {
        stopRecording();
      }
      toast("Session paused");
    }
  }, [state.isPaused, state.isRecording, stopRecording, startRecording]);

  return {
    selectIndustry,
    selectChallenge,
    startSession,
    endSession,
    startRecording,
    stopRecording,
    updateSectionProgress,
    addRecording,
    updateRecordingTime,
    handlePauseResumeSession,
  };
};
