import React, { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import NavBar from '@/components/NavBar';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import SessionStartScreen from '@/components/SessionStartScreen';
import SessionHeader from '@/components/SessionHeader';
import SessionControls from '@/components/SessionControls';
import SessionContent from '@/components/SessionContent';
import PracticeSessionFooter from '@/components/PracticeSessionFooter';
import { WhiteboardSection } from '@/types';
import { sectionTimings, mockChallenges } from '@/services/mockData';

const PracticeSession = () => {
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
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  const navigate = useNavigate();
  
  const sections: WhiteboardSection[] = [
    'problem_discovery',
    'problem_definition',
    'ideation',
    'prioritization',
    'user_flow_wireframe',
    'final_wrap_up'
  ];

  // Select a random challenge on component mount
  useEffect(() => {
    if (!currentSession && mockChallenges.length > 0) {
      // We don't immediately select, we wait for user to click Start
    }
  }, []);
  
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
  
  // Handle sharing functionality
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
    if (!showShareOptions) {
      toast.success("Share this tool with fellow designers!");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Session</h1>
            <p className="text-gray-600">
              Complete a whiteboard challenge with structured guidance
            </p>
          </div>
          
          {currentSession && (
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
        
        {!currentSession ? (
          <SessionStartScreen handleStartSession={handleStartSession} />
        ) : (
          <div className="space-y-6">
            <SessionHeader
              title={currentChallenge?.title || ''}
              description={currentChallenge?.description || ''}
              totalTime={totalTime}
              isPaused={isPaused}
              handlePauseResumeSession={handlePauseResumeSession}
              handleEndSession={handleEndSession}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <SessionControls
                sections={sections}
                currentSection={currentSection}
                handlePrevSection={handlePrevSection}
                handleNextSection={handleNextSection}
              />
              
              <SessionContent />
            </div>
          </div>
        )}
      </div>
      
      <PracticeSessionFooter />
    </div>
  );
};

export default PracticeSession;
