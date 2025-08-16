import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserData {
  userId: string;
  email: string;
  username: string;
  birthday: string;
  location: string;
  trustworthyRating: number;
  activeRentals: string[];
  inactiveRentals: string[];
  soldItems: string[];
  rentedOutRentals: string[];
  createdAt: string;
  updatedAt: string;
}

export const createUserProfile = async (userId: string, userData: Partial<UserData>) => {
  const userRef = doc(db, 'users', userId);
  const now = new Date().toISOString();
  
  const defaultUserData: UserData = {
    userId,
    email: userData.email || '',
    username: userData.username || '',
    birthday: userData.birthday || '',
    location: userData.location || '',
    trustworthyRating: 5.0,
    activeRentals: [],
    inactiveRentals: [],
    soldItems: [],
    rentedOutRentals: [],
    createdAt: now,
    updatedAt: now,
    ...userData
  };
  
  await setDoc(userRef, defaultUserData);
  return defaultUserData;
};

export const getUserProfile = async (userId: string): Promise<UserData | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserData>) => {
  const userRef = doc(db, 'users', userId);
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await updateDoc(userRef, updatedData);
};