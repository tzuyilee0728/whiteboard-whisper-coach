
import React from 'react';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { useSession } from '@/context/SessionContext';
import { Progress } from '@/components/ui/progress';

interface SessionProgressBarProps {
  sections: WhiteboardSection[];
  totalTime?: number;
  initialTime?: number;
}

const SessionProgressBar: React.FC<SessionProgressBarProps> = ({ 
  sections,
  totalTime = 0,
  initialTime = 0
}) => {
  const { currentSection } = useSession();
  
  // Calculate progress percentage based on remaining time
  const getProgressPercentage = () => {
    if (!initialTime || initialTime === 0) return 0;
    
    // Calculate how much time has elapsed as a percentage
    const elapsedTimePercentage = Math.max(0, Math.min(100, 100 - ((totalTime / initialTime) * 100)));
    return elapsedTimePercentage;
  };

  return (
    <div className="w-full mb-6">
      {/* Main progress bar */}
      <Progress value={getProgressPercentage()} className="h-2 mb-4" />
      
      {/* Section labels underneath */}
      <div className="flex justify-between">
        {sections.map((section) => {
          return (
            <div key={section} className="flex flex-col items-center">
              <span className="text-xs font-medium text-gray-600">
                {sectionTimings[section].title.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionProgressBar;
