import React from 'react';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { useSession } from '@/context/SessionContext';
import { Progress } from '@/components/ui/progress';

interface SessionProgressBarProps {
  sections: WhiteboardSection[];
}

const SessionProgressBar: React.FC<SessionProgressBarProps> = ({ sections }) => {
  const { currentSection, customSessionTime } = useSession();
  
  // Get progress percentage based on remaining time from SessionControls
  const getProgressPercentage = () => {
    // This will be calculated from the totalTime in useSessionControls
    const elapsedPercentage = sessionProgressValue();
    return elapsedPercentage;
  };
  
  // We'll use this to get the progress value from the custom hooks or context
  const sessionProgressValue = () => {
    // Access progress from the hook through a prop or context
    // For now, return a placeholder value that will be updated
    return 30; // This will be replaced with actual progress calculation
  };

  return (
    <div className="w-full mb-6">
      {/* Main progress bar */}
      <Progress value={getProgressPercentage()} className="h-2 mb-4" />
      
      {/* Section labels underneath */}
      <div className="flex justify-between">
        {sections.map((section, index) => {
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
