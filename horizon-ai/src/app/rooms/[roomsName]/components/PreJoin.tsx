import type {
  CreateLocalTracksOptions,
  LocalAudioTrack,
  LocalTrack,
  LocalVideoTrack,
  TrackProcessor,
} from 'livekit-client';
import {
  createLocalTracks,
  facingModeFromLocalTrack,
  Track,
  Mutex,
} from 'livekit-client';
import * as React from 'react';
import { MediaDeviceMenu, TrackToggle, ParticipantPlaceholder } from '@livekit/components-react';
import type { LocalUserChoices } from '@livekit/components-core';
import { log } from '@livekit/components-core';
import { useMediaDevices, usePersistentUserChoices } from '@livekit/components-react/hooks';
import { ChevronDown } from 'lucide-react';

export interface PreJoinProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onError'> {
  onSubmit?: (values: LocalUserChoices) => void;
  onValidate?: (values: LocalUserChoices) => boolean;
  onError?: (error: Error) => void;
  defaults?: Partial<LocalUserChoices>;
  debug?: boolean;
  joinLabel?: string;
  micLabel?: string;
  camLabel?: string;
  userLabel?: string;
  persistUserChoices?: boolean;
  videoProcessor?: TrackProcessor<Track.Kind.Video>;
}

export function usePreviewTracks(
  options: CreateLocalTracksOptions,
  onError?: (err: Error) => void,
) {
  const [tracks, setTracks] = React.useState<LocalTrack[]>();
  const trackLock = React.useMemo(() => new Mutex(), []);

  React.useEffect(() => {
    let needsCleanup = false;
    let localTracks: Array<LocalTrack> = [];
    trackLock.lock().then(async (unlock) => {
      try {
        if (options.audio || options.video) {
          localTracks = await createLocalTracks(options);
          if (needsCleanup) {
            localTracks.forEach((tr) => tr.stop());
          } else {
            setTracks(localTracks);
          }
        }
      } catch (e: unknown) {
        if (onError && e instanceof Error) {
          onError(e);
        } else {
          log.error(e);
        }
      } finally {
        unlock();
      }
    });

    return () => {
      needsCleanup = true;
      localTracks.forEach((track) => track.stop());
    };
  }, [JSON.stringify(options), onError, trackLock]);

  return tracks;
}

