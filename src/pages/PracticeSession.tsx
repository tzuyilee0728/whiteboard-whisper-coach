
import React from 'react';
import NavBar from '@/components/NavBar';
import SessionStartScreen from '@/components/SessionStartScreen';
import SessionHeader from '@/components/SessionHeader';
import SessionControls from '@/components/SessionControls';
import SessionContent from '@/components/SessionContent';
import PracticeSessionFooter from '@/components/PracticeSessionFooter';
import { useSessionControls } from '@/hooks/useSessionControls';
import SessionShareButton from '@/components/SessionShareButton';

const PracticeSession = () => {
  const { 
    currentChallenge,
    currentSession,
    currentSection,
    sections,
    totalTime,
    initialTotalTime,
    isPaused,
    isRecording,
    handleStartSession,
    handleEndSession,
    handleNextSection,
    handlePrevSection,
    handlePauseResumeSession
  } = useSessionControls();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Session</h1>
            <p className="text-gray-600">
              Complete a whiteboard challenge with structured guidance
            </p>
          </div>
          
          <SessionShareButton sessionActive={!!currentSession} />
        </div>
        
        {!currentSession ? (
          <SessionStartScreen handleStartSession={handleStartSession} />
        ) : (
          <div className="space-y-6">
            <SessionHeader
              title={currentChallenge?.title || ''}
              description={currentChallenge?.description || ''}
              totalTime={totalTime}
              isPaused={isPaused}
              isRecording={isRecording}
              handlePauseResumeSession={handlePauseResumeSession}
              handleEndSession={handleEndSession}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <SessionControls
                sections={sections}
                currentSection={currentSection}
                handlePrevSection={handlePrevSection}
                handleNextSection={handleNextSection}
                totalTime={totalTime}
                initialTime={initialTotalTime}
              />
              
              <SessionContent />
            </div>
          </div>
        )}
      </div>
      
      <PracticeSessionFooter />
    </div>
  );
};

export default PracticeSession;
