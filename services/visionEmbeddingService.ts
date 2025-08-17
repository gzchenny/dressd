import { ENV } from '@/constants/Environment';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

export interface VisionAnalysis {
  labels: Array<{
    description: string;
    score: number;
  }>;
  colors: Array<{
    color: { red: number; green: number; blue: number };
    score: number;
  }>;
  embedding: number[];
}

export const analyzeImageForEmbedding = async (imageUri: string): Promise<VisionAnalysis> => {
  const apiKey = ENV.GOOGLE_CLOUD_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Cloud API key is not configured');
  }

  const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  try {
    const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const requestData = {
      requests: [
        {
          image: {
            content: base64ImageData,
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'IMAGE_PROPERTIES', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
          ],
        },
      ],
    };

    const response = await axios.post(apiURL, requestData);
    const result = response.data.responses[0];

    // Extract labels and convert to embedding
    const labels = result.labelAnnotations || [];
    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const objects = result.localizedObjectAnnotations || [];

    // Create a consistent embedding from Vision AI features
    const embedding = createEmbeddingFromVisionData(labels, colors, objects);

    return {
      labels: labels.map((label: any) => ({
        description: label.description,
        score: label.score
      })),
      colors: colors.map((color: any) => ({
        color: color.color,
        score: color.score
      })),
      embedding
    };

  } catch (error: any) {
    console.error('Error analyzing image with Vision AI:', error);
    throw error;
  }
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

export const calculateAverageEmbedding = (embeddings: number[][]): number[] => {
  if (embeddings.length === 0) return [];
  
  const avgEmbedding = new Array(embeddings[0].length).fill(0);
  
  embeddings.forEach(embedding => {
    embedding.forEach((value, index) => {
      avgEmbedding[index] += value;
    });
  });
  
  return avgEmbedding.map(sum => sum / embeddings.length);
};