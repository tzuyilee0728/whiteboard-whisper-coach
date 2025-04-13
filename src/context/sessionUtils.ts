
import { Session, Feedback, WhiteboardSection } from '@/types';
import { generateMockFeedback } from '@/services/mockData';

export const generateSessionFeedback = (session: Session): Feedback => {
  if (!session) {
    // Create a default feedback object that matches the Feedback type
    return {
      id: "default",
      sessionId: "default",
      strengths: ["No session data available"],
      improvements: ["No session data available"],
      sectionFeedback: {
        problem_discovery: "No data",
        problem_definition: "No data",
        ideation: "No data",
        prioritization: "No data",
        user_flow_wireframe: "No data",
        final_wrap_up: "No data"
      },
      overallRating: 0
    };
  }
  
  // Generate feedback for each section
  const sectionFeedback: Record<WhiteboardSection, string> = {
    problem_discovery: generateMockFeedback('problem_discovery'),
    problem_definition: generateMockFeedback('problem_definition'),
    ideation: generateMockFeedback('ideation'),
    prioritization: generateMockFeedback('prioritization'),
    user_flow_wireframe: generateMockFeedback('user_flow_wireframe'),
    final_wrap_up: generateMockFeedback('final_wrap_up')
  };
  
  // Generate random strengths and improvements
  const allFeedback = Object.values(sectionFeedback);
  const strengths = allFeedback
    .filter(feedback => !feedback.includes("Consider") && !feedback.includes("Try"))
    .slice(0, 2);
  
  const improvements = allFeedback
    .filter(feedback => feedback.includes("Consider") || feedback.includes("Try"))
    .slice(0, 2);
  
  // If we don't have enough strengths or improvements, add defaults
  if (strengths.length === 0) {
    strengths.push("Good effort overall");
  }
  if (improvements.length === 0) {
    improvements.push("Consider practicing more regularly");
  }
  
  // Random rating between 3 and 5
  const overallRating = Number((3 + Math.random() * 2).toFixed(1));
  
  // Return a properly typed Feedback object
  return {
    id: `f${session.id.substring(1)}`,
    sessionId: session.id,
    strengths,
    improvements,
    sectionFeedback,
    overallRating
  };
};
