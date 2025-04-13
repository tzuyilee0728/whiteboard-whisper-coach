import { useState, useEffect, useCallback } from 'react';
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
  const [sectionTime, setSectionTime] = useState(0);
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

  // Function to move to the next section
  const handleNextSection = useCallback(() => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentSection(nextSection);
      setSectionTime(0); // Reset section timer
      toast.success(`Moving to ${sectionTimings[nextSection].title} section`);
    } else {
      toast.info("You've reached the final section!");
    }
  }, [currentSection, sections, setCurrentSection]);
  
  // Function to move to the previous section
  const handlePrevSection = useCallback(() => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      setCurrentSection(prevSection);
      setSectionTime(0); // Reset section timer
      toast.success(`Moving to ${sectionTimings[prevSection].title} section`);
    } else {
      toast.info("You're at the first section!");
    }
  }, [currentSection, sections, setCurrentSection]);

  // Handle timer logic - responsive to session and recording states
  useEffect(() => {
    let interval: number | undefined;
    
    // Only run timer when session is active and not paused
    // The recording state is now only used for the audio recording timer
    if (currentSession && !isPaused) {
      interval = window.setInterval(() => {
        setTotalTime(prev => prev + 1);
        setSectionTime(prev => prev + 1);
        
        // Check if section time is up
        const currentSectionTiming = sectionTimings[currentSection]?.duration || 300;
        if (sectionTime >= currentSectionTiming) {
          handleNextSection();
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession, isPaused, currentSection, sectionTime, handleNextSection]);
  
  // Handle auto-recording when session starts
  useEffect(() => {
    if (currentSession && !isPaused && !isRecording) {
      // Start recording automatically when session starts
      startRecording();
    }
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
        setSectionTime(0);
        setIsPaused(false);
      }, 100);
    } else {
      startSession();
      setTotalTime(0);
      setSectionTime(0);
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
    isRecording,
    handleStartSession,
    handleEndSession,
    handleNextSection,
    handlePrevSection,
    handlePauseResumeSession
  };
}
