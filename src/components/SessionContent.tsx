
import React from 'react';
import AIInteraction from '@/components/AIInteraction';
import TranscriptionView from '@/components/TranscriptionView';

const SessionContent: React.FC = () => {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 gap-6 h-full">
      <div className="h-[400px] md:h-auto">
        <AIInteraction />
      </div>
      
      <div className="h-[400px] md:h-auto">
        <TranscriptionView />
      </div>
    </div>
  );
};

export default SessionContent;
