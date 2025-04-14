
import React, { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { WhiteboardSection } from '@/types';
import { sectionTimings } from '@/services/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SectionGuidanceProps {
  section: WhiteboardSection;
}

const SectionGuidance: React.FC<SectionGuidanceProps> = ({ section }) => {
  const { currentSection } = useSession();
  const [expanded, setExpanded] = useState(false);
  
  // Tips for each section
  const sectionTips: Record<WhiteboardSection, string[]> = {
    problem_discovery: [
      "Ask about user demographics and behaviors",
      "Inquire about business goals and constraints",
      "Request available data and metrics",
      "Clarify the scope of the problem"
    ],
    problem_definition: [
      "Clearly articulate the problem statement",
      "Define key success metrics",
      "Identify key user and business needs",
      "Establish constraints and boundaries"
    ],
    ideation: [
      "Generate a wide range of potential solutions",
      "Don't evaluate ideas too early - focus on quantity",
      "Consider different approaches and perspectives",
      "Think about both user needs and business goals"
    ],
    prioritization: [
      "Establish clear criteria for evaluation",
      "Consider impact vs. feasibility",
      "Explain your reasoning for prioritization",
      "Create a roadmap for implementation"
    ],
    user_flow_wireframe: [
      "Focus on key screens and user flows",
      "Explain your design decisions",
      "Consider edge cases and error states",
      "Show how your solution addresses the core problem"
    ],
    final_wrap_up: [
      "Summarize your approach and solution",
      "Highlight key decisions and trade-offs",
      "Discuss potential next steps",
      "Mention how you would validate your solution"
    ]
  };
  
  return (
    <div className="bg-white p-4 rounded-md border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">{sectionTimings[section].title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8 p-0"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{sectionTimings[section].description}</p>
      
      {expanded && (
        <div className="mt-4 bg-gray-50 p-3 rounded-md border">
          <div className="flex items-center gap-1 text-sm font-medium mb-2">
            <HelpCircle className="h-4 w-4 text-brand-500" />
            <span>Tips for this section:</span>
          </div>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {sectionTips[section].map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SectionGuidance;
