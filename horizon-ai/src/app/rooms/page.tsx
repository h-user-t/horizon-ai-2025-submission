'use client';

import { useRouter } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowLeft, Settings } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const [isLoading, setIsLoading] = useState(false);

  const startMeeting = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (e2ee) {
        router.push(`/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`);
      } else {
        router.push(`/rooms/${generateRoomId()}`);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/patient')}
            className="text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">New Session</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-semibold text-gray-900">Session Settings</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/settings')}
                className="text-gray-500"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
              </div>
            }>
              <div className="space-y-6">
                {/* Session Security Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <Checkbox
                      id="use-e2ee"
                      checked={e2ee}
                      onCheckedChange={(checked) => setE2ee(checked as boolean)}
                    />
                    <Label 
                      htmlFor="use-e2ee"
                      className="font-medium cursor-pointer flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      End-to-end encryption
                    </Label>
                  </div>

                  {e2ee && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <Label htmlFor="passphrase">Session Passphrase</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        value={sharedPassphrase}
                        onChange={(ev) => setSharedPassphrase(ev.target.value)}
                        className="font-mono"
                      />
                      <p className="text-sm text-gray-500">
                        Share this passphrase with your client through a secure channel before starting the session.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button 
                    size="lg"
                    className="w-full py-6 text-base font-medium"
                    onClick={startMeeting}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preparing session...
                      </span>
                    ) : (
                      "Start Session"
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Compliance Notice */}
                <div className="text-xs text-gray-500 text-center">
                  This session complies with HIPAA requirements for telehealth services.
                </div>
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}