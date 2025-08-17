import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_ITEMS_KEY = 'cartItems';

export interface CartItem {
  itemId: string;
  title: string;
  imageUrl?: string;
  ownerUsername: string;
  rentPrice: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  addedAt: string;
}

export const getCartItems = async (): Promise<CartItem[]> => {
  console.log('Getting cart items from AsyncStorage...');
  try {
    const cartItems = await AsyncStorage.getItem(CART_ITEMS_KEY);
    const result = cartItems ? JSON.parse(cartItems) : [];
    console.log('Retrieved cart items:', result);
    return result;
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

export const addToCart = async (item: CartItem): Promise<void> => {
  console.log(`Adding item ${item.itemId} to cart...`);
  try {
    const cartItems = await getCartItems();
    
    // Check if item with same dates already exists
    const existingIndex = cartItems.findIndex(
      cartItem => cartItem.itemId === item.itemId && 
                  cartItem.startDate === item.startDate && 
                  cartItem.endDate === item.endDate
    );

    if (existingIndex >= 0) {
      // Update existing item
      cartItems[existingIndex] = item;
      console.log(`Updated existing cart item`);
    } else {
      // Add new item
      cartItems.push(item);
      console.log(`Added new item to cart`);
    }

    await AsyncStorage.setItem(CART_ITEMS_KEY, JSON.stringify(cartItems));
    console.log(`Cart updated successfully`);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (itemId: string, startDate: string): Promise<void> => {
  console.log(`Removing item ${itemId} from cart...`);
  try {
    const cartItems = await getCartItems();
    const updatedItems = cartItems.filter(
      item => !(item.itemId === itemId && item.startDate === startDate)
    );
    await AsyncStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedItems));
    console.log(`Successfully removed item from cart`);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CART_ITEMS_KEY);
    console.log('Cart cleared successfully');
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const getCartItemCount = async (): Promise<number> => {
  try {
    const cartItems = await getCartItems();
    return cartItems.length;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

export const getCartTotal = async (): Promise<{ subtotal: number; securityDeposits: number; total: number }> => {
  try {
    const cartItems = await getCartItems();
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const securityDeposits = cartItems.reduce((sum, item) => sum + item.securityDeposit, 0);
    const total = subtotal + securityDeposits;
    
    return { subtotal, securityDeposits, total };
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return { subtotal: 0, securityDeposits: 0, total: 0 };
  }
};