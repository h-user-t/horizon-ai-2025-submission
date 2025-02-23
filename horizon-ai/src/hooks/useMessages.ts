import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from "@/app/utils/firebase/config";

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Timestamp;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

export function useMessages(projectId: string, channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) return;

    const messagesRef = collection(
      db,
      `projects/${projectId}/channels/${channelId}/messages`
    );
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData: Message[] = [];
      snapshot.forEach((doc) => {
        messageData.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId, channelId]);

  const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const messagesRef = collection(
      db,
      `projects/${projectId}/channels/${channelId}/messages`
    );
    await addDoc(messagesRef, {
      ...messageData,
      timestamp: Timestamp.now(),
    });
  };

  return { messages, loading, sendMessage };
} 