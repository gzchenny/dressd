import { db } from '@/config/firebase';
import { ItemData } from '@/types/itemAttributes'; // Import from types
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { flattenAttributes, generateItemAttributes } from './attributeGenerator';

// Remove the export { ItemData } if it exists, since it's now imported from types

export const addItem = async (itemData: Omit<ItemData, 'id' | 'createdAt' | 'updatedAt' | 'attributes' | 'embedding'>): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    // Generate attributes based on title and description
    const attributes = generateItemAttributes(itemData.title, itemData.description);
    
    // Create embedding vector
    const embedding = flattenAttributes(attributes);
    
    // Add item to items collection with attributes included
    const itemsRef = collection(db, 'items');
    await addDoc(itemsRef, {
      ...itemData,
      attributes,
      embedding,
      createdAt: now,
      updatedAt: now,
    });
    
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
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

export const getItemById = async (itemId: string): Promise<ItemData | null> => {
  try {
    const itemRef = doc(db, 'items', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (itemDoc.exists()) {
      return { id: itemDoc.id, ...itemDoc.data() } as ItemData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;
  }
};