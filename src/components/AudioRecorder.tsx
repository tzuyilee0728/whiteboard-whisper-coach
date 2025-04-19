
import React, { useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Clock } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { toast } from 'sonner';

const AudioRecorder = () => {
  const { 
    isRecording, 
    recordingTime, 
    currentSession,
    isPaused,
    handlePauseResumeSession
  } = useSession();
  
  const {
    startRecording,
    stopRecording,
    error
  } = useAudioRecorder();
  
  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Combined handler to pause/resume both session and recording
  const handleRecordingToggle = () => {
    console.log('Toggle recording - current state:', isRecording);
    if (isRecording) {
      stopRecording();
      // If session isn't already paused, pause it
      if (!isPaused) {
        handlePauseResumeSession();
      }
    } else {
      startRecording();
      // If session is paused, resume it
      if (isPaused) {
        handlePauseResumeSession();
      }
    }
  };
  
  // Auto-start recording when session starts
  useEffect(() => {
    console.log('AudioRecorder effect - currentSession:', !!currentSession, 'isRecording:', isRecording, 'isPaused:', isPaused);
    if (currentSession && !isRecording && !isPaused) {
      console.log('Auto-starting recording');
      // Small delay to ensure everything is initialized
      setTimeout(() => {
        startRecording();
      }, 1000);
    }
  }, [currentSession, isRecording, isPaused]);
  
  // Show error if microphone access is denied
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
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
                <span className="font-mono text-red-600 font-bold">{formatTime(recordingTime)}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {currentSession ? 
                  "Recording paused" : 
                  "Recording will start automatically when session begins"}
              </p>
            )}
          </div>
          
          <Button
            onClick={handleRecordingToggle}
            variant={isRecording ? "destructive" : "default"}
            className={`w-full ${!isRecording ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
            disabled={!currentSession}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Pause Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {currentSession ? "Resume Recording" : "Start Recording"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;
