import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {TabsContent } from "@/components/ui/tabs";

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderTime: string;
}

const NotificationsSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: false,
    smsNotifications: false,
    reminderTime: '24'
  });

  const handlePreferenceChange = (
    field: keyof NotificationPreferences, 
    value: boolean | string
  ) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));

    // Add your logic for saving preferences
    // This could be an API call or other state management
    console.log(`Updated ${field} to ${value}`);
  };

  return (
    <TabsContent value="notifications">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive appointment reminders via email
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => 
                handlePreferenceChange('emailNotifications', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive appointment reminders via SMS
              </p>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => 
                handlePreferenceChange('smsNotifications', checked)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <Select
              value={preferences.reminderTime}
              onValueChange={(value) => 
                handlePreferenceChange('reminderTime', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 hours before</SelectItem>
                <SelectItem value="12">12 hours before</SelectItem>
                <SelectItem value="6">6 hours before</SelectItem>
                <SelectItem value="1">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default NotificationsSettings;