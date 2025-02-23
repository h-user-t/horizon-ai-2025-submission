// lib/firebase/waitlist.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

interface WaitlistEntry {
  fullName: string;
  email: string;
  createdAt?: unknown;
}

export const addToWaitlist = async (data: WaitlistEntry) => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const docRef = await addDoc(waitlistRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { success: false, error };
  }
};