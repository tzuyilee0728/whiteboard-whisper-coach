
import { Session } from "@/types";
import { mockChallenges } from "./mockChallenges";

export const mockSessions: Session[] = [
  {
    id: "s1",
    date: "2025-04-09T14:30:00Z",
    challenge: mockChallenges[0],
    duration: 35,
    status: "completed",
    feedback: {
      id: "f1",
      sessionId: "s1",
      strengths: [
        "Good problem exploration",
        "Clear solution articulation"
      ],
      improvements: [
        "Spend more time on user research",
        "Consider more edge cases"
      ],
      sectionFeedback: {
        problem_discovery: "Asked good clarifying questions about the user demographics and current cart experience.",
        problem_definition: "Clearly defined the problem, but could have explored more root causes.",
        ideation: "Generated a good range of solutions, though could have explored more innovative approaches.",
        prioritization: "Well-structured prioritization framework based on impact and feasibility.",
        user_flow_wireframe: "Clear wireframes that addressed the main pain points.",
        final_wrap_up: "Well summarized solution and approach."
      },
      overallRating: 4
    }
  },
  {
    id: "s2",
    date: "2025-04-08T10:15:00Z",
    challenge: mockChallenges[1],
    duration: 42,
    status: "completed",
    feedback: {
      id: "f2",
      sessionId: "s2",
      strengths: [
        "Empathetic approach to user needs",
        "Thorough market analysis"
      ],
      improvements: [
        "Work on time management",
        "Be more specific about success metrics"
      ],
      sectionFeedback: {
        problem_discovery: "Strong empathy shown in understanding mental health user needs.",
        problem_definition: "Good definition of key problems to solve.",
        ideation: "Creative solutions proposed, well-aligned with user needs.",
        prioritization: "Could have been more structured in prioritization approach.",
        user_flow_wireframe: "Wireframes were clear but could use more detail in key interactions.",
        final_wrap_up: "Good wrap up of the session with key points."
      },
      overallRating: 3.5
    }
  }
];
