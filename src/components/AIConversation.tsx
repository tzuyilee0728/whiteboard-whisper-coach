
import React, { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { getRandomAIQuestion } from '@/services/mockData';
import { toast } from 'sonner';
import AIMessage from '@/components/AIMessage';
import AIResponseInput from '@/components/AIResponseInput';

const AIConversation = () => {
  const { currentChallenge, isRecording } = useSession();
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
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
  const handleSubmitResponse = (currentResponse: string) => {
    if (currentResponse.trim() === '') return;
    
    // Add user response
    setUserResponses([...userResponses, currentResponse]);
    
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
    <>
      <div className="space-y-4 flex-grow overflow-auto">
        {aiQuestions.map((question, index) => (
          <React.Fragment key={index}>
            <AIMessage 
              sender="stakeholder" 
              message={question}
            />
            
            {userResponses[index] && (
              <AIMessage 
                sender="user" 
                message={userResponses[index]} 
              />
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
      <AIResponseInput onSubmit={handleSubmitResponse} isThinking={isThinking} />
    </>
  );
};

export default AIConversation;
