
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { transcriptionService } from '@/services/transcription';
import { toast } from 'sonner';

const SpeechToTextTest = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');

  const handleStartTest = () => {
    try {
      // Configure Web Speech API for testing
      transcriptionService.configureAPI({
        apiKey: 'test-key',
        apiUrl: 'https://api.test.com',
        language: 'en-US'
      });

      // Subscribe to transcription updates
      const transcriptionHandler = (text: string) => {
        setTranscription(text);
        toast.success('Transcription received: ' + text);
      };

      transcriptionService.onTranscriptUpdate(transcriptionHandler);

      // Start recognition
      const started = transcriptionService.start();

      if (started) {
        setIsListening(true);
        toast.info('Speech recognition started. Speak now!');
      } else {
        toast.error('Failed to start speech recognition');
      }
    } catch (error) {
      toast.error('Error starting speech recognition: ' + error.message);
    }
  };

  const handleStopTest = () => {
    transcriptionService.stop();
    setIsListening(false);
    toast.info('Speech recognition stopped');
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Speech-to-Text Test</h2>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button 
            onClick={handleStartTest} 
            disabled={isListening}
            variant="default"
          >
            Start Listening
          </Button>
          <Button 
            onClick={handleStopTest} 
            disabled={!isListening}
            variant="destructive"
          >
            Stop Listening
          </Button>
        </div>
        
        {transcription && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="font-medium">Transcription:</h3>
            <p className="text-sm">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechToTextTest;
