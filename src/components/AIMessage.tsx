
import React from 'react';

interface AIMessageProps {
  sender: 'stakeholder' | 'user';
  message: string;
}

const AIMessage: React.FC<AIMessageProps> = ({ sender, message }) => {
  const isStakeholder = sender === 'stakeholder';
  
  return (
    <div className={`${isStakeholder ? 'bg-brand-50' : 'bg-gray-100'} p-3 rounded-lg max-w-[85%] ${!isStakeholder ? 'ml-auto' : ''}`}>
      <p className="text-sm">
        <span className={`font-medium ${isStakeholder ? 'text-brand-700' : ''}`}>
          {isStakeholder ? 'Stakeholder: ' : 'You: '}
        </span>
        {message}
      </p>
    </div>
  );
};

export default AIMessage;
