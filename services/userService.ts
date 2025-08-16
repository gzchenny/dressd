import { db } from '@/config/firebase';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserData {
  userId: string;
  email: string;
  username: string;
  birthday: string;
  location: string;
  trustworthyRating: number;
  activeItems: string[]; // Items available for rent/sale
  inactiveItems: string[]; // Items being cleaned, rented out, etc.
  activeRentals: string[]; // Items user is currently renting from others
  inactiveRentals: string[]; // Past rentals
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
    activeItems: [], // Changed from activeRentals
    inactiveItems: [], // New field
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

// Helper functions to manage item states
export const addItemToUser = async (userId: string, itemId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    activeItems: arrayUnion(itemId),
    updatedAt: new Date().toISOString()
  });
};

export const moveItemToInactive = async (userId: string, itemId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    activeItems: arrayRemove(itemId),
    inactiveItems: arrayUnion(itemId),
    updatedAt: new Date().toISOString()
  });
};

export const moveItemToActive = async (userId: string, itemId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    inactiveItems: arrayRemove(itemId),
    activeItems: arrayUnion(itemId),
    updatedAt: new Date().toISOString()
  });
};