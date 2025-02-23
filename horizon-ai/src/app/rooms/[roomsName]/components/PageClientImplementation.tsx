"use client";

import { ConnectionDetails } from "@/lib/types";
import { LocalUserChoices } from "@livekit/components-react";
import { VideoCodec } from "livekit-client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";
import VideoConferenceComponent from "./VideoConference";
import { PreJoin } from "./PreJoin";

const CONN_DETAILS_ENDPOINT =
  process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details";

export function PageClientImpl(props: {
  roomName: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const [preJoinChoices, setPreJoinChoices] = React.useState<
    LocalUserChoices | undefined
  >();
  const [connectionDetails, setConnectionDetails] = React.useState<
    ConnectionDetails | undefined
  >();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const preJoinDefaults = React.useMemo(
    () => ({
      username: "",
      videoEnabled: true,
      audioEnabled: true,
    }),
    []
  );

  const handlePreJoinSubmit = React.useCallback(
    async (values: LocalUserChoices) => {
      try {
        setIsLoading(true);
        setError(null);
        setPreJoinChoices(values);

        const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
        url.searchParams.append("roomName", props.roomName);
        url.searchParams.append("participantName", values.username);
        if (props.region) {
          url.searchParams.append("region", props.region);
        }

        const connectionDetailsResp = await fetch(url.toString());
        if (!connectionDetailsResp.ok) {
          throw new Error("Failed to fetch connection details");
        }

        const connectionDetailsData = await connectionDetailsResp.json();
        setConnectionDetails(connectionDetailsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [props.roomName, props.region]
  );

  const handlePreJoinError = React.useCallback((e: unknown) => {
    console.error(e);
    setError(e instanceof Error ? e.message : "An unexpected error occurred");
  }, []);

  return (
    <main className="h-screen bg-background" data-lk-theme="default">
      {error && (
        <Alert
          variant="destructive"
          className="fixed top-4 right-4 w-auto max-w-md"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {connectionDetails === undefined || preJoinChoices === undefined ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Join Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <Spinner size="lg" />
                  <p className="text-sm text-muted-foreground">
                    Connecting to room...
                  </p>
                </div>
              ) : (
                <PreJoin
                  defaults={preJoinDefaults}
                  onSubmit={handlePreJoinSubmit}
                  onError={handlePreJoinError}
                />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <VideoConferenceComponent
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
          options={{ codec: props.codec, hq: props.hq }}
        />
      )}
    </main>
  );
}
