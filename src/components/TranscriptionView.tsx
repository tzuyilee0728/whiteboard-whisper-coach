
import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertTriangle, Info } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { toast } from 'sonner';

const TranscriptionView = () => {
  const { isRecording, currentSession, currentSection, isPaused } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [feedback, setFeedback] = useState<string[]>([]);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'waiting' | 'transcribing'>('idle');
  const [transcriptionMode, setTranscriptionMode] = useState<string>('');
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset transcription when session starts
    if (currentSession) {
      setTranscription('');
      setFeedback([]);
      
      // Reset transcription service
      transcriptionService.reset();
      
      // Set mode for UI display
      setTranscriptionMode(transcriptionService.getMode());
    }
  }, [currentSession]);

  useEffect(() => {
    console.log('TranscriptionView effect - isRecording:', isRecording, 'isPaused:', isPaused);
    
    if (currentSession) {
      // Set status to waiting when recording starts
      if (isRecording && !isPaused) {
        setTranscriptionStatus('waiting');
        
        // Notify the user about which mode we're using
        setTimeout(() => {
          const mode = transcriptionService.getMode();
          setTranscriptionMode(mode);
          
          toast.info(`Using ${mode === 'api' ? 'API' : 'browser'} speech recognition`);
          
          console.log('Speech recognition mode:', mode);
        }, 1000);
      }
      
      // Always initialize to get current transcript
      const currentText = transcriptionService.getCurrentTranscript();
      console.log('Current transcript:', currentText);
      if (currentText) {
        setTranscription(currentText);
        setTranscriptionStatus('transcribing');
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

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-lg">
          <Mic className="h-5 w-5 mr-2" />
          Live Transcription
          {isRecording && !isPaused && (
            <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
          {transcriptionMode && (
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {transcriptionMode === 'api' ? 'API Mode' : 'Browser Mode'}
            </span>
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
                  {transcription || (
                    transcriptionStatus === 'waiting' ? (
                      <span className="text-gray-500">
                        Waiting for speech... <span className="animate-pulse">●</span>
                      </span>
                    ) : (
                      <span className="text-gray-500">Speak to see transcription</span>
                    )
                  )}
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
          
          {isRecording && !isPaused && transcriptionStatus === 'waiting' && !transcription && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Waiting for speech</p>
                <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1">
                  <li>Speak clearly into your microphone</li>
                  <li>Make sure your browser has microphone permissions</li>
                  <li>Try speaking a bit louder if nothing happens</li>
                  <li>Check console logs for details on the transcription mode</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptionView;
