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
    customSessionTime,
    isPaused,
    handlePauseResumeSession
  } = useSession();
  
  // Convert customSessionTime from minutes to seconds
  const initialTotalTime = customSessionTime * 60;
  
  const [totalTime, setTotalTime] = useState(initialTotalTime);
  const [sectionTime, setSectionTime] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const navigate = useNavigate();
  
  const sections: WhiteboardSection[] = [
    'problem_discovery',
    'problem_definition',
    'ideation',
    'prioritization',
    'user_flow_wireframe',
    'final_wrap_up'
  ];
  
  // Calculate session progress percentage
  useEffect(() => {
    if (currentSession) {
      const progress = Math.max(0, Math.min(100, 100 - ((totalTime / initialTotalTime) * 100)));
      setSessionProgress(progress);
    }
  }, [totalTime, initialTotalTime, currentSession]);

  // Function to move to the next section
  const handleNextSection = useCallback(() => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentSection(nextSection);
      setSectionTime(0); // Reset section timer
    } else {
      toast.info("You're at the final section!");
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
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession, isPaused, initialTotalTime, updateRecordingTime, endSession]);
  
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
        startRecording(); // Automatically start recording when session starts
        setTotalTime(customSessionTime * 60);  // Initialize with custom time in seconds
        setSectionTime(0);  // Explicitly reset section time
      }, 100);
    } else {
      startSession();
      startRecording(); // Automatically start recording when session starts
      setTotalTime(customSessionTime * 60);  // Initialize with custom time in seconds
      setSectionTime(0);  // Explicitly reset section time
    }
  };
  
  // Handle ending the session
  const handleEndSession = () => {
    endSession();
    navigate('/dashboard');
  };

  return {
    currentChallenge,
    currentSession,
    currentSection,
    sections,
    totalTime,
    initialTotalTime,
    isPaused,
    isRecording,
    sessionProgress,
    handleStartSession,
    handleEndSession,
    handleNextSection,
    handlePrevSection,
    handlePauseResumeSession
  };
}
