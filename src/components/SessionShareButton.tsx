
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SessionShareButtonProps {
  sessionActive: boolean;
}

const SessionShareButton: React.FC<SessionShareButtonProps> = ({ sessionActive }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
    if (!showShareOptions) {
      toast.success("Share this tool with fellow designers!");
    }
  };
  
  if (!sessionActive) return null;
  
  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
};

export default SessionShareButton;
