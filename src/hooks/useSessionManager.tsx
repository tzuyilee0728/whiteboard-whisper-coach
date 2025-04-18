
import { useCallback, useRef, useEffect } from 'react';
import { Category, WhiteboardSection } from '@/types';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { generateSessionFeedback } from '@/context/sessionUtils';
import { useSessionRecording } from './useSessionRecording';
import { useSessionControl } from './useSessionControl';

export const useSessionManager = (state: ReturnType<typeof import('./useSessionState').useSessionState>) => {
  const transcriptionInitialized = useRef(false);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { saveRecordingToDatabase, addRecording } = useSessionRecording(state);
  const { 
    selectIndustry, 
    selectChallenge, 
    generateRandomChallenge,
    handlePauseResumeSession,
    updateSectionProgress 
  } = useSessionControl(state);

  const startSession = useCallback(() => {
    if (!state.selectedIndustry) {
      toast.error("Please select an industry first");
      return;
    }
    
    let industryForChallenge = state.selectedIndustry;
    
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
      id: `s${Date.now()}`,
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
    audioChunksRef.current = [];
    
    const transcriptionStarted = transcriptionService.start();
    transcriptionInitialized.current = transcriptionStarted;
    
    setTimeout(() => {
      state.setIsRecording(true);
    }, 500);
    
    aiAnalysisService.startAnalysis('problem_discovery');
    
    toast.success("Session started!");
  }, [state, generateRandomChallenge]);

  const endSession = useCallback(async () => {
    if (state.currentSession) {
      // Handle session completion
      const updatedSession = { 
        ...state.currentSession, 
        status: 'completed' as const,
        feedback: generateSessionFeedback(state.currentSession)
      };
      
      state.setSessions(state.sessions.map(s => 
        s.id === state.currentSession.id ? updatedSession : s
      ));
      
      // Stop recording and services
      if (state.isRecording) {
        state.setIsRecording(false);
      }
      
      transcriptionService.stop();
      transcriptionInitialized.current = false;
      aiAnalysisService.stopAnalysis();
      
      // Save audio recording
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await saveRecordingToDatabase(audioBlob, state.currentSession.id);
      }
      
      // Clear session state
      state.setCurrentSession(null);
      state.setIsPaused(false);
      
      toast.success("Session ended! View your feedback on the dashboard.");
    }
  }, [state, saveRecordingToDatabase]);

  // Listen for audio data events
  useEffect(() => {
    const handleAudioData = (event: Event) => {
      const customEvent = event as CustomEvent<Blob>;
      if (customEvent.detail && customEvent.detail.size > 0 && state.currentSession) {
        audioChunksRef.current.push(customEvent.detail);
      }
    };

    window.addEventListener('audioData', handleAudioData);
    return () => window.removeEventListener('audioData', handleAudioData);
  }, [state.currentSession]);

  return {
    selectIndustry,
    selectChallenge,
    startSession,
    endSession,
    handlePauseResumeSession,
    updateSectionProgress,
    addRecording,
    saveRecordingToDatabase,
  };
};
