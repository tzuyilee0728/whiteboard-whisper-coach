
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ChallengeSelector from '@/components/ChallengeSelector';
import { Button } from '@/components/ui/button';
import { Clock, Timer, Plus, Minus } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { toast } from 'sonner';

interface SessionStartScreenProps {
  handleStartSession: () => void;
}

const SessionStartScreen: React.FC<SessionStartScreenProps> = ({ handleStartSession }) => {
  const { currentChallenge, updateSectionDurations } = useSession();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [customDurations, setCustomDurations] = useState<Record<WhiteboardSection, number>>({
    problem_discovery: sectionTimings.problem_discovery.duration,
    problem_definition: sectionTimings.problem_definition.duration,
    ideation: sectionTimings.ideation.duration,
    prioritization: sectionTimings.prioritization.duration,
    user_flow_wireframe: sectionTimings.user_flow_wireframe.duration,
    final_wrap_up: sectionTimings.final_wrap_up.duration
  });
  
  const sections: WhiteboardSection[] = [
    'problem_discovery',
    'problem_definition',
    'ideation',
    'prioritization',
    'user_flow_wireframe',
    'final_wrap_up'
  ];
  
  // Calculate total session time in minutes
  const totalSessionMinutes = Object.values(customDurations).reduce(
    (total, duration) => total + duration, 
    0
  );
  
  const handleIncrementTime = (section: WhiteboardSection) => {
    setCustomDurations(prev => ({
      ...prev,
      [section]: prev[section] + 5
    }));
  };

  const handleDecrementTime = (section: WhiteboardSection) => {
    setCustomDurations(prev => ({
      ...prev,
      [section]: Math.max(5, prev[section] - 5)
    }));
  };
  
  const startCountdown = () => {
    if (!currentChallenge) {
      toast.error("Please select a challenge first");
      return;
    }
    
    // Update section durations in context before starting session
    updateSectionDurations(customDurations);
    
    setIsCountingDown(true);
    setCountdown(5);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Start the session which will trigger the recording to start automatically
          handleStartSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Start a New Practice Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCountingDown ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl font-bold mb-4">{countdown}</div>
              <p className="text-gray-500">Get ready! Your session is about to start...</p>
              <div className="mt-4 animate-pulse">
                <Timer className="h-10 w-10 text-brand-600" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ChallengeSelector />
              
              {currentChallenge && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold text-lg mb-2">{currentChallenge.title}</h3>
                  
                  <div className="bg-blue-50 rounded-md p-4 mb-6">
                    <AlertTitle className="flex items-center text-blue-800 mb-2">
                      <Clock className="mr-2 h-5 w-5" />
                      Session Structure
                    </AlertTitle>
                    <AlertDescription className="text-blue-800">
                      <p className="mb-2">Customize duration for each section:</p>
                      <ul className="space-y-3 mt-4">
                        {sections.map((section) => (
                          <li key={section} className="flex items-center justify-between">
                            <span className="font-medium">{sectionTimings[section].title}</span>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleDecrementTime(section)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {customDurations[section]} min
                              </span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleIncrementTime(section)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4">
                        Total time: <span className="font-medium">{totalSessionMinutes} minutes</span>
                      </p>
                    </AlertDescription>
                  </div>
                  
                  <Button 
                    onClick={startCountdown}
                    className="w-full bg-brand-600 hover:bg-brand-700"
                  >
                    Start Practice Session
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionStartScreen;
