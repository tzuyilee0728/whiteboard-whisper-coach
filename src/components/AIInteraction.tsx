
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import AIConversation from '@/components/AIConversation';
import AIResponseInput from '@/components/AIResponseInput';

const AIInteraction = () => {
  const { currentChallenge } = useSession();
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <MessageCircle className="h-5 w-5 mr-2" />
          Stakeholder Questions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto pb-0 flex flex-col">
        <AIConversation />
      </CardContent>
    </Card>
  );
};

export default AIInteraction;
