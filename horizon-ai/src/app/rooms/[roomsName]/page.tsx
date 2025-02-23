import * as React from 'react';
import { isVideoCodec } from '@/lib/types';
import { PageClientImpl } from './components/PageClientImplementation';

export default async function Page({
	params,
	searchParams,
  }: {
	params: { roomName: string };
	searchParams: {
	  region?: string;
	  hq?: string;
	  codec?: string;
	};
  }) {
	// Await the searchParams before using its properties
	const resolvedSearchParams = await searchParams;
  
	const codec =
	  typeof resolvedSearchParams.codec === 'string' && isVideoCodec(resolvedSearchParams.codec)
		? resolvedSearchParams.codec
		: 'vp9';
  
	const hq = resolvedSearchParams.hq === 'true';
  
	return (
	  <PageClientImpl
		roomName={params.roomName}
		region={resolvedSearchParams.region}
		hq={hq}
		codec={codec}
	  />
	);
  }
