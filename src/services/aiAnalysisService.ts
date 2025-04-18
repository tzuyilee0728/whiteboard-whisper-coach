
import { toast } from 'sonner';
import { WhiteboardSection } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export class AIAnalysisService {
  private analysisTimer: number | null = null;
  private onFeedbackCallback: ((feedback: string) => void) | null = null;
  
  public async analyzeSpeech(text: string, currentSection: WhiteboardSection) {
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-and-analyze', {
        body: { text, section: currentSection }
      });

      if (error) throw error;

      if (data?.feedback && this.onFeedbackCallback) {
        this.onFeedbackCallback(data.feedback);
      }
    } catch (error) {
      console.error('Error analyzing speech:', error);
    }
  }
  
  public startAnalysis(currentSection: WhiteboardSection) {
    // Clear any existing timer
    if (this.analysisTimer) {
      window.clearInterval(this.analysisTimer);
    }
  }
  
  public stopAnalysis() {
    if (this.analysisTimer) {
      window.clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }
  }
  
  public onFeedback(callback: (feedback: string) => void) {
    this.onFeedbackCallback = callback;
  }
}

export const aiAnalysisService = new AIAnalysisService();
