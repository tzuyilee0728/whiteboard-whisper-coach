
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface AIResponseInputProps {
  onSubmit: (response: string) => void;
  isThinking: boolean;
}

const AIResponseInput: React.FC<AIResponseInputProps> = ({ onSubmit, isThinking }) => {
  const [currentResponse, setCurrentResponse] = useState('');
  
  const handleSubmitResponse = () => {
    if (currentResponse.trim() === '') return;
    onSubmit(currentResponse);
    setCurrentResponse('');
  };
  
  return (
    <div className="border-t pt-3 mt-auto">
      <div className="w-full space-y-2">
        <Textarea
          placeholder="Type your response to stakeholder..."
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          className="resize-none"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmitResponse();
            }
          }}
        />
        <Button 
          onClick={handleSubmitResponse} 
          className="w-full bg-brand-600 hover:bg-brand-700 flex items-center justify-center"
          disabled={isThinking || currentResponse.trim() === ''}
        >
          <Send className="h-4 w-4 mr-2" />
          Send Response
        </Button>
      </div>
    </div>
  );
};

export default AIResponseInput;
