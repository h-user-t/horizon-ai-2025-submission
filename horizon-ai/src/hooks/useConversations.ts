'use client';

import { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from "@/app/utils/firebase/config";
import { useAuth } from '@/app/utils/contexts/AuthContext';

export interface Conversation {
  id: string;
  participants: string[];
  projectId: string;
  lastMessage?: {
    content: string;
    timestamp: Timestamp;
    senderId: string;
  };
  createdAt: Timestamp;
}

export function useConversations(projectId: string) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchConversations = async () => {
      try {
        const conversationsRef = collection(db, `users/${user.uid}/discussions`);
        const q = query(conversationsRef, where('projectId', '==', projectId));
        const snapshot = await getDocs(q);
        
        const conversationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Conversation[];

        setConversations(conversationsData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [projectId, user?.uid]);

  const createConversation = async (otherUserId: string) => {
    if (!user?.uid) return null;

    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(otherUserId) && conv.projectId === projectId
      );

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const conversationId = `${projectId}_${user.uid}_${otherUserId}`.replace(/[.#$/\[\]]/g, '_');
      
      const conversationData: Omit<Conversation, 'id'> = {
        participants: [user.uid, otherUserId],
        projectId,
        createdAt: Timestamp.now(),
      };

      // Add to current user's discussions
      await setDoc(
        doc(db, `users/${user.uid}/discussions`, conversationId),
        conversationData
      );

      // Add to other user's discussions
      await setDoc(
        doc(db, `users/${otherUserId}/discussions`, conversationId),
        conversationData
      );

      const newConversation: Conversation = {
        id: conversationId,
        ...conversationData
      };

      setConversations(prev => [...prev, newConversation]);
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    createConversation
  };
} 