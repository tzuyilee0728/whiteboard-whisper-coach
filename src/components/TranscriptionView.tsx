import React, { useState, useEffect } from 'react';
import { Mic, AlertTriangle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';

const TranscriptionView = () => {
  const { isRecording, currentSession } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  useEffect(() => {
    if (currentSession) {
      setTranscription('');
    }
  }, [currentSession]);

  useEffect(() => {
    if (isRecording) {
      setIsTranscribing(true);
      
      const transcriptionInterval = setInterval(() => {
        setTranscription(prev => {
          const placeholderTexts = [
            "I understand the problem involves users struggling with...",
            "Based on the requirements, I think we should focus on...",
            "The key pain points appear to be...",
            "For this solution, I would prioritize...",
            "If we consider the user journey, we would need to...",
            "Let me sketch out a potential solution that addresses...",
          ];
          
          const newText = placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)];
          return prev ? `${prev}\n\n${newText}` : newText;
        });
      }, 15000);
      
      return () => clearInterval(transcriptionInterval);
    } else {
      setIsTranscribing(false);
    }
  }, [isRecording]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center text-lg mb-4">
        <Mic className="h-5 w-5 mr-2" />
        Live Transcription
        {isTranscribing && (
          <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        )}
      </div>
      
      <div className="flex-grow overflow-auto">
        {isRecording || transcription ? (
          <div className="space-y-2">
            {transcription.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-sm mb-2">{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <AlertTriangle className="h-10 w-10 mb-2 text-amber-500" />
            <p>Start recording to see live transcription</p>
            <p className="text-xs mt-2">Transcription will appear here when you begin speaking</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionView;
