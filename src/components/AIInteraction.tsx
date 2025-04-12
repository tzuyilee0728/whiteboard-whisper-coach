
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getRandomAIQuestion } from '@/services/mockData';
import { useSession } from '@/context/SessionContext';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

const AIInteraction = () => {
  const { currentChallenge, currentSection, isRecording } = useSession();
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Generate random AI questions based on the current challenge category
  useEffect(() => {
    if (currentChallenge) {
      // Start with one question
      setAiQuestions([getRandomAIQuestion(currentChallenge.category)]);
    }
  }, [currentChallenge]);
  
  // Occasionally generate a new AI question to simulate stakeholder interaction
  useEffect(() => {
    if (isRecording && currentChallenge) {
      const questionInterval = setInterval(() => {
        // 20% chance of asking a follow-up question
        if (Math.random() < 0.2) {
          const newQuestion = getRandomAIQuestion(currentChallenge.category);
          setAiQuestions(prev => [...prev, newQuestion]);
          
          // Notify user of new stakeholder question
          toast.info("New stakeholder question", {
            description: newQuestion,
            duration: 8000,
          });
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(questionInterval);
    }
  }, [isRecording, currentChallenge]);
  
  // Add new question when user responds
  const handleSubmitResponse = () => {
    if (currentResponse.trim() === '') return;
    
    // Add user response
    setUserResponses([...userResponses, currentResponse]);
    setCurrentResponse('');
    
    // Simulate AI thinking
    setIsThinking(true);
    
    // Add new AI question if we have a current challenge
    if (currentChallenge) {
      setTimeout(() => {
        setAiQuestions([...aiQuestions, getRandomAIQuestion(currentChallenge.category)]);
        setIsThinking(false);
      }, 1500);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <MessageCircle className="h-5 w-5 mr-2" />
          Stakeholder Questions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto pb-0">
        <div className="space-y-4">
          {aiQuestions.map((question, index) => (
            <React.Fragment key={index}>
              <div className="bg-brand-50 p-3 rounded-lg max-w-[85%]">
                <p className="text-sm"><span className="font-medium text-brand-700">Stakeholder: </span>{question}</p>
              </div>
              
              {userResponses[index] && (
                <div className="bg-gray-100 p-3 rounded-lg max-w-[85%] ml-auto">
                  <p className="text-sm"><span className="font-medium">You: </span>{userResponses[index]}</p>
                </div>
              )}
            </React.Fragment>
          ))}
          
          {isThinking && (
            <div className="bg-brand-50 p-3 rounded-lg max-w-[85%]">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce delay-75"></div>
                <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3">
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
      </CardFooter>
    </Card>
  );
};

export default AIInteraction;
