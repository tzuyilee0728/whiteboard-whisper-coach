
import React from 'react';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';

interface SessionFixedControlsProps {
  handleEndSession: () => void;
}

const SessionFixedControls: React.FC<SessionFixedControlsProps> = ({
  handleEndSession
}) => {
  const { 
    isPaused,
    handlePauseResumeSession
  } = useSession();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-white border-t border-gray-200 shadow-lg flex justify-end gap-3 z-10">
      <Button 
        onClick={handlePauseResumeSession}
        variant="outline"
        size="lg"
        className="flex items-center gap-2"
      >
        {isPaused ? (
          <>
            <Play className="h-5 w-5" />
            Resume
          </>
        ) : (
          <>
            <Pause className="h-5 w-5" />
            Pause
          </>
        )}
      </Button>
      
      <Button 
        onClick={handleEndSession} 
        variant="destructive"
        size="lg"
        className="flex items-center gap-2"
      >
        <StopCircle className="h-5 w-5" />
        End
      </Button>
    </div>
  );
};

export default SessionFixedControls;
