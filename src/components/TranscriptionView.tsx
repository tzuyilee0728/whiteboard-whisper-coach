
import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertTriangle, Loader2, Send } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { transcriptionService } from '@/services/transcription';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const TranscriptionView = () => {
  const { isRecording, currentSession, currentSection, isPaused } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [aiResponses, setAIResponses] = useState<string[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if session just started and initialize
    if (currentSession && isRecording && !isPaused) {
      setIsInitializing(true);
      // Initialize is handled in useSessionManager, just set a timeout to remove the initializing state
      setTimeout(() => setIsInitializing(false), 2000);
    }
  }, [currentSession, isRecording, isPaused]);

  useEffect(() => {
    // Subscribe to transcription updates
    const transcriptionHandler = (text: string) => {
      console.log("Transcription update received:", text);
      setTranscription(prev => prev + ' ' + text);
    };

    // Subscribe to feedback updates
    const feedbackHandler = (newFeedback: string) => {
      console.log("Feedback received in component:", newFeedback);
      setFeedback(prev => [...prev, newFeedback]);
    };

    // Subscribe to AI response updates
    const responseHandler = (response: string) => {
      console.log("AI response received:", response);
      setAIResponses(prev => [...prev, response]);
    };

    transcriptionService.onTranscriptUpdate(transcriptionHandler);
    transcriptionService.onFeedback(feedbackHandler);
    transcriptionService.onAIResponse(responseHandler);

    return () => {
      transcriptionService.unsubscribeTranscriptUpdate(transcriptionHandler);
      transcriptionService.unsubscribeFeedback(feedbackHandler);
      transcriptionService.unsubscribeAIResponse(responseHandler);
    };
  }, []);

  // Auto-scroll to bottom of transcription
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcription, feedback, aiResponses]);

  // Handle asking a question to AI
  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    try {
      setIsProcessing(true);
      
      // Add user's question to the transcription
      const questionText = `[You asked: ${userQuestion}]`;
      setTranscription(prev => prev + ' ' + questionText);
      
      // Get AI response through transcription service
      await transcriptionService.askQuestion(userQuestion, currentSection);
      
      // Clear the question input
      setUserQuestion('');
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-lg">
          <Mic className="h-5 w-5 mr-2" />
          Live Transcription
          {isRecording && !isPaused && (
            <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </div>
      </div>
      
      <div className="flex-grow overflow-auto" ref={transcriptionRef}>
        {isInitializing ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Loader2 className="h-10 w-10 mb-4 text-brand-600 animate-spin" />
            <p className="text-gray-600">Initializing transcription...</p>
            <p className="text-sm text-gray-500 mt-1">Please speak clearly when recording starts</p>
          </div>
        ) : (isRecording || transcription || feedback.length > 0 || aiResponses.length > 0) ? (
          <div className="space-y-4">
            <div className="border-b pb-2 mb-2">
              <p className="text-sm font-medium">Transcription:</p>
              <p className="text-sm whitespace-pre-wrap">{transcription}</p>
            </div>
            
            {aiResponses.length > 0 && (
              <div className="border-b pb-2 mb-2">
                <p className="text-sm font-medium">AI Responses:</p>
                <div className="space-y-2 mt-2">
                  {aiResponses.map((item, idx) => (
                    <div key={idx} className="bg-green-50 p-2 rounded text-sm">
                      <p className="font-medium text-green-700 mb-1">Interviewer:</p>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium">AI Feedback:</p>
              {feedback.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {feedback.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 p-2 rounded text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No AI feedback available yet</p>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <AlertTriangle className="h-10 w-10 mb-2 text-amber-500" />
            <p>Start recording to see live transcription</p>
            <p className="text-xs mt-2">Transcription will appear here when you begin speaking</p>
          </div>
        )}
      </div>
      
      {/* Question input area */}
      {currentSession && (
        <div className="border-t pt-3 mt-4">
          <div className="flex gap-2">
            <Textarea 
              placeholder="Ask the AI interviewer a question..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              className="resize-none"
              disabled={isProcessing || !isRecording || isPaused}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
            />
            <Button 
              onClick={handleAskQuestion}
              disabled={isProcessing || !userQuestion.trim() || !isRecording || isPaused}
              className="flex-shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionView;
