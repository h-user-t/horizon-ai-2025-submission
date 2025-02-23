'use client';

import * as React from 'react';
import { Track } from 'livekit-client';
import { useMaybeLayoutContext, MediaDeviceMenu, TrackToggle, useRoomContext, useIsRecording } from '@livekit/components-react';
import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export interface SettingsMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SettingsMenu(props: SettingsMenuProps) {
	const layoutContext = useMaybeLayoutContext();
	const room = useRoomContext();
	const recordingEndpoint = process.env.NEXT_PUBLIC_LK_RECORD_ENDPOINT;
	const [error, setError] = React.useState<string | null>(null);

	const settings = React.useMemo(() => {
		return {
			recording: recordingEndpoint ? { label: 'Recording' } : undefined,
		};
	}, [recordingEndpoint]);

	const tabs = React.useMemo(() => Object.keys(settings).filter((t) => t !== undefined) as Array<keyof typeof settings>, [settings]);
	const [activeTab, setActiveTab] = React.useState<string>(tabs[0] || 'recording');

	const { isNoiseFilterEnabled, setNoiseFilterEnabled, isNoiseFilterPending } = useKrispNoiseFilter();

	React.useEffect(() => {
		setNoiseFilterEnabled(true);
	}, [setNoiseFilterEnabled]);

	const isRecording = useIsRecording();
	const [initialRecStatus, setInitialRecStatus] = React.useState(isRecording);
	const [processingRecRequest, setProcessingRecRequest] = React.useState(false);

	React.useEffect(() => {
		if (initialRecStatus !== isRecording) {
			setProcessingRecRequest(false);
		}
	}, [isRecording, initialRecStatus]);

	const roomName = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

	const toggleRoomRecording = async () => {
		try {
			if (!recordingEndpoint) {
				throw new Error('No recording endpoint specified');
			}
			if (room.isE2EEEnabled) {
				throw new Error('Recording of encrypted meetings is currently not supported');
			}

			setProcessingRecRequest(true);
			setInitialRecStatus(isRecording);
			setError(null);

			const response = await fetch(`${recordingEndpoint}/${isRecording ? 'stop' : 'start'}?roomName=${room.name}`);

			if (!response.ok) {
				throw new Error(`Failed to ${isRecording ? 'stop' : 'start'} recording: ${response.statusText}`);
			}
		} catch (err) {
			console.error('Error handling recording request:', err);
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
			setProcessingRecRequest(false);
		}
	};

	return (
		<Card className='w-full shadow-lg' {...props}>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className='w-full'>
						{tabs.map(
							(tab) =>
								settings[tab] && (
									<TabsTrigger key={tab} value={tab} className='flex-1'>
										{settings[tab]?.label}
									</TabsTrigger>
								)
						)}
					</TabsList>

					{error && (
						<Alert variant='destructive' className='mt-4'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<TabsContent value='recording' className='mt-4 space-y-4'>
						<div className='space-y-4'>
							<h3 className='text-lg font-semibold'>Record Meeting</h3>
							<p className='text-sm text-muted-foreground'>
								{isRecording ? 'Meeting is currently being recorded' : 'No active recordings for this meeting'}
							</p>
							<Button
								variant={isRecording ? 'destructive' : 'default'}
								disabled={processingRecRequest}
								onClick={toggleRoomRecording}
								className='w-full'
							>
								{processingRecRequest && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								{isRecording ? 'Stop' : 'Start'} Recording
							</Button>
						</div>
					</TabsContent>
				</Tabs>

				<div className='mt-6 flex justify-end'>
					<Button variant='outline' onClick={() => layoutContext?.widget.dispatch?.({ msg: 'toggle_settings' })}>
						Close
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
