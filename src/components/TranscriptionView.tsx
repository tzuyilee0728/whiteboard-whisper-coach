
import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertTriangle, PauseCircle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';

const TranscriptionView = () => {
  const { isRecording, currentSession, currentSection } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const transcriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset transcription when session changes
    if (currentSession) {
      setTranscription('');
      setFeedback([]);
    }
  }, [currentSession]);

  useEffect(() => {
    // Start or stop transcription based on recording state
    if (isRecording) {
      setIsTranscribing(true);
      
      // Set up transcription service
      transcriptionService.reset();
      transcriptionService.onTranscriptUpdate((text) => {
        setTranscription(text);
      });
      transcriptionService.start();
      
      // Set up AI analysis
      aiAnalysisService.onFeedback((newFeedback) => {
        setFeedback(prev => [...prev, newFeedback]);
      });
      aiAnalysisService.startAnalysis(currentSection);
      
    } else {
      setIsTranscribing(false);
      transcriptionService.stop();
      aiAnalysisService.stopAnalysis();
    }
    
    // Cleanup function
    return () => {
      transcriptionService.stop();
      aiAnalysisService.stopAnalysis();
    };
  }, [isRecording, currentSection]);
  
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
          {isTranscribing && (
            <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </div>
        {isTranscribing && (
          <div className="text-xs text-gray-500 flex items-center">
            <PauseCircle className="h-3 w-3 mr-1" />
            Pause recording to stop transcription
          </div>
        )}
      </div>
      
      <div className="flex-grow overflow-auto" ref={transcriptionRef}>
        {isRecording || transcription ? (
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
