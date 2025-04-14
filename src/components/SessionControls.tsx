
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

function Button({ children, onClick, variant, size, className }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1 rounded ${
        variant === 'outline' 
          ? 'border border-gray-300 hover:bg-gray-50' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${size === 'sm' ? 'text-sm' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
