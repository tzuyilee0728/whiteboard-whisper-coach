
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getRandomAIQuestion } from '@/services/mockData';
import { useSession } from '@/context/SessionContext';
import { MessageCircle } from 'lucide-react';

const AIInteraction = () => {
  const { currentChallenge, currentSection } = useSession();
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  
  // Generate random AI questions based on the current challenge category
  useEffect(() => {
    if (currentChallenge) {
      // Start with one question
      setAiQuestions([getRandomAIQuestion(currentChallenge.category)]);
    }
  }, [currentChallenge]);
  
  // Add new question when user responds
  const handleSubmitResponse = () => {
    if (currentResponse.trim() === '') return;
    
    // Add user response
    setUserResponses([...userResponses, currentResponse]);
    setCurrentResponse('');
    
    // Add new AI question if we have a current challenge
    if (currentChallenge) {
      setTimeout(() => {
        setAiQuestions([...aiQuestions, getRandomAIQuestion(currentChallenge.category)]);
      }, 500);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          AI Interviewer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto">
        <div className="space-y-4">
          {aiQuestions.map((question, index) => (
            <React.Fragment key={index}>
              <div className="bg-brand-50 p-3 rounded-lg inline-block">
                <p className="text-sm">{question}</p>
              </div>
              
              {userResponses[index] && (
                <div className="bg-gray-100 p-3 rounded-lg inline-block ml-auto">
                  <p className="text-sm">{userResponses[index]}</p>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3">
        <div className="w-full space-y-2">
          <Textarea
            placeholder="Type your response..."
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            className="resize-none"
            rows={2}
          />
          <Button 
            onClick={handleSubmitResponse} 
            className="w-full bg-brand-600 hover:bg-brand-700"
          >
            Send Response
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIInteraction;
