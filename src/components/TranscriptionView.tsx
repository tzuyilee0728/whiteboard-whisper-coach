
import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertTriangle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { transcriptionService } from '@/services/transcriptionService';

const TranscriptionView = () => {
  const { isRecording, currentSession, currentSection, isPaused } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [feedback, setFeedback] = useState<string[]>([]);
  const transcriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to transcription updates
    const transcriptionHandler = (text: string) => {
      console.log("Transcription update received:", text);
      setTranscription(prev => prev + ' ' + text);
    };

    // Subscribe to feedback updates
    const feedbackHandler = (newFeedback: string) => {
      console.log("Feedback received:", newFeedback);
      setFeedback(prev => [...prev, newFeedback]);
    };

    transcriptionService.onTranscriptUpdate(transcriptionHandler);
    transcriptionService.onFeedback(feedbackHandler);

    return () => {
      transcriptionService.unsubscribeTranscriptUpdate(transcriptionHandler);
      transcriptionService.unsubscribeFeedback(feedbackHandler);
    };
  }, []);

  // Auto-scroll to bottom of transcription
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcription, feedback]);

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
        {(isRecording || transcription || feedback.length > 0) ? (
          <div className="space-y-4">
            <div className="border-b pb-2 mb-2">
              <p className="text-sm font-medium">Transcription:</p>
              <p className="text-sm whitespace-pre-wrap">{transcription}</p>
            </div>
            
            {feedback.length > 0 && (
              <div>
                <p className="text-sm font-medium">AI Feedback:</p>
                <div className="space-y-2 mt-2">
                  {feedback.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 p-2 rounded text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
