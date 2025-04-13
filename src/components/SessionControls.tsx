
import React from 'react';
import SectionGuidance from '@/components/SectionGuidance';
import AudioRecorder from '@/components/AudioRecorder';
import { WhiteboardSection } from '@/types';
import SessionProgressBar from './SessionProgressBar';

interface SessionControlsProps {
  sections: WhiteboardSection[];
  currentSection: WhiteboardSection;
  handlePrevSection: () => void;
  handleNextSection: () => void;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  sections,
  currentSection,
  handlePrevSection,
  handleNextSection
}) => {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3 flex items-center">
          Session Progress
        </h3>
        
        <SessionProgressBar sections={sections} />
        
        <div className="space-y-2">
          <SectionGuidance 
            section={currentSection}
            handlePrevSection={handlePrevSection}
            handleNextSection={handleNextSection}
          />
        </div>
      </div>
      
      <AudioRecorder />
    </div>
  );
};

export default SessionControls;
