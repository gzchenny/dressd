import { db } from '@/config/firebase';
import { ItemData } from '@/types/itemAttributes';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { createEmbeddingFromAttributes, generateItemAttributes } from './attributeGenerator'; // Updated import

export const addItem = async (itemData: Omit<ItemData, 'id'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    
    // If embedding and attributes aren't provided, generate them
    let attributes = itemData.attributes;
    let embedding = itemData.embedding;
    
    if (!attributes) {
      attributes = generateItemAttributes(itemData.title, itemData.description);
    }
    
    if (!embedding || embedding.length === 0) {
      embedding = createEmbeddingFromAttributes(attributes, itemData.title, itemData.description);
    }
    
    // Add item to items collection
    const itemsRef = collection(db, 'items');
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      attributes,
      embedding,
      createdAt: itemData.createdAt || now,
      updatedAt: itemData.updatedAt || now,
    });
    
    console.log('Item created with ID:', docRef.id);
    return docRef.id;
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