
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const AIInteraction = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <MessageCircle className="h-5 w-5 mr-2" />
          Whiteboard Session
        </CardTitle>
      </CardHeader>
      
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
