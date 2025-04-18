
import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertTriangle, Loader2 } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { transcriptionService } from '@/services/transcriptionService';
import { supabase } from '@/integrations/supabase/client';

const TranscriptionView = () => {
  const { isRecording, currentSession, currentSection, isPaused } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingRef = useRef<boolean>(false);

  // Subscribe to transcription updates from the transcription service
  useEffect(() => {
    const handleTranscriptUpdate = (text: string) => {
      setTranscription(text);
    };

    transcriptionService.onTranscriptUpdate(handleTranscriptUpdate);

    return () => {
      transcriptionService.onTranscriptUpdate(null);
    };
  }, []);

  // Process audio for transcription using Supabase edge function
  const processAudioChunk = async (audioBlob: Blob) => {
    if (!audioBlob || audioBlob.size === 0 || processingRef.current || !currentSession) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: JSON.stringify({
          audio: base64Audio,
          section: currentSection
        })
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (data.transcription && data.transcription.trim() !== '') {
        setTranscription(prev => 
          (prev + ' ' + data.transcription).trim()
        );
      }

      if (data.feedback && data.feedback.trim() !== '') {
        setFeedback(prev => [...prev, data.feedback]);
      }
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  // Handle audio chunks from recording
  useEffect(() => {
    const handleAudioData = async (event: Event) => {
      const customEvent = event as CustomEvent<Blob>;
      if (customEvent.detail && customEvent.detail.size > 0) {
        audioChunksRef.current.push(customEvent.detail);
        await processAudioChunk(customEvent.detail);
      }
    };

    // Listen for audio data events
    window.addEventListener('audioData', handleAudioData);

    return () => {
      window.removeEventListener('audioData', handleAudioData);
    };
  }, [currentSection]);

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
          {isProcessing && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
      
      <div className="flex-grow overflow-auto" ref={transcriptionRef}>
        {(isRecording || transcription || feedback.length > 0) && (
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
        )}
        
        {!isRecording && !transcription && !feedback.length && (
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
