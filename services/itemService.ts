import { db } from '@/config/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

export interface ItemData {
  id?: string;
  title: string;
  description: string;
  type: 'rent'; // Only rent now
  rentPrice: number; // Required now
  securityDeposit: number; // New required field
  ownerId: string;
  ownerUsername: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  imageUrl?: string;
  // Future fields for characteristics
  // characteristics?: Record<string, any>;
  brand?: string;
  originalRetail?: number;
  liked?: boolean;
}

export const addItem = async (itemData: Omit<ItemData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = new Date().toISOString();
  
  const newItem: Omit<ItemData, 'id'> = {
    ...itemData,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(collection(db, 'items'), newItem);
  return docRef.id;
};

export const getUserItems = async (userId: string): Promise<ItemData[]> => {
  const q = query(collection(db, 'items'), where('ownerId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ItemData));
};

export const getAllActiveItems = async (): Promise<ItemData[]> => {
  const q = query(collection(db, 'items'), where('isActive', '==', true));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ItemData));
};

export const updateItem = async (itemId: string, updates: Partial<ItemData>) => {
  const itemRef = doc(db, 'items', itemId);
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await updateDoc(itemRef, updatedData);
};

export const deleteItem = async (itemId: string) => {
  await deleteDoc(doc(db, 'items', itemId));
};