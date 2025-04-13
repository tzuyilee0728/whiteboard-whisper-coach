
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';
import { Mic, AlertTriangle } from 'lucide-react';

const TranscriptionView = () => {
  const { isRecording, currentSession } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  // Reset transcription when session changes
  useEffect(() => {
    if (currentSession) {
      setTranscription('');
    }
  }, [currentSession]);

  // Simulate real-time transcription when recording
  useEffect(() => {
    if (isRecording) {
      setIsTranscribing(true);
      
      // In a real implementation, this would be connected to a speech-to-text API
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
      }, 15000); // Add transcription every 15 seconds
      
      return () => clearInterval(transcriptionInterval);
    } else {
      setIsTranscribing(false);
    }
  }, [isRecording]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Mic className="h-5 w-5 mr-2" />
          Live Transcription
          {isTranscribing && (
            <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto">
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
      </CardContent>
    </Card>
  );
};

export default TranscriptionView;
