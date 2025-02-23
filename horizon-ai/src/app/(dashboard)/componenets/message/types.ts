import { Timestamp } from '@firebase/firestore-types';

export interface Conversation {
  lastMessage: string;
  lastMessageTimestamp: Timestamp | null;
  patientId: string;
  therapistId: string;
  unreadCountPatient: number;
  unreadCountTherapist: number;
}

export interface Message {
  read: boolean;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

export interface Contact {
  id: string;
  name: string;
  conversationId: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp | null;
}

export interface MessagePageProps {
  userId: string;
  userType: 'patient' | 'therapist';
  onError?: (error: Error) => void;
}