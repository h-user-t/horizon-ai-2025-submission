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
import { TabsContent } from "@/components/ui/tabs";
import { Sun, Moon } from "lucide-react";

interface AppPreferences {
  theme: string;
  language: string;
  timezone: string;
  soundEnabled: boolean;
}

const PreferencesSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<AppPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    soundEnabled: false
  });

  const handlePreferenceChange = (
    field: keyof AppPreferences, 
    value: string | boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));

    // Add your logic for saving preferences
    // This could be an API call or other state management
    console.log(`Updated ${field} to ${value}`);

    // Optional: Add theme change logic
    if (field === 'theme') {
      // Example of how you might implement theme change
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(value as string);
    }
  };

  return (
    <TabsContent value="preferences">
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => 
                handlePreferenceChange('theme', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => 
                handlePreferenceChange('language', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => 
                handlePreferenceChange('timezone', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern Time</SelectItem>
                <SelectItem value="PST">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sound Effects</Label>
              <p className="text-sm text-gray-500">
                Enable sound effects for notifications
              </p>
            </div>
            <Switch
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) => 
                handlePreferenceChange('soundEnabled', checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default PreferencesSettings;