
import { SectionTiming, WhiteboardSection } from "@/types";

export const sectionTimings: Record<WhiteboardSection, SectionTiming> = {
  problem_discovery: {
    section: "problem_discovery",
    title: "Problem Discovery",
    duration: 8,
    description: "Ask clarifying questions to understand the problem space and user needs."
  },
  problem_definition: {
    section: "problem_definition",
    title: "Problem Definition",
    duration: 7,
    description: "Define the core problem to solve and key success metrics."
  },
  ideation: {
    section: "ideation",
    title: "Ideation",
    duration: 12,
    description: "Generate multiple solutions and approaches to solve the problem."
  },
  prioritization: {
    section: "prioritization",
    title: "Prioritization",
    duration: 7,
    description: "Evaluate and prioritize solutions based on criteria like impact and feasibility."
  },
  user_flow_wireframe: {
    section: "user_flow_wireframe",
    title: "User Flow & Wireframe",
    duration: 10,
    description: "Sketch out the key screens and user flow for your solution."
  },
  final_wrap_up: {
    section: "final_wrap_up",
    title: "Final Wrap-up",
    duration: 5,
    description: "Summarize your approach and solution."
  }
};
