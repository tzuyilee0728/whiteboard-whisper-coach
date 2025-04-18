
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

const NotificationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Session Reminders</p>
            <p className="text-sm text-gray-500">Receive reminders for scheduled practice sessions</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Section Time Alerts</p>
            <p className="text-sm text-gray-500">Get notified when section time is running low</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Feedback Notifications</p>
            <p className="text-sm text-gray-500">Receive notifications when session feedback is ready</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Digests</p>
            <p className="text-sm text-gray-500">Weekly summaries of your practice progress</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
