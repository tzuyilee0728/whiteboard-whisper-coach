
import { useCallback, useRef } from 'react';
import { Category, Challenge, AudioRecording, WhiteboardSection } from '@/types';
import { generateSessionFeedback } from '@/context/sessionUtils';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';

export const useSessionManager = (state: ReturnType<typeof import('./useSessionState').useSessionState>) => {
  // Add a ref to track if transcription service is initialized
  const transcriptionInitialized = useRef(false);

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
    
    // First start the transcription service
    transcriptionService.start();
    transcriptionInitialized.current = true;
    
    // Then set recording to true (this will trigger the recorder to start)
    setTimeout(() => {
      state.setIsRecording(true);
    }, 500);
    
    // Also start the AI analysis service
    aiAnalysisService.startAnalysis('problem_discovery');
    
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
      
      // First stop recording
      if (state.isRecording) {
        state.setIsRecording(false);
      }
      
      // Then stop transcription and AI analysis services
      transcriptionService.stop();
      transcriptionInitialized.current = false;
      aiAnalysisService.stopAnalysis();
      
      // Finally clear the session state
      state.setCurrentSession(null);
      state.setIsPaused(false);
      
      toast.success("Session ended! View your feedback on the dashboard.");
    }
  }, [state]);

  const startRecording = useCallback(() => {
    // Start the transcription service if not already started
    if (!transcriptionInitialized.current) {
      transcriptionService.start();
      transcriptionInitialized.current = true;
    }
    
    state.setIsRecording(true);
    toast.success("Recording started");
  }, [state]);

  const stopRecording = useCallback(() => {
    state.setIsRecording(false);
    
    // Don't stop the transcription service here, just pause it
    if (transcriptionInitialized.current) {
      transcriptionService.stop();
    }
    
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
    if (state.isRecording || state.isPaused) {
      state.setRecordingTime(time);
    }
  }, [state]);

  const handlePauseResumeSession = useCallback(() => {
    const wasPaused = state.isPaused;
    state.setIsPaused(!wasPaused);
    
    if (wasPaused) {
      // Was paused, now resuming
      startRecording();
      toast("Session resumed");
    } else {
      // Was running, now pausing
      stopRecording();
      toast("Session paused");
    }
  }, [state.isPaused, startRecording, stopRecording]);

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
