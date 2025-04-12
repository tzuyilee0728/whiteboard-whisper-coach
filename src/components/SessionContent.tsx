
import React from 'react';
import AIInteraction from '@/components/AIInteraction';
import NotePad from '@/components/NotePad';
import TranscriptionView from '@/components/TranscriptionView';

const SessionContent: React.FC = () => {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="h-[400px] md:h-auto">
        <AIInteraction />
      </div>
      
      <div className="h-[400px] md:h-auto">
        <NotePad />
      </div>
      
      <div className="h-[400px] md:h-auto lg:col-span-2">
        <TranscriptionView />
      </div>
    </div>
  );
};

export default SessionContent;
