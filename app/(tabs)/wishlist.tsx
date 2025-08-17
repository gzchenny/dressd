import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { ProductCard } from "@/components/ProductCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { getAllActiveItems, ItemData } from "@/services/itemService";
import { getLikedItemIds, removeFromWishlist } from "@/services/wishlistService";

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist items from AsyncStorage or your preferred storage
  const loadWishlistItems = async () => {
    console.log('Loading wishlist items...');
    try {
      // Get liked item IDs from storage (we'll implement this)
      const likedItemIds = await getLikedItemIds();
      console.log('Found liked item IDs:', likedItemIds);
      
      // Get all active items
      const allItems = await getAllActiveItems();
      
      // Filter items that are in wishlist
      const wishlistItems = allItems.filter(item => 
        likedItemIds.includes(item.id || "")
      ).map(item => ({
        ...item,
        brand: item.ownerUsername || "Designer",
        originalRetail: item.rentPrice ? item.rentPrice * 5 : undefined,
        liked: true,
      }));
      
      console.log(`Loaded ${wishlistItems.length} wishlist items`);
      setWishlistItems(wishlistItems);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlistItems();
  }, []);

  // Add focus effect to refresh data when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      console.log('Wishlist screen focused, refreshing items...');
      loadWishlistItems();
    }, [])
  );

  const handleItemPress = (id: string) => {
    console.log("Wishlist item pressed:", id);
    // TODO: Navigate to item details
  };

  const handleRemoveFromWishlist = async (id: string) => {
    console.log(`Removing item ${id} from wishlist`);
    
    try {
      // Remove from wishlist storage first
      await removeFromWishlist(id);
      console.log(`Successfully removed item ${id} from wishlist storage`);
      
      // Update local state immediately for instant UI feedback
      setWishlistItems(prevItems => 
        prevItems.filter(item => item.id !== id)
      );
    } catch (error) {
      console.error(`Error removing item ${id} from wishlist:`, error);
      // Reload data on error to ensure consistency
      loadWishlistItems();
    }
  };

  const renderWishlistItem = ({ item }: { item: ItemData }) => (
    <ProductCard
      id={item.id || ""}
      imageUrl={item.imageUrl}
      brand={item.brand || "Designer"}
      name={item.title}
      priceFrom={item.rentPrice}
      originalRetail={item.originalRetail}
      liked={true}
      onPress={handleItemPress}
      onToggleLike={(id, liked) => !liked && handleRemoveFromWishlist(id)}
      style={styles.card}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Wishlist</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Wishlist</ThemedText>
        <Text style={styles.itemCount}>{wishlistItems.length} items</Text>
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="heart" size={64} color="#ccc" />
          <ThemedText style={styles.emptyTitle}>Your wishlist is empty</ThemedText>
          <Text style={styles.emptyText}>
            Heart items you love to save them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id || ""}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#653A79',
  },
  itemCount: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
