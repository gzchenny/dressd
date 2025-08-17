import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_ITEMS_KEY = 'likedItems';

export const getLikedItemIds = async (): Promise<string[]> => {
  console.log('Getting liked item IDs from AsyncStorage...');
  try {
    const likedItems = await AsyncStorage.getItem(LIKED_ITEMS_KEY);
    const result = likedItems ? JSON.parse(likedItems) : [];
    console.log('Retrieved liked items:', result);
    return result;
  } catch (error) {
    console.error('Error getting liked items:', error);
    return [];
  }
};

export const addToWishlist = async (itemId: string): Promise<void> => {
  console.log(`Adding item ${itemId} to wishlist...`);
  try {
    const likedItems = await getLikedItemIds();
    if (!likedItems.includes(itemId)) {
      const updatedItems = [...likedItems, itemId];
      await AsyncStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(updatedItems));
      console.log(`Successfully added item ${itemId} to wishlist. New list:`, updatedItems);
    } else {
      console.log(`Item ${itemId} already in wishlist`);
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error; // Re-throw to allow calling functions to handle
  }
};

export const removeFromWishlist = async (itemId: string): Promise<void> => {
  console.log(`Removing item ${itemId} from wishlist...`);
  try {
    const likedItems = await getLikedItemIds();
    const updatedItems = likedItems.filter(id => id !== itemId);
    await AsyncStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(updatedItems));
    console.log(`Successfully removed item ${itemId} from wishlist. New list:`, updatedItems);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error; // Re-throw to allow calling functions to handle
  }
};

export const isItemLiked = async (itemId: string): Promise<boolean> => {
  console.log(`Checking if item ${itemId} is liked...`);
  try {
    const likedItems = await getLikedItemIds();
    const result = likedItems.includes(itemId);
    console.log(`Item ${itemId} liked status:`, result);
    return result;
  } catch (error) {
    console.error('Error checking if item is liked:', error);
    return false;
  }
};