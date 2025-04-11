
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { WhiteboardSection } from '@/types';
import { useSession } from '@/context/SessionContext';
import { sectionTimings } from '@/services/mockData';

interface SectionTimerProps {
  section: WhiteboardSection;
}

const SectionTimer: React.FC<SectionTimerProps> = ({ section }) => {
  const { currentSection, updateSectionProgress } = useSession();
  const [timeRemaining, setTimeRemaining] = useState(sectionTimings[section].duration * 60);
  const [isActive, setIsActive] = useState(false);
  const totalTime = sectionTimings[section].duration * 60;
  
  // Start timer when this becomes the current section
  useEffect(() => {
    if (currentSection === section) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [currentSection, section]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          const newTime = time - 1;
          // Update progress percentage
          const progress = 100 - (newTime / totalTime * 100);
          updateSectionProgress(section, progress);
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, section, totalTime, updateSectionProgress]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercent = 100 - (timeRemaining / totalTime * 100);
  
  // Determine the progress color based on time remaining
  const getProgressColor = (): string => {
    if (progressPercent < 50) return 'bg-green-500';
    if (progressPercent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">
          {formatTime(timeRemaining)}
        </span>
        <span className="text-xs text-gray-500">
          {sectionTimings[section].duration} min
        </span>
      </div>
      <Progress
        value={progressPercent}
        className={`h-2 ${isActive ? getProgressColor() : 'bg-gray-200'}`}
      />
    </div>
  );
};

export default SectionTimer;
