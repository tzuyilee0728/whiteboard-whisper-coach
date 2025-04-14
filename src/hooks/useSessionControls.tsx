
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
  
  // Convert customSessionTime from minutes to seconds
  const initialTotalTime = customSessionTime * 60;
  
  const [totalTime, setTotalTime] = useState(initialTotalTime);
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
      // Removed toast notification
    } else {
      // Removed toast for the final section
    }
  }, [currentSection, sections, setCurrentSection]);
  
  // Function to move to the previous section
  const handlePrevSection = useCallback(() => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      setCurrentSection(prevSection);
      setSectionTime(0); // Reset section timer
      // Existing toast notification already removed
    } else {
      // Kept the toast for the first section
      toast.info("You're at the first section!");
    }
  }, [currentSection, sections, setCurrentSection]);

  // Handle timer logic - responsive to session and recording states
  useEffect(() => {
    let interval: number | undefined;
    
    // Only run timer when session is active and not paused
    if (currentSession && !isPaused) {
      interval = window.setInterval(() => {
        setTotalTime(prev => {
          const newTotal = Math.max(0, prev - 1); // Count down instead of up, but never go below 0
          
          // Update recording time to match elapsed time
          const elapsedTime = initialTotalTime - newTotal;
          updateRecordingTime(elapsedTime);
          
          // End session when time reaches 0
          if (newTotal === 0) {
            toast.info("Time's up! Session ending.");
            setTimeout(() => endSession(), 1000);
          }
          
          return newTotal;
        });
        
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
  }, [currentSession, isPaused, currentSection, sectionTime, handleNextSection, initialTotalTime, updateRecordingTime, endSession]);
  
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
  
  // Reset timers when session starts
  useEffect(() => {
    if (currentSession) {
      // Initialize with the custom session time in seconds
      setTotalTime(customSessionTime * 60);
      setSectionTime(0);
    }
  }, [currentSession, customSessionTime]);
  
  // Handle starting the session
  const handleStartSession = () => {
    // Select random challenge if one isn't already selected
    if (!currentChallenge) {
      const randomIndex = Math.floor(Math.random() * mockChallenges.length);
      const randomChallenge = mockChallenges[randomIndex];
      selectChallenge(randomChallenge.id);
      
      setTimeout(() => {
        startSession();
        setTotalTime(customSessionTime * 60);  // Initialize with custom time in seconds
        setSectionTime(0);  // Explicitly reset section time
        setIsPaused(false);  // Ensure not paused
      }, 100);
    } else {
      startSession();
      setTotalTime(customSessionTime * 60);  // Initialize with custom time in seconds
      setSectionTime(0);  // Explicitly reset section time
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
