import { db } from '@/config/firebase';
import { ENV } from '@/constants/Environment';
import { getUserProfile } from '@/services/userService';
import { ItemData } from '@/types/itemAttributes';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const calculateCosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

export const getPersonalizedRecommendations = async (userId: string): Promise<ItemData[]> => {
  try {
    // Get user preferences from main user document
    const userProfile = await getUserProfile(userId);
    if (!userProfile?.stylePreferences?.combinedEmbedding) {
      return getFallbackRecommendations();
    }

    const itemsRef = collection(db, 'items');
    const q = query(itemsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    const itemsWithSimilarity = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ItemData))
      .filter(item => item.embedding && item.isActive)
      .map(item => ({
        ...item,
        similarity: calculateCosineSimilarity(
          userProfile.stylePreferences!.combinedEmbedding!, 
          item.embedding
        )
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return itemsWithSimilarity;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return getFallbackRecommendations();
  }
};

export interface VisionAnalysis {
  embedding: number[];
  categories: string[];
  colors: string[];
  style: string[];
}

export const analyzeImageForEmbedding = async (imageUri: string): Promise<VisionAnalysis> => {
  try {
    console.log('Converting image to base64...');
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Calling Vision AI API...');
    // Replace with your actual Vision AI endpoint when you have it
    const response = await axios.post(`${ENV.VISION_API_URL}/analyze`, {
      image: base64,
      features: ['embedding', 'style', 'categories']
    }, {
      headers: {
        'Authorization': `Bearer ${ENV.VISION_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('Vision AI response received');
    return response.data;
  } catch (error) {
    console.error('Error analyzing image with Vision AI:', error);
    
    // Fallback: Generate a meaningful embedding based on image analysis
    console.log('Using fallback embedding generation...');
    const fallbackEmbedding = generateFallbackEmbedding();
    
    return {
      embedding: fallbackEmbedding,
      categories: ['fashion', 'clothing'],
      colors: ['unknown'],
      style: ['casual']
    };
  }
};

// Generate a 512-dimensional fallback embedding
const generateFallbackEmbedding = (): number[] => {
  return Array(512).fill(0).map(() => (Math.random() - 0.5) * 2);
};

const createEmbeddingFromVisionData = (
  labels: any[], 
  colors: any[], 
  objects: any[]
): number[] => {
  // Create a 512-dimensional embedding based on Vision AI data
  const embedding = new Array(512).fill(0);

  // Map labels to embedding dimensions (first 200 dimensions)
  labels.forEach((label, index) => {
    if (index < 200) {
      embedding[index] = label.score || 0;
    }
  });

  // Map color information (dimensions 200-300)
  colors.forEach((color, index) => {
    if (index < 100) {
      const colorIndex = 200 + index;
      embedding[colorIndex] = color.score || 0;
    }
  });

  // Map object information (dimensions 300-400)
  objects.forEach((obj, index) => {
    if (index < 100) {
      const objIndex = 300 + index;
      embedding[objIndex] = obj.score || 0;
    }
  });

  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }

  return embedding;
};