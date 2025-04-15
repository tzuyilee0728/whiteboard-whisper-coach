
import React from 'react';
import { useSession } from '@/context/SessionContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types';

const IndustrySelector = () => {
  const { selectIndustry, selectedIndustry } = useSession();
  
  const industries: Category[] = [
    'e-commerce',
    'healthcare',
    'finance',
    'social',
    'productivity'
  ];
  
  const handleSelectIndustry = (industry: Category) => {
    selectIndustry(industry);
  };
  
  const getIndustryColor = (industry: Category) => {
    switch(industry) {
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
        Select an Industry
      </label>
      <Select onValueChange={handleSelectIndustry} value={selectedIndustry || ''}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an industry" />
        </SelectTrigger>
        <SelectContent>
          {industries.map((industry) => (
            <SelectItem 
              key={industry} 
              value={industry}
              className={`py-3 ${getIndustryColor(industry)}`}
            >
              <div className="capitalize">{industry.replace('-', ' ')}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IndustrySelector;

