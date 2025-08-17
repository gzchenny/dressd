import { auth } from '@/config/firebase';
import { getUserProfile, updateUserPreferences } from '@/services/userService';

export interface UserPreferences {
  photos: Array<{
    uri: string;
    embedding: number[];
    addedAt: string;
  }>;
  photoCount: number;
  embedding?: number[];
  lastUpdated: string;
}

export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userProfile = await getUserProfile(user.uid);
  
  if (!userProfile?.stylePreferences) {
    return {
      photos: [],
      photoCount: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  return {
    photos: userProfile.stylePreferences.photos || [],
    photoCount: userProfile.stylePreferences.photoCount || 0,
    embedding: userProfile.stylePreferences.combinedEmbedding,
    lastUpdated: userProfile.stylePreferences.lastUpdated || new Date().toISOString()
  };
};

export const addPreferencePhoto = async (imageUri: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // For now, just create a simple embedding
  // Later you can integrate with Vision AI
  const mockEmbedding = Array(512).fill(0).map(() => Math.random());

  const currentPrefs = await getUserPreferences();
  
  const newPhoto = {
    uri: imageUri,
    embedding: mockEmbedding,
    addedAt: new Date().toISOString(),
  };

  const updatedPhotos = [...(currentPrefs?.photos || []), newPhoto];

  // Calculate combined embedding (average of all photo embeddings)
  const combinedEmbedding = calculateAverageEmbedding(
    updatedPhotos.map(photo => photo.embedding)
  );

  const updatedPreferences = {
    photos: updatedPhotos,
    photoCount: updatedPhotos.length,
    combinedEmbedding,
    lastUpdated: new Date().toISOString(),
  };

  await updateUserPreferences(user.uid, updatedPreferences);
};

export const removePreferencePhoto = async (index: number): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const currentPrefs = await getUserPreferences();
  if (!currentPrefs) return;

  const updatedPhotos = currentPrefs.photos.filter((_, i) => i !== index);

  const combinedEmbedding = updatedPhotos.length > 0 
    ? calculateAverageEmbedding(updatedPhotos.map(photo => photo.embedding))
    : undefined;

  const updatedPreferences = {
    photos: updatedPhotos,
    photoCount: updatedPhotos.length,
    combinedEmbedding,
    lastUpdated: new Date().toISOString(),
  };

  await updateUserPreferences(user.uid, updatedPreferences);
};

const calculateAverageEmbedding = (embeddings: number[][]): number[] => {
  if (embeddings.length === 0) return [];

  const avgEmbedding = new Array(embeddings[0].length).fill(0);

  embeddings.forEach(embedding => {
    embedding.forEach((value, index) => {
      avgEmbedding[index] += value;
    });
  });

  return avgEmbedding.map(sum => sum / embeddings.length);
};