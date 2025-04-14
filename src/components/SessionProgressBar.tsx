
import React from 'react';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { useSession } from '@/context/SessionContext';
import { Progress } from '@/components/ui/progress';
import { useSessionControls } from '@/hooks/useSessionControls';

interface SessionProgressBarProps {
  sections: WhiteboardSection[];
}

const SessionProgressBar: React.FC<SessionProgressBarProps> = ({ sections }) => {
  const { currentSection } = useSession();
  const { sessionProgress } = useSessionControls();
  
  return (
    <div className="w-full mb-6 space-y-4">
      {/* Progress bar */}
      <Progress value={sessionProgress} className="h-2" />
      
      {/* Section markers */}
      <div className="flex items-center justify-between relative">
        {sections.map((section, index) => {
          const isActive = section === currentSection;
          const isPast = sections.indexOf(section) < sections.indexOf(currentSection);
          
          return (
            <div 
              key={section} 
              className="flex flex-col items-center"
            >
              <div 
                className={`h-3 w-3 rounded-full ${
                  isActive 
                    ? 'bg-brand-500 ring-2 ring-brand-200' 
                    : isPast 
                    ? 'bg-brand-500' 
                    : 'bg-gray-200'
                }`}
              />
              
              <span 
                className={`text-xs mt-2 text-center max-w-[60px] ${
                  isActive 
                    ? 'text-brand-500 font-medium' 
                    : isPast 
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
  );
};

export default SessionProgressBar;
