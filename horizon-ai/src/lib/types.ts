import { 
  LocalAudioTrack, 
  LocalVideoTrack, 
  videoCodecs, 
  VideoCodec, 
  RTCIceServer 
} from 'livekit-client';

/**
 * Properties for initializing a LiveKit session
 */
export interface SessionProps {
  /** The name of the room to join */
  roomName: string;
  
  /** The participant's identity */
  identity: string;
  
  /** Pre-configured local audio track */
  audioTrack?: LocalAudioTrack;
  
  /** Pre-configured local video track */
  videoTrack?: LocalVideoTrack;
  
  /** Optional region for server selection */
  region?: string;
  
  /** Optional TURN server configuration */
  turnServer?: RTCIceServer;
  
  /** Whether to force relay through TURN servers */
  forceRelay?: boolean;
}

/**
 * Result of token authentication
 */
export interface TokenResult {
  /** Participant identity */
  identity: string;
  
  /** JWT access token */
  accessToken: string;
}

/**
 * Details required for establishing a connection
 */
export interface ConnectionDetails {
  /** WebSocket server URL */
  serverUrl: string;
  
  /** Room name to connect to */
  roomName: string;
  
  /** Name of the participant */
  participantName: string;
  
  /** Authentication token for the participant */
  participantToken: string;
}

/**
 * Video codec options supported by LiveKit
 * @example
 * const codec: VideoCodec = 'vp8';
 * if (isVideoCodec(codec)) {
 *   // codec is type-safe here
 * }
 */
export const SUPPORTED_VIDEO_CODECS = videoCodecs;

/**
 * Type guard to check if a string is a valid VideoCodec
 * @param codec - String to check
 * @returns True if the string is a valid VideoCodec
 */
export function isVideoCodec(codec: string): codec is VideoCodec {
  return videoCodecs.includes(codec as VideoCodec);
}

/**
 * Default video codec to use when none is specified
 */
export const DEFAULT_VIDEO_CODEC: VideoCodec = 'vp9';

/**
 * Connection states for a room
 */
export enum RoomConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Error = 'error'
}

/**
 * Error types that can occur during room connection
 */
export enum RoomConnectionError {
  TokenError = 'token_error',
  ConnectionError = 'connection_error',
  RoomFull = 'room_full',
  InvalidRoom = 'invalid_room'
}

/**
 * Configuration for room connection
 */
export interface RoomConnectionConfig {
  /** Maximum reconnection attempts */
  maxRetries?: number;
  
  /** Timeout in milliseconds for connection attempts */
  timeout?: number;
  
  /** Whether to automatically reconnect on disconnect */
  autoReconnect?: boolean;
}