
import React from 'react';
import { useSession } from '@/context/SessionContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Challenge } from '@/types';
import { Badge } from '@/components/ui/badge';

const ChallengeSelector = () => {
  const { challenges, selectChallenge, currentChallenge } = useSession();
  
  const handleSelectChallenge = (challengeId: string) => {
    selectChallenge(challengeId);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid-level': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'e-commerce': return 'bg-purple-100 text-purple-800';
      case 'healthcare': return 'bg-blue-100 text-blue-800';
      case 'finance': return 'bg-emerald-100 text-emerald-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'productivity': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select a Challenge
      </label>
      <Select onValueChange={handleSelectChallenge} value={currentChallenge?.id || ''}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a design challenge" />
        </SelectTrigger>
        <SelectContent>
          {challenges.map((challenge: Challenge) => (
            <SelectItem 
              key={challenge.id} 
              value={challenge.id}
              className="py-3"
            >
              <div>
                <div className="mb-1 font-medium">{challenge.title}</div>
                <div className="flex gap-2 mb-1">
                  <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline" className={getCategoryColor(challenge.category)}>
                    {challenge.category}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 line-clamp-2">
                  {challenge.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChallengeSelector;
