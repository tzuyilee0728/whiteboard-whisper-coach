
import { WhiteboardSection } from "@/types";

export const mockFeedbacks: Record<WhiteboardSection, string[]> = {
  problem_discovery: [
    "You asked insightful questions about user demographics and pain points.",
    "Consider asking more about the business constraints and goals.",
    "Good job exploring user motivations and behaviors.",
    "Try to dig deeper into quantitative data that might be available."
  ],
  problem_definition: [
    "Clear articulation of the core problem and its impacts.",
    "Consider framing the problem from multiple stakeholders' perspectives.",
    "Good identification of success metrics.",
    "Try to be more specific about which user segments are most affected."
  ],
  ideation: [
    "Wide range of creative solutions proposed.",
    "Consider exploring more technically innovative approaches.",
    "Good balance between feasibility and innovation.",
    "Try using more structured brainstorming techniques."
  ],
  prioritization: [
    "Clear prioritization criteria established.",
    "Consider adding more quantitative measures for prioritization.",
    "Good explanation of trade-offs between solutions.",
    "Try to be more explicit about how solutions map to user needs."
  ],
  user_flow_wireframe: [
    "Clear visual representation of key screens.",
    "Consider showing more states and edge cases.",
    "Good annotation explaining design decisions.",
    "Try to highlight the user flow more explicitly."
  ],
  final_wrap_up: [
    "Effective summary of your approach and solution.",
    "Consider highlighting key trade-offs made during the process.",
    "Good explanation of next steps for the solution.",
    "Try to tie your solution back to the original problem more explicitly."
  ]
};

export const generateMockFeedback = (section: WhiteboardSection): string => {
  const sectionFeedbacks = mockFeedbacks[section];
  return sectionFeedbacks[Math.floor(Math.random() * sectionFeedbacks.length)];
};
