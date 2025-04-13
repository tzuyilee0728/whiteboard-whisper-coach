
import React from 'react';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { Circle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { Progress } from '@/components/ui/progress';
import { useSessionControls } from '@/hooks/useSessionControls';

interface SessionProgressBarProps {
  sections: WhiteboardSection[];
}

const SessionProgressBar: React.FC<SessionProgressBarProps> = ({ sections }) => {
  const { currentSection, customSessionTime } = useSession();
  const { totalTime } = useSessionControls();

  // Calculate progress percentage based on time remaining
  const calculateProgress = () => {
    const totalSeconds = customSessionTime * 60;
    const elapsedSeconds = totalSeconds - totalTime;
    return Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));
  };

  const getSectionStatus = (section: WhiteboardSection) => {
    const currentIndex = sections.indexOf(currentSection);
    const sectionIndex = sections.indexOf(section);
    
    if (sectionIndex < currentIndex) {
      return 'completed';
    } else if (sectionIndex === currentIndex) {
      return 'active';
    } else {
      return 'upcoming';
    }
  };

  return (
    <div className="w-full mb-6">
      {/* Progress Bar */}
      <div className="mb-4">
        <Progress value={calculateProgress()} className="h-2" />
      </div>
      
      <div className="flex items-center justify-between relative">
        {/* Section Markers */}
        <div className="w-full flex items-center justify-between relative z-10">
          {sections.map((section, index) => {
            const status = getSectionStatus(section);
            return (
              <div 
                key={section} 
                className={`flex flex-col items-center`}
              >
                {status === 'active' ? (
                  <Circle 
                    className="h-6 w-6 text-brand-500 bg-white border-2 border-brand-500 rounded-full" 
                    fill="#FFFFFF" 
                  />
                ) : (
                  <Circle 
                    className={`h-6 w-6 bg-white border-2 rounded-full ${
                      status === 'completed' ? 'border-gray-700 bg-gray-200' : 'border-gray-300'
                    }`}
                    fill={status === 'completed' ? '#E5E7EB' : '#FFFFFF'}
                  />
                )}
                
                {/* Section title below the step number */}
                <span 
                  className={`text-xs mt-1 text-center max-w-[60px] ${
                    status === 'active' 
                      ? 'text-brand-500 font-medium' 
                      : status === 'completed' 
                      ? 'text-gray-700' 
                      : 'text-gray-500'
                  }`}
                >
                  {sectionTimings[section].title.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SessionProgressBar;
