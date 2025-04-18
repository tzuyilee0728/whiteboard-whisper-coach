
import { useCallback } from 'react';
import { Category, Challenge } from '@/types';
import { generateSessionFeedback } from '@/context/sessionUtils';
import { toast } from 'sonner';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';

export const useSessionControl = (state: ReturnType<typeof import('./useSessionState').useSessionState>) => {
  const generateRandomChallenge = useCallback((industry: Category) => {
    const industrySpecificChallenges = state.challenges.filter(c => c.category === industry);
    if (industrySpecificChallenges.length === 0) {
      toast.error("No challenges found for this industry");
      return null;
    }
    const randomIndex = Math.floor(Math.random() * industrySpecificChallenges.length);
    return industrySpecificChallenges[randomIndex];
  }, [state.challenges]);

  const selectIndustry = useCallback((industry: Category) => {
    state.setSelectedIndustry(industry);
    state.setCurrentChallenge(null);
  }, [state]);

  const selectChallenge = useCallback((challengeId: string) => {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (challenge) {
      state.setCurrentChallenge(challenge);
      toast.success(`Selected challenge: ${challenge.title}`);
    }
  }, [state]);

  const handlePauseResumeSession = useCallback(() => {
    const wasPaused = state.isPaused;
    state.setIsPaused(!wasPaused);
    toast(wasPaused ? "Session resumed" : "Session paused");
  }, [state.isPaused]);

  const updateSectionProgress = useCallback((section: WhiteboardSection, progress: number) => {
    state.setSectionProgress(prev => ({
      ...prev,
      [section]: progress
    }));
  }, [state]);

  return {
    selectIndustry,
    selectChallenge,
    generateRandomChallenge,
    handlePauseResumeSession,
    updateSectionProgress
  };
};
