
import React from 'react';
import AIInteraction from '@/components/AIInteraction';

const SessionContent: React.FC = () => {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 gap-6 h-full">
      <div className="h-full">
        <AIInteraction />
      </div>
    </div>
  );
};

export default SessionContent;
