
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
import { Slider } from '@/components/ui/slider';

interface SessionStartScreenProps {
  handleStartSession: () => void;
}

const SessionStartScreen: React.FC<SessionStartScreenProps> = ({ handleStartSession }) => {
  const { currentChallenge, setCustomSessionTime } = useSession();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [customTime, setCustomTime] = useState(45);
  
  const sections: WhiteboardSection[] = [
    'problem_discovery',
    'problem_definition',
    'ideation',
    'prioritization',
    'user_flow_wireframe',
    'final_wrap_up'
  ];
  
  // Calculate total session time in minutes
  const totalSessionMinutes = customTime;
  
  const startCountdown = () => {
    if (!currentChallenge) {
      toast.error("Please select a challenge first");
      return;
    }

    // Set the custom session time in the context
    setCustomSessionTime(customTime);
    
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

  const incrementTime = () => {
    setCustomTime(prev => Math.min(prev + 5, 120)); // Max 120 minutes (2 hours)
  };

  const decrementTime = () => {
    setCustomTime(prev => Math.max(prev - 5, 15)); // Min 15 minutes
  };

  const handleSliderChange = (values: number[]) => {
    setCustomTime(values[0]);
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
                      <p className="mb-2">This session will guide you through these 6 sections:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {sections.map((section) => (
                          <li key={section}>
                            <span className="font-medium">{sectionTimings[section].title}</span>
                            <span className="text-sm text-blue-700"> ({sectionTimings[section].duration} min)</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Set Total Session Time:</span>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              onClick={decrementTime}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-blue-800 font-semibold w-16 text-center">{customTime} min</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              onClick={incrementTime}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Slider 
                          value={[customTime]} 
                          min={15} 
                          max={120} 
                          step={5} 
                          onValueChange={handleSliderChange}
                          className="my-4"
                        />
                        <div className="flex justify-between text-xs text-blue-700">
                          <span>15 min</span>
                          <span>120 min</span>
                        </div>
                      </div>
                      
                      <p className="mt-4 font-medium">
                        Total time: <span className="font-bold">{totalSessionMinutes} minutes</span>
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
