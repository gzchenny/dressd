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
import { AppBar } from "@/components/AppBar";

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

  // grab all the wishlist items and match them with active items
  const loadWishlistItems = async () => {
    console.log('Loading wishlist items...');
    try {
      const likedItemIds = await getLikedItemIds();
      console.log('Found liked item IDs:', likedItemIds);
      
      const allItems = await getAllActiveItems();
      
      // filter and enhance the items for display
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

  // refresh when user navigates back to this screen
  useFocusEffect(
    useCallback(() => {
      console.log('Wishlist screen focused, refreshing items...');
      loadWishlistItems();
    }, [])
  );

  const handleItemPress = (id: string) => {
    console.log("Wishlist item pressed:", id);
  };

  // remove item from wishlist and update local state
  const handleRemoveFromWishlist = async (id: string) => {
    console.log(`Removing item ${id} from wishlist`);
    
    try {
      await removeFromWishlist(id);
      console.log(`Successfully removed item ${id} from wishlist storage`);
      
      // update local state immediatly for better UX
      setWishlistItems(prevItems => 
        prevItems.filter(item => item.id !== id)
      );
    } catch (error) {
      console.error(`Error removing item ${id} from wishlist:`, error);
      // fallback to full reload if something goes wrong
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
        <AppBar title="Wishlist" />
        <View style={styles.loadingContainer}>
          <Text>Loading wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppBar title="Wishlist" />
      
      <View style={styles.header}>
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
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
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
