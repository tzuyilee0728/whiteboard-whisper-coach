
import React from 'react';
import AIInteraction from '@/components/AIInteraction';
import SpeechToTextTest from '@/components/SpeechToTextTest';

const SessionContent: React.FC = () => {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 gap-6 h-full">
      <div className="h-full">
        <AIInteraction />
      </div>
      {/* Add Speech-to-Text Test Component */}
      <div className="mt-4">
        <SpeechToTextTest />
      </div>
    </div>
  );
};

export default SessionContent;
