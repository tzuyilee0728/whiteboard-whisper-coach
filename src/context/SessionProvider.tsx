
import React, { ReactNode } from 'react';
import { SessionContext } from './SessionContext';
import { useSessionState } from '@/hooks/useSessionState';
import { useSessionManager } from '@/hooks/useSessionManager';

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const state = useSessionState();
  const managers = useSessionManager(state);
  
  const contextValue = {
    ...state,
    ...managers,
    startRecording: () => {}, // Add placeholder functions to satisfy TypeScript
    stopRecording: () => {},
    updateRecordingTime: (time: number) => {},
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
