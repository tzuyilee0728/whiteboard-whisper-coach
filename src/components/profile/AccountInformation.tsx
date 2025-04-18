
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, User } from 'lucide-react';

interface AccountInformationProps {
  profile: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
  loading: boolean;
  onProfileUpdate: (profile: { full_name: string; email: string; avatar_url: string }) => void;
}

const AccountInformation = ({ profile, loading, onProfileUpdate }: AccountInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Your name" 
              value={profile.full_name}
              onChange={(e) => onProfileUpdate({ ...profile, full_name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Your email"
              value={profile.email}
              onChange={(e) => onProfileUpdate({ ...profile, email: e.target.value })}
            />
          </div>
        </div>
        
        <Button 
          onClick={() => onProfileUpdate(profile)} 
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountInformation;
