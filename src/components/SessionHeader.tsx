import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';

interface SessionHeaderProps {
  title: string;
  description: string;
  totalTime: number;
  isRecording: boolean;
  handleEndSession: () => void;
  showControls?: boolean;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  title,
  description,
  totalTime,
  isRecording,
  handleEndSession,
  showControls = true
}) => {
  const { isPaused } = useSession();
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            <div className={`timer-text ${isPaused ? 'text-amber-500' : 'text-amber-500 font-semibold'}`}>
              {formatTime(totalTime)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionHeader;
