
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TranscriptionView from './TranscriptionView';

const AIInteraction = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-grow overflow-auto pb-0 flex flex-col">
        <TranscriptionView />
      </CardContent>
    </Card>
  );
};

export default AIInteraction;
