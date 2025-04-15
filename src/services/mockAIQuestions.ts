
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

export const getRandomAIQuestion = (category: string): string => {
  const questions = mockAIQuestions[category] || mockAIQuestions["e-commerce"];
  return questions[Math.floor(Math.random() * questions.length)];
};
