
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/context/SessionContext';
import { toast } from 'sonner';

const NotePad = () => {
  const { currentSession } = useSession();
  const [notes, setNotes] = useState('');
  
  // Load any saved notes when the session changes
  useEffect(() => {
    if (currentSession) {
      const savedNotes = localStorage.getItem(`notes_${currentSession.id}`);
      if (savedNotes) {
        setNotes(savedNotes);
      } else {
        setNotes('');
      }
    }
  }, [currentSession]);
  
  const handleSaveNotes = () => {
    if (currentSession) {
      localStorage.setItem(`notes_${currentSession.id}`, notes);
      toast.success("Notes saved successfully");
    } else {
      toast.error("Cannot save notes. No active session.");
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <FileText className="h-5 w-5 mr-2" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-0">
        <Textarea
          placeholder="Take notes here during your whiteboard challenge..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-full resize-none"
        />
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Button 
          onClick={handleSaveNotes} 
          className="w-full bg-brand-600 hover:bg-brand-700 flex items-center justify-center"
          disabled={!currentSession}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Notes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotePad;
