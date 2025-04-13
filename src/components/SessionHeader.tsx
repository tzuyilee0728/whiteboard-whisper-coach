
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, PauseCircle, StopCircle } from 'lucide-react';

interface SessionHeaderProps {
  title: string;
  description: string;
  totalTime: number;
  isPaused: boolean;
  isRecording: boolean;  // Added this prop
  handlePauseResumeSession: () => void;
  handleEndSession: () => void;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  title,
  description,
  totalTime,
  isPaused,
  isRecording,  // Using the new prop
  handlePauseResumeSession,
  handleEndSession
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer is paused either when manually paused or when recording is stopped
  const timerPaused = isPaused || !isRecording;
  
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <Card className="flex-grow">
        <CardContent className="pt-6">
          <h2 className="font-bold text-xl mb-2">{title}</h2>
          <p className="text-gray-700">{description}</p>
        </CardContent>
      </Card>
      
      <Card className="w-full md:w-auto">
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <div>
            <div className="text-sm text-gray-500">Total Time</div>
            <div className={`timer-text ${timerPaused ? 'text-amber-500' : ''}`}>
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
              {timerPaused ? (
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
  );
};

export default SessionHeader;
