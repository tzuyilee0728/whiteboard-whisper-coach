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
    selectChallenge,
    updateRecordingTime,
    customSessionTime
  } = useSession();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0); // Initialize to 0, will set properly on session start
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
    }
  }, [currentSection, sections, setCurrentSection]);
  
  // Function to move to the previous section
  const handlePrevSection = useCallback(() => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      setCurrentSection(prevSection);
      setSectionTime(0); // Reset section timer
    } else {
      toast.info("You're at the first section!");
    }
  }, [currentSection, sections, setCurrentSection]);

  // Handle timer logic - countdown from set time
  useEffect(() => {
    let interval: number | undefined;
    
    // Only run timer when session is active and not paused
    if (currentSession && !isPaused) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1;
          // Update recording time to match elapsed session time
          updateRecordingTime(newElapsed);
          return newElapsed;
        });
        
        setRemainingTime(prev => {
          // Ensure we don't go below zero
          return prev > 0 ? prev - 1 : 0;
        });
        
        setSectionTime(prev => prev + 1);
        
        // Check if section time is up
        const currentSectionTiming = sectionTimings[currentSection]?.duration || 300;
        if (sectionTime >= currentSectionTiming) {
          handleNextSection();
        }
        
        // Check if total time is up
        if (remainingTime <= 1) {
          toast.info("Your session time is up! You can continue or end the session.");
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession, isPaused, currentSection, sectionTime, handleNextSection, updateRecordingTime, remainingTime, customSessionTime]);
  
  // Handle recording synchronization with session timer
  useEffect(() => {
    if (currentSession && !isPaused && !isRecording) {
      // Start recording automatically when session starts or resumes
      startRecording();
    } else if ((isPaused || !currentSession) && isRecording) {
      // Stop recording when session pauses or ends
      stopRecording();
    }
  }, [currentSession, isPaused, isRecording, startRecording, stopRecording]);
  
  // Handle starting the session
  const handleStartSession = () => {
    // Select random challenge if one isn't already selected
    if (!currentChallenge) {
      const randomIndex = Math.floor(Math.random() * mockChallenges.length);
      const randomChallenge = mockChallenges[randomIndex];
      selectChallenge(randomChallenge.id);
      
      setTimeout(() => {
        // Set remaining time immediately before starting the session
        setRemainingTime(customSessionTime * 60);
        startSession();
        setElapsedTime(0);  // Reset elapsed time
        setSectionTime(0);  // Reset section time
        setIsPaused(false);  // Ensure not paused
      }, 100);
    } else {
      // Set remaining time immediately before starting the session
      setRemainingTime(customSessionTime * 60);
      startSession();
      setElapsedTime(0);  // Reset elapsed time
      setSectionTime(0);  // Reset section time
      setIsPaused(false);  // Ensure not paused
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
      // Resuming - recording will be handled by the effect above
      toast("Session resumed");
    } else {
      // Pausing - recording will be handled by the effect above
      toast("Session paused");
    }
  };

  return {
    currentChallenge,
    currentSession,
    currentSection,
    sections,
    totalTime: remainingTime, // Return remaining time as totalTime for display purposes
    isPaused,
    isRecording,
    handleStartSession,
    handleEndSession,
    handleNextSection,
    handlePrevSection,
    handlePauseResumeSession
  };
}
