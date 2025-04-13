
import { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { WhiteboardSection } from '@/types';
import { sectionTimings, mockChallenges } from '@/services/mockData';

export function useSessionControls() {
  const { 
    currentChallenge, 
    currentSection, 
    setCurrentSection, 
    startSession, 
    endSession, 
    isRecording,
    currentSession,
    startRecording,
    stopRecording,
    selectChallenge
  } = useSession();
  
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  
  const sections: WhiteboardSection[] = [
    'problem_discovery',
    'problem_definition',
    'ideation',
    'prioritization',
    'user_flow_wireframe',
    'final_wrap_up'
  ];

  // Handle timer logic
  useEffect(() => {
    let interval: number | undefined;
    
    if (currentSession && !isPaused) {
      // Start recording automatically when session starts
      if (!isRecording) {
        startRecording();
      }
      
      interval = window.setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession, isPaused, isRecording, startRecording]);
  
  // Handle starting the session
  const handleStartSession = () => {
    // Select random challenge if one isn't already selected
    if (!currentChallenge) {
      const randomIndex = Math.floor(Math.random() * mockChallenges.length);
      const randomChallenge = mockChallenges[randomIndex];
      selectChallenge(randomChallenge.id);
      
      setTimeout(() => {
        startSession();
        setTotalTime(0);
        setIsPaused(false);
      }, 100);
    } else {
      startSession();
      setTotalTime(0);
      setIsPaused(false);
    }
  };
  
  // Handle ending the session
  const handleEndSession = () => {
    if (isRecording) {
      stopRecording();
    }
    
    endSession();
    navigate('/dashboard');
  };
  
  // Handle moving to the next section
  const handleNextSection = () => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentSection(nextSection);
      toast.success(`Moving to ${sectionTimings[nextSection].title} section`);
    } else {
      toast.info("You've reached the final section!");
    }
  };
  
  // Handle moving to the previous section
  const handlePrevSection = () => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      setCurrentSection(prevSection);
      toast.success(`Moving to ${sectionTimings[prevSection].title} section`);
    } else {
      toast.info("You're at the first section!");
    }
  };
  
  // Handle pausing and resuming the session
  const handlePauseResumeSession = () => {
    setIsPaused(!isPaused);
    
    if (isPaused) {
      // Resuming
      if (!isRecording) {
        startRecording();
      }
      toast("Session resumed");
    } else {
      // Pausing
      if (isRecording) {
        stopRecording();
      }
      toast("Session paused");
    }
  };

  return {
    currentChallenge,
    currentSession,
    currentSection,
    sections,
    totalTime,
    isPaused,
    handleStartSession,
    handleEndSession,
    handleNextSection,
    handlePrevSection,
    handlePauseResumeSession
  };
}
