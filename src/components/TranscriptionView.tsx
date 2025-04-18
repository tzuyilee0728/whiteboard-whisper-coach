
import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertTriangle, PauseCircle, Settings } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { transcriptionService } from '@/services/transcriptionService';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TranscriptionView = () => {
  const { isRecording, currentSession, currentSection, isPaused } = useSession();
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [language, setLanguage] = useState<string>('en-US');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(false);

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

  // Configure the transcription API
  const handleConfigureApi = () => {
    if (!apiKey || !apiUrl) {
      return;
    }

    transcriptionService.configureAPI({
      apiKey,
      apiUrl,
      language,
    });

    setIsApiConfigured(true);
    setIsDialogOpen(false);
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
        <div className="flex items-center">
          {!isRecording && isTranscribing && (
            <div className="text-xs text-gray-500 flex items-center mr-3">
              <PauseCircle className="h-3 w-3 mr-1" />
              Pause recording to stop transcription
            </div>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                {isApiConfigured ? 'API Configured' : 'Configure API'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Transcription API</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="api-key" className="text-right">API Key</Label>
                  <Input
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter your API key"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="api-url" className="text-right">API URL</Label>
                  <Input
                    id="api-url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="col-span-3"
                    placeholder="https://api.example.com/transcribe"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="language" className="text-right">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                      <SelectItem value="ja-JP">Japanese</SelectItem>
                      <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleConfigureApi}>Save Configuration</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