export function PreJoin({
  defaults = {},
  onValidate,
  onSubmit,
  onError,
  debug,
  joinLabel = 'Join Room',
  micLabel = 'Microphone',
  camLabel = 'Camera',
  userLabel = 'Username',
  persistUserChoices = true,
  videoProcessor,
  ...htmlProps
}: PreJoinProps) {
  const {
    userChoices: initialUserChoices,
    saveAudioInputDeviceId,
    saveAudioInputEnabled,
    saveVideoInputDeviceId,
    saveVideoInputEnabled,
    saveUsername,
  } = usePersistentUserChoices({
    defaults,
    preventSave: !persistUserChoices,
    preventLoad: !persistUserChoices,
  });

  const [userChoices, setUserChoices] = React.useState(initialUserChoices);
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(userChoices.audioEnabled);
  const [videoEnabled, setVideoEnabled] = React.useState<boolean>(userChoices.videoEnabled);
  const [audioDeviceId, setAudioDeviceId] = React.useState<string>(userChoices.audioDeviceId);
  const [videoDeviceId, setVideoDeviceId] = React.useState<string>(userChoices.videoDeviceId);
  const [username, setUsername] = React.useState(userChoices.username);

  React.useEffect(() => {
    saveAudioInputEnabled(audioEnabled);
  }, [audioEnabled, saveAudioInputEnabled]);
  React.useEffect(() => {
    saveVideoInputEnabled(videoEnabled);
  }, [videoEnabled, saveVideoInputEnabled]);
  React.useEffect(() => {
    saveAudioInputDeviceId(audioDeviceId);
  }, [audioDeviceId, saveAudioInputDeviceId]);
  React.useEffect(() => {
    saveVideoInputDeviceId(videoDeviceId);
  }, [videoDeviceId, saveVideoInputDeviceId]);
  React.useEffect(() => {
    saveUsername(username);
  }, [username, saveUsername]);

  const tracks = usePreviewTracks(
    {
      audio: audioEnabled ? { deviceId: initialUserChoices.audioDeviceId } : false,
      video: videoEnabled
        ? { deviceId: initialUserChoices.videoDeviceId, processor: videoProcessor }
        : false,
    },
    onError,
  );

  const videoEl = React.useRef<HTMLVideoElement>(null);
  const videoTrack = React.useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
    [tracks],
  );
  const facingMode = React.useMemo(() => {
    if (videoTrack) {
      const { facingMode } = facingModeFromLocalTrack(videoTrack);
      return facingMode;
    } else {
      return 'undefined';
    }
  }, [videoTrack]);
  const audioTrack = React.useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Audio)[0] as LocalAudioTrack,
    [tracks],
  );

  React.useEffect(() => {
    if (videoEl.current && videoTrack) {
      videoTrack.unmute();
      videoTrack.attach(videoEl.current);
    }
    return () => {
      videoTrack?.detach();
    };
  }, [videoTrack]);

  const [isValid, setIsValid] = React.useState<boolean>(false);
  const handleValidation = React.useCallback(
    (values: LocalUserChoices) => {
      if (typeof onValidate === 'function') {
        return onValidate(values);
      } else {
        return values.username !== '';
      }
    },
    [onValidate],
  );

  React.useEffect(() => {
    const newUserChoices = {
      username,
      videoEnabled,
      videoDeviceId,
      audioEnabled,
      audioDeviceId,
    };
    setUserChoices(newUserChoices);
    setIsValid(handleValidation(newUserChoices));
  }, [username, videoEnabled, handleValidation, audioEnabled, audioDeviceId, videoDeviceId]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (handleValidation(userChoices)) {
      if (typeof onSubmit === 'function') {
        onSubmit(userChoices);
      }
    } else {
      log.warn('Validation failed with: ', userChoices);
    }
  }

  return (
    <>
      <div className="bg-white flex items-center justify-center py-2" {...htmlProps}>
        <div className="container max-w-3xl mx-auto px-4 md:px-6 text-center">
          {/* Video Preview */}
          <div className="mb-6">
            {videoTrack ? (
              <video
                ref={videoEl}
                className="w-full max-w-lg rounded-xl shadow-lg mx-auto"
                data-lk-facing-mode={facingMode}
              />
            ) : (
              <div className="w-full max-w-lg h-64 flex items-center justify-center bg-[#F6F1F1] rounded-xl shadow-lg mx-auto">
                <ParticipantPlaceholder />
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <TrackToggle
                initialState={audioEnabled}
                source={Track.Source.Microphone}
                onChange={(enabled) => setAudioEnabled(enabled)}
                className="!bg-[#AFD3E2] !text-[#146C94] px-5 py-2 rounded-md text-sm font-medium hover:!bg-[#146C94] hover:!text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {micLabel}
              </TrackToggle>
              <MediaDeviceMenu
                initialSelection={audioDeviceId}
                kind="audioinput"
                tracks={{ audioinput: audioTrack }}
                onActiveDeviceChange={(_, id) => setAudioDeviceId(id)}
                className="!bg-[#AFD3E2] !text-[#146C94] px-2 py-2 rounded-md text-sm font-medium hover:!bg-[#146C94] hover:!text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ChevronDown />
              </MediaDeviceMenu>
            </div>
            <div className="flex items-center gap-2">
              <TrackToggle
                initialState={videoEnabled}
                source={Track.Source.Camera}
                onChange={(enabled) => setVideoEnabled(enabled)}
                className="!bg-[#AFD3E2] !text-[#146C94] px-5 py-2 rounded-md text-sm font-medium hover:!bg-[#146C94] hover:!text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {camLabel}
              </TrackToggle>
              <MediaDeviceMenu
                initialSelection={videoDeviceId}
                kind="videoinput"
                tracks={{ videoinput: videoTrack }}
                onActiveDeviceChange={(_, id) => setVideoDeviceId(id)}
                className="!bg-[#AFD3E2] !text-[#146C94] px-2 py-2 rounded-md text-sm font-medium hover:!bg-[#146C94] hover:!text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ChevronDown />
              </MediaDeviceMenu>
            </div>
          </div>
          
          {/* Form */}
          <form className="space-y-2 max-w-md mx-auto" onSubmit={handleSubmit}>
            <input
              className="w-full px-6 py-4 rounded-xl bg-white border text-[#146C94] placeholder-[#146C94]/60 focus:outline-none focus:ring-2 transition-all duration-200 border-[#AFD3E2] focus:border-[#146C94] focus:ring-[#AFD3E2] shadow-sm"
              id="username"
              name="username"
              type="text"
              value={username}
              placeholder={userLabel}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-[#AFD3E2] text-[#146C94] px-5 py-2 rounded-md text-sm font-medium hover:bg-[#146C94] hover:text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md w-full"
              disabled={!isValid}
            >
              {joinLabel}
            </button>
          </form>
          
          {/* Debug */}
          {debug && (
            <div className="mt-4 text-left max-w-md mx-auto">
              <strong className="text-[#146C94]">User Choices:</strong>
              <ul className="text-[#146C94]/70 text-sm mt-2">
                <li>Username: {userChoices.username}</li>
                <li>Video Enabled: {String(userChoices.videoEnabled)}</li>
                <li>Audio Enabled: {String(userChoices.audioEnabled)}</li>
                <li>Video Device: {userChoices.videoDeviceId || 'None'}</li>
                <li>Audio Device: {userChoices.audioDeviceId || 'None'}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
  
      {/* Custom CSS to ensure dropdown consistency */}
      <style jsx>{`
        .lk-device-menu button {
          background-color: #AFD3E2 !important;
          color: #146C94 !important;
          padding: 0.5rem 1.25rem !important;
          border-radius: 0.375rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          transition: all 200ms ease-in-out !important;
        }
        .lk-device-menu button:hover {
          background-color: #146C94 !important;
          color: #F6F1F1 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
}