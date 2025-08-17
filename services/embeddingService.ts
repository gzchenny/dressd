// Simple embedding service - in production you'd use a proper ML model

export const generateEmbeddingFromPhotos = async (photoUris: string[]): Promise<number[]> => {
  // For now, generate a mock embedding
  // In production, you'd analyze the photos using ML and generate real embeddings
  console.log(`Generating embedding from ${photoUris.length} photos`);
  
  // Generate a consistent but pseudo-random embedding based on photo URIs
  const embedding = [];
  const baseHash = photoUris.join('').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  for (let i = 0; i < 512; i++) {
    // Use the hash to generate consistent but varied values
    const seed = (baseHash + i) * 9301 + 49297;
    const value = (seed % 233280) / 233280.0;
    embedding.push((value - 0.5) * 2); // Normalize to [-1, 1]
  }
  
  return embedding;
};

export const calculateSimilarity = (userEmbedding: number[], itemEmbedding: number[]): number => {
  if (!userEmbedding || !itemEmbedding || userEmbedding.length === 0 || itemEmbedding.length === 0) {
    return 0;
  }

  // Ensure both vectors have the same length
  if (userEmbedding.length !== itemEmbedding.length) {
    console.warn('Embedding vectors have different lengths:', userEmbedding.length, 'vs', itemEmbedding.length);
    return 0;
  }

  // Calculate cosine similarity
  const dotProduct = userEmbedding.reduce((sum, a, i) => sum + a * itemEmbedding[i], 0);
  const magnitudeA = Math.sqrt(userEmbedding.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(itemEmbedding.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  return Math.max(0, Math.min(1, similarity)); // Clamp between 0 and 1
};

export const calculateCosineSimilarity = calculateSimilarity; // Alias for consistency