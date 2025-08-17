import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getCartItemCount } from '@/services/cartService';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface RightButtonProps {
  icon: string;
  text?: string;
  onPress: () => void;
}

interface AppBarProps {
  title: string;
  showWishlist?: boolean;
  showCart?: boolean;
  rightButton?: RightButtonProps;
}

export function AppBar({ 
  title, 
  showWishlist = true,
  showCart = true,
  rightButton 
}: AppBarProps) {
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = async () => {
    try {
      const count = await getCartItemCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [])
  );

  const handleWishlist = () => {
    router.push("/(tabs)/wishlist");
  };

  const handleCart = () => {
    router.push("/(tabs)/cart");
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>{title}</ThemedText>
      
      <View style={styles.actions}>
        {showWishlist && (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleWishlist}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="heart" size={24} color="#111" />
          </TouchableOpacity>
        )}
        
        {showCart && (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="bag.fill" size={24} color="#111" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        
        {rightButton && (
          <TouchableOpacity
            style={rightButton.text ? styles.textButton : styles.iconButton}
            onPress={rightButton.onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightButton.text ? (
              <View style={styles.textButtonContent}>
                <IconSymbol name={rightButton.icon as any} size={20} color="#fff" />
                <Text style={styles.textButtonText}>{rightButton.text}</Text>
              </View>
            ) : (
              <IconSymbol name={rightButton.icon as any} size={24} color="#111" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#653A79',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textButton: {
    backgroundColor: '#653A79',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});