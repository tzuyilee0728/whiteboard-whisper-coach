
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { transcriptionService } from '@/services/transcription';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SpeechToTextTest = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup function for when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartTest = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup data handler
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Setup stop handler
      mediaRecorder.onstop = async () => {
        try {
          setIsProcessing(true);
          
          // Combine audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const base64Audio = await blobToBase64(audioBlob);
          
          // Send to Supabase Edge Function
          const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
            body: JSON.stringify({
              audio: base64Audio,
              section: 'test-section'
            })
          });

          if (error) {
            console.error('Edge function error:', error);
            toast.error('Transcription error: ' + error.message);
            return;
          }
          
          if (data?.transcription) {
            setTranscription(prev => prev ? `${prev}\n${data.transcription}` : data.transcription);
            toast.success('Transcription received!');
          }
          
          if (data?.feedback) {
            toast.info('AI Feedback: ' + data.feedback);
          }
        } catch (err) {
          console.error('Error processing audio:', err);
          toast.error('Error processing audio: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
          setIsProcessing(false);
          setIsListening(false);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsListening(true);
      toast.info('Speech recognition started. Speak now!');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Error starting speech recognition: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleStopTest = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast.info('Processing your speech...');
    }
  };

  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Speech-to-Text Test</h2>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button 
            onClick={handleStartTest} 
            disabled={isListening || isProcessing}
            variant="default"
          >
            {isProcessing ? 'Processing...' : 'Start Recording'}
          </Button>
          <Button 
            onClick={handleStopTest} 
            disabled={!isListening || isProcessing}
            variant="destructive"
          >
            Stop Recording
          </Button>
        </div>
        
        {transcription && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="font-medium">Transcription:</h3>
            <p className="text-sm whitespace-pre-wrap">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechToTextTest;
