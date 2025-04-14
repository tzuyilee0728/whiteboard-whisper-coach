
import React from 'react';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { Circle, CheckCircle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';

interface SessionProgressBarProps {
  sections: WhiteboardSection[];
}

const SessionProgressBar: React.FC<SessionProgressBarProps> = ({ sections }) => {
  const { currentSection } = useSession();

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
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute h-0.5 bg-gray-200 left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
        
        {/* Progress Line Filled */}
        <div 
          className="absolute h-0.5 bg-brand-500 left-0 top-1/2 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ 
            width: `${
              (sections.indexOf(currentSection) / (sections.length - 1)) * 100
            }%` 
          }}
        ></div>
        
        {/* Section Markers */}
        <div className="w-full flex items-center justify-between relative z-10">
          {sections.map((section, index) => {
            const status = getSectionStatus(section);
            return (
              <div 
                key={section} 
                className={`flex flex-col items-center`}
              >
                {status === 'completed' ? (
                  <CheckCircle 
                    className="h-8 w-8 text-brand-500 bg-white rounded-full" 
                    fill="#E5DEFF"
                  />
                ) : status === 'active' ? (
                  <Circle 
                    className="h-8 w-8 text-brand-500 bg-white border-2 border-brand-500 rounded-full" 
                    fill="#FFFFFF" 
                  />
                ) : (
                  <Circle 
                    className="h-8 w-8 text-gray-300 bg-white border-2 border-gray-300 rounded-full" 
                    fill="#FFFFFF"
                  />
                )}
                <span 
                  className={`text-xs font-medium mt-2 ${
                    status === 'active' 
                      ? 'text-brand-500' 
                      : status === 'completed' 
                      ? 'text-gray-700' 
                      : 'text-gray-500'
                  }`}
                >
                  {index + 1}
                </span>
                
                {/* Added section title below the step number */}
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
