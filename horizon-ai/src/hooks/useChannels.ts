import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from "@/app/utils/firebase/config";

export interface Channel {
  id: string;
  name: string;
  createdAt: Timestamp;
  createdBy: string;
  description?: string;
}

export function useChannels(projectId: string) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const channelsRef = collection(db, `projects/${projectId}/channels`);
    const q = query(channelsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelData: Channel[] = [];
      snapshot.forEach((doc) => {
        channelData.push({ id: doc.id, ...doc.data() } as Channel);
      });
      setChannels(channelData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const createChannel = async (channelData: Omit<Channel, 'id' | 'createdAt'>) => {
    const channelsRef = collection(db, `projects/${projectId}/channels`);
    await addDoc(channelsRef, {
      ...channelData,
      createdAt: Timestamp.now(),
    });
  };

  return { channels, loading, createChannel };
} 