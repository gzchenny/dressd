import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const storage = getStorage();

export const uploadImage = async (imageUri: string, userId: string): Promise<string> => {
  try {
    console.log('Starting image upload...');
    
    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create unique filename
    const timestamp = Date.now();
    const filename = `items/${userId}/${timestamp}.jpg`;
    
    // Create storage reference
    const storageRef = ref(storage, filename);
    
    // Upload the file
    console.log('Uploading to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Image uploaded successfully:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};