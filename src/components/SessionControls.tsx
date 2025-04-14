
import React from 'react';
import SectionGuidance from '@/components/SectionGuidance';
import AudioRecorder from '@/components/AudioRecorder';
import { WhiteboardSection } from '@/types';
import SessionProgressBar from './SessionProgressBar';
import { Button } from '@/components/ui/button';

interface SessionControlsProps {
  sections: WhiteboardSection[];
  currentSection: WhiteboardSection;
  handlePrevSection: () => void;
  handleNextSection: () => void;
  totalTime?: number;
  initialTime?: number;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  sections,
  currentSection,
  handlePrevSection,
  handleNextSection,
  totalTime,
  initialTime
}) => {
  // Calculate progress percentage
  const progressPercentage = initialTime && totalTime 
    ? Math.max(0, Math.min(100, 100 - ((totalTime / initialTime) * 100)))
    : 0;

  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3 flex items-center">
          Session Progress
        </h3>
        
        <SessionProgressBar sections={sections} />
        
        <div className="space-y-2">
          <SectionGuidance section={currentSection} />
          
          <div className="flex justify-between gap-2 mt-4">
            <Button 
              onClick={handlePrevSection} 
              variant="outline" 
              size="sm"
              className="w-1/2"
            >
              Previous
            </Button>
            <Button 
              onClick={handleNextSection} 
              variant="outline" 
              size="sm"
              className="w-1/2"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      
      <AudioRecorder />
    </div>
  );
};

export default SessionControls;
