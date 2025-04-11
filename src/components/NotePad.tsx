
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText } from 'lucide-react';

const NotePad = () => {
  const [notes, setNotes] = useState('');
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          placeholder="Take notes here during your whiteboard challenge..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-full resize-none"
        />
      </CardContent>
    </Card>
  );
};

export default NotePad;
