
import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertTriangle } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';

const TranscriptionView = () => {
  const { isRecording, currentSession, currentSection, isPaused } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [feedback, setFeedback] = useState<string[]>([]);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'waiting' | 'transcribing'>('idle');
  const transcriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset transcription when session starts
    if (currentSession) {
      setTranscription('');
      setFeedback([]);
      
      // Reset transcription service
      transcriptionService.reset();
    }
  }, [currentSession]);

  useEffect(() => {
    console.log('TranscriptionView effect - isRecording:', isRecording, 'isPaused:', isPaused);
    
    if (currentSession) {
      // Always initialize to get current transcript
      const currentText = transcriptionService.getCurrentTranscript();
      if (currentText) {
        setTranscription(currentText);
      }
      
      // Subscribe to transcription updates
      transcriptionService.onTranscriptUpdate((newTranscript) => {
        console.log('Transcript update received:', newTranscript);
        setTranscription(newTranscript);
        
        if (newTranscript && newTranscript.trim() !== '') {
          setTranscriptionStatus('transcribing');
        }
      });

      if (isRecording && !isPaused) {
        // Set status to waiting when recording starts
        setTranscriptionStatus('waiting');
        
        // Subscribe to AI feedback updates if needed
        aiAnalysisService.onFeedback((newFeedback) => {
          setFeedback(prev => [...prev, newFeedback]);
        });

        // Start the AI analysis for the current section
        aiAnalysisService.startAnalysis(currentSection);
      } else {
        aiAnalysisService.stopAnalysis();
      }
    } else {
      // Reset status when no session
      setTranscriptionStatus('idle');
    }

    return () => {
      aiAnalysisService.stopAnalysis();
    };
  }, [currentSession, isRecording, isPaused, currentSection]);

  // Auto-scroll to bottom of transcription
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcription, feedback]);

  const getTranscriptionStatusText = () => {
    if (transcriptionStatus === 'waiting') {
      return "Waiting for speech...";
    } else if (transcriptionStatus === 'transcribing') {
      return transcription;
    } else {
      return "Transcription will appear here when you begin speaking";
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
      
      <ScrollArea className="flex-grow">
        <div className="space-y-4" ref={transcriptionRef}>
          {(isRecording || transcription || feedback.length > 0) ? (
            <div className="space-y-4">
              <div className="border-b pb-2 mb-2">
                <p className="text-sm font-medium">Transcription:</p>
                <p className="text-sm whitespace-pre-wrap">
                  {transcription || (transcriptionStatus === 'waiting' ? "Waiting for speech..." : "Speak to see transcription")}
                </p>
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
      </ScrollArea>
    </div>
  );
};

export default TranscriptionView;
