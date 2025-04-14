
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, PauseCircle, StopCircle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';

interface SessionHeaderProps {
  title: string;
  description: string;
  totalTime: number;
  isRecording: boolean;
  handleEndSession: () => void;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  title,
  description,
  totalTime,
  isRecording,
  handleEndSession
}) => {
  const { isPaused, handlePauseResumeSession } = useSession();
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format time as minutes and seconds
  const formatTotalTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return mins === 0 
      ? `${remainingSecs} sec` 
      : remainingSecs === 0 
        ? `${mins} min` 
        : `${mins} min ${remainingSecs} sec`;
  };
  
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
            <div className="text-sm text-gray-500">Time Remaining</div>
            <div className={`timer-text ${isPaused ? 'text-amber-500' : 'text-blue-600 font-semibold'}`}>
              {formatTotalTime(totalTime)}
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
  );
};

export default SessionHeader;
