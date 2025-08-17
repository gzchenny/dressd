import { db } from '@/config/firebase';
import { ItemData } from '@/types/itemAttributes';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export const calculateCosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

export const getPersonalizedRecommendations = async (userEmbedding: number[]): Promise<ItemData[]> => {
  try {
    const itemsRef = collection(db, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const itemsWithSimilarity = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ItemData))
      .filter(item => item.embedding && item.isActive) // Only active items with embeddings
      .map(item => ({
        ...item,
        similarity: calculateCosineSimilarity(userEmbedding, item.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return itemsWithSimilarity;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};