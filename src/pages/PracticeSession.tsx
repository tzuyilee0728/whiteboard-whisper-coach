
import React, { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import NavBar from '@/components/NavBar';
import ChallengeSelector from '@/components/ChallengeSelector';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import SectionGuidance from '@/components/SectionGuidance';
import AudioRecorder from '@/components/AudioRecorder';
import AIInteraction from '@/components/AIInteraction';
import NotePad from '@/components/NotePad';
import TranscriptionView from '@/components/TranscriptionView';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Share2,
  PauseCircle,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PracticeSession = () => {
  const { 
    currentChallenge, 
    currentSection, 
    setCurrentSection, 
    startSession, 
    endSession, 
    isRecording,
    currentSession
  } = useSession();
  
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  const navigate = useNavigate();
  
  const sections: WhiteboardSection[] = [
    'problem_discovery',
    'problem_definition',
    'brainstorming',
    'solution_prioritization',
    'wireframing'
  ];
  
  // Handle timer logic
  useEffect(() => {
    let interval: number | undefined;
    
    if (currentSession && !isPaused) {
      interval = window.setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession, isPaused]);
  
  // Handle starting the session
  const handleStartSession = () => {
    if (!currentChallenge) {
      toast.error("Please select a challenge first");
      return;
    }
    
    startSession();
    setTotalTime(0);
    setIsPaused(false);
  };
  
  // Handle ending the session
  const handleEndSession = () => {
    if (isRecording) {
      // Stop recording first
      toast.error("Please stop recording before ending the session");
      return;
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
    toast(isPaused ? "Session resumed" : "Session paused");
  };
  
  // Handle sharing functionality
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
    if (!showShareOptions) {
      toast.success("Share this tool with fellow designers!");
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate total session time in minutes
  const totalSessionMinutes = Object.values(sectionTimings).reduce(
    (total, section) => total + section.duration, 
    0
  );
  
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
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Start a New Practice Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <ChallengeSelector />
                  
                  {currentChallenge && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="font-semibold text-lg mb-2">{currentChallenge.title}</h3>
                      <p className="text-gray-700 mb-4">{currentChallenge.description}</p>
                      
                      <div className="bg-blue-50 rounded-md p-4 mb-6">
                        <AlertTitle className="flex items-center text-blue-800 mb-2">
                          <Clock className="mr-2 h-5 w-5" />
                          Session Structure
                        </AlertTitle>
                        <AlertDescription className="text-blue-800">
                          <p className="mb-2">This session will guide you through these 5 sections:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {sections.map((section) => (
                              <li key={section}>
                                <span className="font-medium">{sectionTimings[section].title}</span>
                                <span className="text-sm text-blue-700"> ({sectionTimings[section].duration} min)</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2">
                            Total time: <span className="font-medium">{totalSessionMinutes} minutes</span>
                          </p>
                        </AlertDescription>
                      </div>
                      
                      <Button 
                        onClick={handleStartSession} 
                        className="w-full bg-brand-600 hover:bg-brand-700"
                      >
                        Start Practice Session
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <Card className="flex-grow">
                <CardContent className="pt-6">
                  <h2 className="font-bold text-xl mb-2">{currentChallenge?.title}</h2>
                  <p className="text-gray-700">{currentChallenge?.description}</p>
                </CardContent>
              </Card>
              
              <Card className="w-full md:w-auto">
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <div>
                    <div className="text-sm text-gray-500">Total Time</div>
                    <div className={`timer-text ${isPaused ? 'text-amber-500' : ''}`}>
                      {formatTime(totalTime)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handlePauseResumeSession}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <PauseCircle className="h-4 w-4" />
                          Pause
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleEndSession} 
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <StopCircle className="h-4 w-4" />
                      End
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Session Progress
                  </h3>
                  
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <SectionGuidance key={section} section={section} />
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      onClick={handlePrevSection} 
                      variant="outline"
                      size="sm"
                      disabled={sections.indexOf(currentSection) === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    <Button 
                      onClick={handleNextSection} 
                      variant="outline"
                      size="sm"
                      disabled={sections.indexOf(currentSection) === sections.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <AudioRecorder />
              </div>
              
              <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <div className="h-[400px] md:h-auto">
                  <AIInteraction />
                </div>
                
                <div className="h-[400px] md:h-auto">
                  <NotePad />
                </div>
                
                <div className="h-[400px] md:h-auto lg:col-span-2">
                  <TranscriptionView />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="bg-gray-800 text-white py-8 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 AI Whiteboard Challenge Coach</p>
        </div>
      </footer>
    </div>
  );
};

export default PracticeSession;
