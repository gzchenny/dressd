import { db } from '@/config/firebase';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserData {
  userId: string;
  email: string;
  username: string;
  birthday: string;
  location: string;
  trustworthyRating: number;
  activeItems: string[];
  inactiveItems: string[];
  activeRentals: string[];
  inactiveRentals: string[];
  soldItems: string[];
  rentedOutRentals: string[];
  createdAt: string;
  updatedAt: string;
  stylePreferences?: {
    photos: Array<{
      uri: string;
      embedding: number[];
      addedAt: string;
    }>;
    combinedEmbedding?: number[]; // This is the user's style profile embedding
    photoCount: number;
    lastUpdated: string;
  };
}

export interface UserProfile {
  email: string;
  username: string;
  birthday: string;
  location: string;
  stylePreferences?: {
    photos: Array<{
      uri: string;
      embedding: number[];
      addedAt: string;
    }>;
    combinedEmbedding?: number[]; // Optional - only exists when photos are added
    photoCount: number;
    lastUpdated: string;
  };
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
    activeItems: [], 
    inactiveItems: [], 
    activeRentals: [],
    inactiveRentals: [],
    soldItems: [],
    rentedOutRentals: [],
    createdAt: now,
    updatedAt: now,
    // Initialize stylePreferences structure
    stylePreferences: {
      photos: [],
      photoCount: 0,
      lastUpdated: now
      // combinedEmbedding will be added when user adds first photo
    },
    ...userData
  };
  
  await setDoc(userRef, defaultUserData);
  return defaultUserData;
};

export const updateUserPreferences = async (
  userId: string, 
  preferences: any // Use any to allow optional combinedEmbedding
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  // Clean the preferences object to remove undefined values
  const cleanPreferences = Object.fromEntries(
    Object.entries(preferences).filter(([_, value]) => value !== undefined)
  );
  
  await updateDoc(userRef, {
    stylePreferences: cleanPreferences,
    updatedAt: new Date().toISOString()
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserProfile;
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