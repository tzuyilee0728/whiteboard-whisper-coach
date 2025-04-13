
import React from 'react';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Clock } from 'lucide-react';

const AudioRecorder = () => {
  const { 
    isRecording, 
    recordingTime, 
    startRecording, 
    stopRecording, 
    currentSession 
  } = useSession();
  
  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Recording is now controlled by session state
  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base">
          <span>Audio Recording</span>
          {isRecording && (
            <span className="ml-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-mono">{formatTime(recordingTime)}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Record your response to practice speaking aloud</p>
            )}
          </div>
          
          <Button
            onClick={handleRecordToggle}
            variant={isRecording ? "destructive" : "default"}
            className={`w-full ${!isRecording ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
            disabled={!currentSession}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;
