import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import { AppBar } from '@/components/AppBar';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { 
  getCartItems, 
  removeFromCart, 
  getCartTotal, 
  CartItem 
} from '@/services/cartService';
import { formatPrice } from '@/utils/money';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ 
    subtotal: 0, 
    securityDeposits: 0, 
    total: 0 
  });

  const loadCartItems = async () => {
    console.log('Loading cart items...');
    try {
      const items = await getCartItems();
      const cartTotals = await getCartTotal();
      
      setCartItems(items);
      setTotals(cartTotals);
      console.log(`Loaded ${items.length} cart items`);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Cart screen focused, refreshing items...');
      loadCartItems();
    }, [])
  );

  const handleRemoveItem = async (itemId: string, startDate: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(itemId, startDate);
              await loadCartItems();
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item from cart');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add some items to your cart first!');
      return;
    }

    router.push('/checkout' as any);
  };

  const handleContinueShopping = () => {
    router.push('/(tabs)/home');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImage}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>
              {item.title.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemOwner}>by @{item.ownerUsername}</Text>
        
        <View style={styles.dateRange}>
          <Text style={styles.dateText}>
            {item.startDate} to {item.endDate}
          </Text>
          <Text style={styles.daysText}>
            {item.totalDays} day{item.totalDays !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.pricing}>
          <Text style={styles.rentPrice}>
            {formatPrice(item.rentPrice)}/day × {item.totalDays} = {formatPrice(item.totalPrice)}
          </Text>
          <Text style={styles.securityText}>
            Security: {formatPrice(item.securityDeposit)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.itemId, item.startDate)}
      >
        <IconSymbol name="xmark" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AppBar title="Cart" showWishlist={false} />
        <View style={styles.loadingContainer}>
          <Text>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppBar title="Cart" showWishlist={false} />

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="bag.fill" size={64} color="#ccc" />
          <ThemedText style={styles.emptyTitle}>Your cart is empty</ThemedText>
          <Text style={styles.emptyText}>
            Add some items to rent and they'll appear here
          </Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => `${item.itemId}-${item.startDate}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rental Total:</Text>
              <Text style={styles.summaryValue}>{formatPrice(totals.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Security Deposits:</Text>
              <Text style={styles.summaryValue}>{formatPrice(totals.securityDeposits)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#653A79',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  itemOwner: {
    fontSize: 14,
    color: '#653A79',
    marginBottom: 8,
  },
  dateRange: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  daysText: {
    fontSize: 12,
    color: '#666',
  },
  pricing: {
    gap: 2,
  },
  rentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  securityText: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#653A79',
  },
  checkoutButton: {
    backgroundColor: '#653A79',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});