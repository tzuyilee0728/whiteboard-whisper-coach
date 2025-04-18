
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const PrivacySettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Data Collection</p>
            <p className="text-sm text-gray-500">Help improve AI by allowing data collection</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Session History</p>
            <p className="text-sm text-gray-500">Store your practice session history</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <Button variant="outline" className="w-full">
          Delete Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
