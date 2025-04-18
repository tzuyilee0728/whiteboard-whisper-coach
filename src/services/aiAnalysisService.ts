
import { toast } from 'sonner';
import { WhiteboardSection } from '@/types';

// This is a mock service that simulates AI analysis
// In a real application, this would connect to an AI API like OpenAI
export class AIAnalysisService {
  private analysisTimer: number | null = null;
  private onFeedbackCallback: ((feedback: string) => void) | null = null;
  
  // Sample feedback templates based on the current section
  private feedbackTemplates: Record<WhiteboardSection, string[]> = {
    problem_discovery: [
      "Good probing questions about user pain points.",
      "Consider asking more about the target audience.",
      "Nice job identifying key stakeholders.",
      "Try exploring the problem from multiple perspectives."
    ],
    problem_definition: [
      "Clear statement of the core problem.",
      "Consider framing the problem more precisely.",
      "Good job scoping the problem appropriately.",
      "Try to be more specific about success criteria."
    ],
    ideation: [
      "Creative solutions being proposed.",
      "Consider exploring more diverse options.",
      "Good balance of innovative and practical ideas.",
      "Try using more structured ideation techniques."
    ],
    prioritization: [
      "Clear criteria for evaluating options.",
      "Consider using a more systematic prioritization method.",
      "Good job considering feasibility and impact.",
      "Try to be more explicit about tradeoffs."
    ],
    user_flow_wireframe: [
      "Clear representation of the user journey.",
      "Consider adding more detail to key interactions.",
      "Good job focusing on critical user paths.",
      "Try to validate your assumptions about user behavior."
    ],
    final_wrap_up: [
      "Effective summary of the proposed solution.",
      "Consider adding more about implementation next steps.",
      "Good job tying solution back to original problem.",
      "Try to be more specific about expected outcomes."
    ]
  };
  
  // Start providing periodic feedback based on the transcript
  public startAnalysis(currentSection: WhiteboardSection) {
    if (this.analysisTimer) {
      window.clearInterval(this.analysisTimer);
    }
    
    this.analysisTimer = window.setInterval(() => {
      const templates = this.feedbackTemplates[currentSection];
      const randomFeedback = templates[Math.floor(Math.random() * templates.length)];
      
      if (this.onFeedbackCallback) {
        this.onFeedbackCallback(randomFeedback);
      }
    }, 20000); // Provide feedback every 20 seconds
  }
  
  // Stop the periodic feedback
  public stopAnalysis() {
    if (this.analysisTimer) {
      window.clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }
  }
  
  // Register a callback for when new feedback is available
  public onFeedback(callback: (feedback: string) => void) {
    this.onFeedbackCallback = callback;
  }
  
  // Analyze a specific transcript (could be used for immediate feedback)
  public analyzeTranscript(transcript: string, section: WhiteboardSection): string {
    // In a real implementation, this would send the transcript to an AI API
    // For now, we'll return a random feedback from our templates
    const templates = this.feedbackTemplates[section];
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

// Create a singleton instance to be used throughout the app
export const aiAnalysisService = new AIAnalysisService();
