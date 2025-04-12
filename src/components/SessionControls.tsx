
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionGuidance from '@/components/SectionGuidance';
import AudioRecorder from '@/components/AudioRecorder';
import { WhiteboardSection } from '@/types';

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
        
        <div className="space-y-2">
          {sections.map((section) => (
            <SectionGuidance key={section} section={section} />
          ))}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button 
            onClick={handlePrevSection} 
            variant="outline"
            size="sm"
            disabled={sections.indexOf(currentSection) === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNextSection} 
            variant="outline"
            size="sm"
            disabled={sections.indexOf(currentSection) === sections.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <AudioRecorder />
    </div>
  );
};

export default SessionControls;
