'use client';

import { ConnectionDetails } from '@/lib/types';
import {
  formatChatMessageLinks,
  LiveKitRoom,
  LocalUserChoices,
} from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  Room,
  DeviceUnsupportedError,
  RoomConnectOptions,
} from 'livekit-client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { DebugMode } from '@/lib/Debug';
import { SettingsMenu } from '@/lib/SettingsMenu';
import { decodePassphrase } from '@/lib/client-utils';
import { VideoConference } from './Video';
import { auth, db } from "@/app/utils/firebase/config"
import { doc, getDoc } from 'firebase/firestore';

const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU == 'true';


function VideoConferenceComponent(props: {
    userChoices: LocalUserChoices;
    connectionDetails: ConnectionDetails;
    options: {
      hq: boolean;
      codec: VideoCodec;
    };
  }) {
    const router = useRouter();
    const [e2eeSetupProgress, setE2eeSetupProgress] = React.useState(0);
    const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);
    const [setupError, setSetupError] = React.useState<string | null>(null);
  
    const e2eePassphrase = typeof window !== 'undefined' && decodePassphrase(location.hash.substring(1));
    const worker = typeof window !== 'undefined' && e2eePassphrase &&
      new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
    const e2eeEnabled = !!(e2eePassphrase && worker);
    const keyProvider = new ExternalE2EEKeyProvider();
  
    const roomOptions = React.useMemo((): RoomOptions => {
      let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';
      if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
        videoCodec = undefined;
      }
      return {
        videoCaptureDefaults: {
          deviceId: props.userChoices.videoDeviceId ?? undefined,
          resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
        },
        publishDefaults: {
          dtx: false,
          videoSimulcastLayers: props.options.hq
            ? [VideoPresets.h1080, VideoPresets.h720]
            : [VideoPresets.h540, VideoPresets.h216],
          red: !e2eeEnabled,
          videoCodec,
        },
        audioCaptureDefaults: {
          deviceId: props.userChoices.audioDeviceId ?? undefined,
        },
        adaptiveStream: { pixelDensity: 'screen' },
        dynacast: true,
        e2ee: e2eeEnabled
          ? {
              keyProvider,
              worker,
            }
          : undefined,
      };
    }, [props.options.codec, props.options.hq, props.userChoices.videoDeviceId, props.userChoices.audioDeviceId, e2eeEnabled, keyProvider, worker]);
  
    const room = React.useMemo(() => new Room(roomOptions), [roomOptions]);
  
    React.useEffect(() => {
      const setupE2EE = async () => {
        if (e2eeEnabled) {
          try {
            setE2eeSetupProgress(25);
            await keyProvider.setKey(decodePassphrase(e2eePassphrase));
            setE2eeSetupProgress(75);
            
            await room.setE2EEEnabled(true);
            setE2eeSetupProgress(100);
            setE2eeSetupComplete(true);
          } catch (e) {
            if (e instanceof DeviceUnsupportedError) {
              setSetupError('Your browser does not support encrypted meetings. Please update to the latest version.');
            } else {
              setSetupError('Failed to setup encryption');
            }
            console.error(e);
          }
        } else {
          setE2eeSetupComplete(true);
        }
      };
  
      setupE2EE();
    }, [e2eeEnabled, room, e2eePassphrase]);
  
    const connectOptions = React.useMemo((): RoomConnectOptions => ({
      autoSubscribe: true,
    }), []);
  
    const handleOnLeave = React.useCallback(async () => {

      const currentUser = auth.currentUser;
      const sessionId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';
      if (!sessionId) {
        throw new Error('Session ID not found');
      }
      const docRef = doc(db, "sessions", sessionId);
      const docSnap = await getDoc(docRef)
      const therapistId = docSnap.data()!.therapistId

      router.back();
      setTimeout(async () => {

        const transcriptionResponse = fetch('/api/getTranscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ s3Key: 'TherapyRecording.mp4', userId: currentUser?.uid, therapistId, sessionDate: new Date(), sessionId }),
        });
  
        const transcriptionText = (await transcriptionResponse).text;
        
        // const summaryResponse = fetch('/api/getSummary', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ prompt: transcriptionText }),
        // });
      }, 10000);

    }, []);
    
    const handleError = React.useCallback((error: Error) => {
      console.error(error);
      setSetupError(`Encountered an error: ${error.message}`);
    }, []);
  
    const handleEncryptionError = React.useCallback((error: Error) => {
      console.error(error);
      setSetupError(`Encryption error: ${error.message}`);
    }, []);
  
    if (!e2eeSetupComplete) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6" />
                <span>Setting up secure connection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={e2eeSetupProgress} className="mb-4" />
              {setupError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Setup Error</AlertTitle>
                  <AlertDescription>{setupError}</AlertDescription>
                </Alert>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Initializing encryption...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
  
    return (
      <LiveKitRoom
        connect={e2eeSetupComplete}
        room={room}
        token={props.connectionDetails.participantToken}
        serverUrl={props.connectionDetails.serverUrl}
        connectOptions={connectOptions}
        video={props.userChoices.videoEnabled}
        audio={props.userChoices.audioEnabled}
        onDisconnected={handleOnLeave}
        onEncryptionError={handleEncryptionError}
        onError={handleError}
      >
        {setupError && (
          <Alert variant="destructive" className="fixed top-4 right-4 w-auto max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{setupError}</AlertDescription>
          </Alert>
        )}
        <VideoConference
          chatMessageFormatter={formatChatMessageLinks}
          SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
        />
        <DebugMode />
      </LiveKitRoom>
    );
}

export default VideoConferenceComponent;