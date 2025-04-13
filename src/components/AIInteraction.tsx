
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AIInteraction = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-grow overflow-auto pb-0 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 text-center">
            Focus on your whiteboard challenge. Use the recording feature to capture your thoughts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInteraction;
