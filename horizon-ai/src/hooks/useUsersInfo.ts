'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/app/utils/firebase/config";

interface UserInfo {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

interface UsersInfoState {
  [key: string]: UserInfo;
}

export function useUsersInfo(userIds: string[]) {
  const [usersInfo, setUsersInfo] = useState<UsersInfoState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersInfo = async () => {
      setLoading(true);
      const newUsersInfo: UsersInfoState = {};

      try {
        await Promise.all(
          userIds.map(async (userId) => {
            // Skip if we already have this user's info
            if (usersInfo[userId]) {
              newUsersInfo[userId] = usersInfo[userId];
              return;
            }

            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              newUsersInfo[userId] = {
                id: userId,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                bio: userData.bio,
              };
            }
          })
        );

        setUsersInfo(newUsersInfo);
      } catch (error) {
        console.error('Error fetching users info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userIds.length > 0) {
      fetchUsersInfo();
    }
  }, [userIds]);

  return { usersInfo, loading };
} 