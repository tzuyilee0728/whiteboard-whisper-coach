export type Category = 'e-commerce' | 'healthcare' | 'finance' | 'social' | 'productivity';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: Category;
}

export interface Session {
  id: string;
  date: string;
  challenge: Challenge;
  duration: number;
  status: 'completed' | 'in-progress' | 'abandoned';
  feedback?: Feedback;
}

export interface Feedback {
  id: string;
  sessionId: string;
  strengths: string[];
  improvements: string[];
  sectionFeedback: Record<WhiteboardSection, string>;
}

export type WhiteboardSection = 
  | 'problem_discovery' 
  | 'problem_definition' 
  | 'ideation'
  | 'prioritization' 
  | 'user_flow_wireframe' 
  | 'final_wrap_up';

export interface SectionTiming {
  section: WhiteboardSection;
  title: string;
  duration: number; // in minutes
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  sessions: Session[];
}

export interface AudioRecording {
  sessionId: string;
  audioBlob: Blob;
  transcript?: string;
}
