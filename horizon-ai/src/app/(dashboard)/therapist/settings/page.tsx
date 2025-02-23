"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  User,
  Clock,
} from "lucide-react"
import GeneralSettings from "./components/GeneralSettings"
import NotificationsSettings from "./components/NotificationsSettings"
import PreferencesSettings from "./components/PreferencesSettings"

export default function SettingsPage() {

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#146C94]">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full justify-start bg-transparent border-b">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <GeneralSettings />

        {/* Notifications Settings */}
        <NotificationsSettings />

        {/* Preferences Settings */}
        <PreferencesSettings />
      </Tabs>
    </div>
  )
}