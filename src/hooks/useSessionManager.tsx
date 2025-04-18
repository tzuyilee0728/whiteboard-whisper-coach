import { useCallback, useRef, useEffect } from 'react';
import { Category, Challenge, AudioRecording, WhiteboardSection } from '@/types';
import { generateSessionFeedback } from '@/context/sessionUtils';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { supabase } from '@/integrations/supabase/client';
import { arrayBufferToBase64 } from '@/utils/audioUtils';

export const useSessionManager = (state: ReturnType<typeof import('./useSessionState').useSessionState>) => {
  // Add a ref to track if transcription service is initialized
  const transcriptionInitialized = useRef(false);
  const audioChunksRef = useRef<Blob[]>([]);

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
      id: `s${Date.now()}`, // Use timestamp for unique ID
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
    audioChunksRef.current = []; // Clear any previous audio chunks
    
    console.log("Starting session:", newSession);
    
    // First start the transcription service
    const transcriptionStarted = transcriptionService.start();
    console.log("Transcription service started:", transcriptionStarted);
    transcriptionInitialized.current = transcriptionStarted;
    
    // Then set recording to true (this will trigger the recorder to start)
    setTimeout(() => {
      state.setIsRecording(true);
      console.log("Recording started");
    }, 500);
    
    // Also start the AI analysis service
    aiAnalysisService.startAnalysis('problem_discovery');
    
    toast.success("Session started!");
  }, [state, generateRandomChallenge]);

  const saveRecordingToDatabase = async (audioBlob: Blob, sessionId: string) => {
    try {
      if (!audioBlob || audioBlob.size === 0) {
        console.error("No audio data to save");
        return;
      }
      
      console.log(`Saving recording for session ${sessionId}, size: ${audioBlob.size} bytes`);
      
      // Convert blob to base64 for storage
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = arrayBufferToBase64(arrayBuffer);
      
      // Save to Supabase - using a custom RPC function instead of directly inserting
      const { data, error } = await supabase.rpc('save_session_recording', {
        p_session_id: sessionId,
        p_audio_data: base64Audio
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Recording saved successfully:", data);
      toast.success("Session recording saved to database");
      
    } catch (err) {
      console.error("Error saving recording:", err);
      toast.error("Failed to save recording");
    }
  };

  const endSession = useCallback(async () => {
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
      
      // Get the final audio recording and save it
      const audioElement = document.querySelector('audio-recorder') as HTMLElement;
      if (audioElement && audioElement.dataset && audioElement.dataset.audioBlob) {
        // If there's a direct reference to the audio blob
        try {
          const audioBlob = JSON.parse(audioElement.dataset.audioBlob);
          await saveRecordingToDatabase(audioBlob, state.currentSession.id);
        } catch (err) {
          console.error("Error parsing audio blob:", err);
        }
      } else if (window.audioRecorder && window.audioRecorder.getAllAudioAsBlob) {
        // If we have a global reference to the audio recorder
        const audioBlob = window.audioRecorder.getAllAudioAsBlob();
        if (audioBlob) {
          await saveRecordingToDatabase(audioBlob, state.currentSession.id);
        }
      } else if (audioChunksRef.current.length > 0) {
        // Use our stored audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await saveRecordingToDatabase(audioBlob, state.currentSession.id);
      }
      
      // Finally clear the session state
      state.setCurrentSession(null);
      state.setIsPaused(false);
      
      toast.success("Session ended! View your feedback on the dashboard.");
    }
  }, [state]);

  // Listen for audio data events to store for later saving
  useEffect(() => {
    const handleAudioData = (event: Event) => {
      const customEvent = event as CustomEvent<Blob>;
      if (customEvent.detail && customEvent.detail.size > 0 && state.currentSession) {
        audioChunksRef.current.push(customEvent.detail);
      }
    };

    window.addEventListener('audioData', handleAudioData);
    
    return () => {
      window.removeEventListener('audioData', handleAudioData);
    };
  }, [state.currentSession]);

  const startRecording = useCallback(() => {
    // Start the transcription service if not already started
    if (!transcriptionInitialized.current) {
      const started = transcriptionService.start();
      transcriptionInitialized.current = started;
      console.log("Transcription service started from startRecording:", started);
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
    saveRecordingToDatabase,
  };
};

// Declare global interface to access audio recorder
declare global {
  interface Window {
    audioRecorder?: {
      getAllAudioAsBlob: () => Blob | null;
    };
  }
}
