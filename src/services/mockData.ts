import { Challenge, Session, SectionTiming, WhiteboardSection } from "@/types";

export const mockChallenges: Challenge[] = [
  {
    id: "c1",
    title: "Shopping Cart Redesign",
    description: "An e-commerce company is experiencing a high abandonment rate in their shopping cart. Design a solution that improves the checkout flow and reduces cart abandonment.",
    category: "e-commerce"
  },
  {
    id: "c2",
    title: "Mental Health App",
    description: "Design a mobile app that helps users track their mental health and provides resources for managing anxiety and stress.",
    category: "healthcare"
  },
  {
    id: "c3",
    title: "Investment Platform for Beginners",
    description: "Create an investment platform that helps beginners understand and start investing in stocks and other financial instruments.",
    category: "finance"
  },
  {
    id: "c4",
    title: "Social Media Content Scheduler",
    description: "Design a content scheduling tool for social media managers that allows them to plan, create, and schedule posts across multiple platforms.",
    category: "productivity"
  }
];

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

// Mock AI generated questions based on challenge category
export const mockAIQuestions: Record<string, string[]> = {
  "e-commerce": [
    "What do we know about the target users of this e-commerce platform?",
    "What data do we have about where users abandon their carts?",
    "Are there any technical constraints I should be aware of?",
    "What payment methods are currently supported?",
    "What's the primary goal of this redesign? Increasing conversions or improving user experience?"
  ],
  "healthcare": [
    "What privacy regulations do we need to consider for this health application?",
    "Who are the primary users of this mental health app?",
    "Are there any specific mental health frameworks we should incorporate?",
    "Would users want to share their data with healthcare providers?",
    "What kind of engagement frequency are we expecting from users?"
  ],
  "finance": [
    "What's the financial literacy level of our target users?",
    "Are there regulatory considerations for this investment platform?",
    "What types of investments will the platform focus on?",
    "How do we plan to explain financial risk to beginners?",
    "What's the primary goal - education or actual investment facilitation?"
  ],
  "social": [
    "What social platforms should this tool support?",
    "Do we have access to these platforms' APIs?",
    "What kind of analytics are important for social media managers?",
    "Should the tool support multimedia content creation or just scheduling?",
    "What are the biggest pain points in current social media workflow?"
  ],
  "productivity": [
    "Who are the primary users of this productivity tool?",
    "What existing tools are users currently using?",
    "Should this integrate with other productivity software?",
    "Is team collaboration a key feature?",
    "What metrics would define success for this productivity tool?"
  ]
};

export const generateMockFeedback = (section: WhiteboardSection): string => {
  const feedbacks: Record<WhiteboardSection, string[]> = {
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

  // Randomly select feedback from the appropriate section
  const sectionFeedbacks = feedbacks[section];
  return sectionFeedbacks[Math.floor(Math.random() * sectionFeedbacks.length)];
};

export const getRandomAIQuestion = (category: string): string => {
  const questions = mockAIQuestions[category] || mockAIQuestions["e-commerce"];
  return questions[Math.floor(Math.random() * questions.length)];
};
