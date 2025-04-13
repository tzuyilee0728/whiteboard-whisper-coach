
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ChallengeSelector from '@/components/ChallengeSelector';
import { Button } from '@/components/ui/button';
import { Clock, Timer } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { toast } from 'sonner';

interface SessionStartScreenProps {
  handleStartSession: () => void;
}

const SessionStartScreen: React.FC<SessionStartScreenProps> = ({ handleStartSession }) => {
  const { currentChallenge } = useSession();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const sections: WhiteboardSection[] = [
    'problem_discovery',
    'problem_definition',
    'brainstorming',
    'solution_prioritization',
    'wireframing'
  ];
  
  // Calculate total session time in minutes
  const totalSessionMinutes = Object.values(sectionTimings).reduce(
    (total, section) => total + section.duration, 
    0
  );
  
  const startCountdown = () => {
    if (!currentChallenge) {
      toast.error("Please select a challenge first");
      return;
    }
    
    setIsCountingDown(true);
    setCountdown(5);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
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
