'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/app/utils/firebase/config";

export interface UserInfo {
  id: string;
  basicInformation: {
    fullName: string;
    profilePicture?: string;
    city?: string;
    state?: string;
    country?: string;
    bio?: string;
    currentRole?: {
      role: string;
      company: string;
    };
  };
  contactInformation?: {
    secondaryEmail?: string;
  };
}

export function useUserInfo(userId: string | undefined) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserInfo({
            id: userSnap.id,
            ...userSnap.data()
          } as UserInfo);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  return { userInfo, loading };
} 