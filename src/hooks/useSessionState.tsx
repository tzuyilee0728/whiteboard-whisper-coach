
import { useState } from 'react';
import { Challenge, Session, WhiteboardSection, AudioRecording, Category } from '@/types';
import { mockChallenges, mockSessions } from '@/services/mockData';

export const useSessionState = () => {
  const [challenges] = useState<Challenge[]>(mockChallenges);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentSection, setCurrentSection] = useState<WhiteboardSection>('problem_discovery');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [customSessionTime, setCustomSessionTime] = useState(45);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<Category | null>(null);
  const [sectionProgress, setSectionProgress] = useState<Record<WhiteboardSection, number>>({
    problem_discovery: 0,
    problem_definition: 0,
    ideation: 0,
    prioritization: 0,
    user_flow_wireframe: 0,
    final_wrap_up: 0
  });

  return {
    challenges,
    sessions,
    setSessions,
    currentChallenge,
    setCurrentChallenge,
    currentSession,
    setCurrentSession,
    currentSection,
    setCurrentSection,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    audioRecordings,
    setAudioRecordings,
    customSessionTime,
    setCustomSessionTime,
    isPaused,
    setIsPaused,
    selectedIndustry,
    setSelectedIndustry,
    sectionProgress,
    setSectionProgress,
  };
};
