import { Image } from "expo-image";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
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
import { addToWishlist, removeFromWishlist, getLikedItemIds } from "@/services/wishlistService";
import { router } from "expo-router";
import { AppBar } from "@/components/AppBar";

const { width } = Dimensions.get("window");
const cardWidth = width * 0.45; // Reduced from 0.72 to 0.45 to fit ~2.5 cards
const gridItemWidth = (width - 20) / 2; // 2 columns with padding

export default function HomeScreen() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const loadItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const allItems = await getAllActiveItems();
      const likedItemIds = await getLikedItemIds(); // Get persisted liked items
      
      // Transform items to include mock data for enhanced UI
      const enhancedItems = allItems.map(item => ({
        ...item,
        brand: item.ownerUsername || "Designer",
        originalRetail: item.rentPrice ? item.rentPrice * 5 : undefined,
        liked: likedItemIds.includes(item.id || ""), // Use the array from AsyncStorage directly,
      }));
      
      setItems(enhancedItems);
      setLikedItems(new Set(likedItemIds)); // Update the Set state with persisted data
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Add focus effect to refresh data when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, refreshing items...');
      loadItems();
    }, [])
  );

  const handleToggleLike = async (id: string, liked: boolean) => {
    console.log(`Toggling like for item ${id}: ${liked}`);
    
    try {
      const newLikedItems = new Set(likedItems);
    
      if (liked) {
        newLikedItems.add(id);
        await addToWishlist(id);
        console.log(`Successfully added item ${id} to wishlist`);
      } else {
        newLikedItems.delete(id);
        await removeFromWishlist(id);
        console.log(`Successfully removed item ${id} from wishlist`);
      }
    
      // Update state immediately for instant UI feedback
      setLikedItems(newLikedItems);
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, liked } : item
        )
      );
    } catch (error) {
      console.error(`Error toggling like for item ${id}:`, error);
      // Revert UI state on error
      loadItems();
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search filtering
  };

  const handleItemPress = (id: string) => {
    console.log("Item pressed:", id);
    // TODO: Navigate to item details
  };

  const handleWishlist = () => {
    console.log("Navigate to wishlist");
    router.push("/(tabs)/wishlist");
  };

  const handleCart = () => {
    console.log("Navigate to cart");
    // TODO: Navigate to cart
  };

  const handleShowTrending = () => {
    console.log("Show more trending items");
    // TODO: Navigate to trending page
  };

  // Split items for different sections
  const personalizedItems = items.slice(0, 8);
  const trendingItems = items.slice(0, 6);

  const renderPersonalizedItem = ({ item }: { item: ItemData }) => (
    <ProductCard
      id={item.id || ""}
      imageUrl={item.imageUrl}
      brand={item.brand || "Designer"}
      name={item.title}
      priceFrom={item.rentPrice}
      withMembershipFrom={0}
      originalRetail={item.originalRetail}
      liked={item.liked || false}
      onPress={handleItemPress}
      onToggleLike={handleToggleLike}
      style={{ width: cardWidth, marginRight: 4 }} // Reduced marginRight from 12 to 8
    />
  );

  const renderTrendingItem = ({ item }: { item: ItemData }) => (
    <ProductCard
      id={item.id || ""}
      imageUrl={item.imageUrl}
      brand={item.brand || "Designer"}
      name={item.title}
      priceFrom={item.rentPrice}
      originalRetail={item.originalRetail}
      liked={item.liked || false}
      onPress={handleItemPress}
      onToggleLike={handleToggleLike}
      style={{ width: gridItemWidth }}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AppBar title="dressd" />
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppBar title="dressd" />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#555" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dresses, designers, sizes"
            placeholderTextColor="#555"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadItems(true)} />
        }
        contentContainerStyle={{ paddingBottom: 48 }} // Add this line
        ListHeaderComponent={
          <View>
            {/* For You Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>For you</Text>
              </View>
              <FlatList
                data={personalizedItems}
                renderItem={renderPersonalizedItem}
                keyExtractor={(item) => item.id || ""}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + 4}
                decelerationRate="fast"
                contentContainerStyle={styles.horizontalList}
              />            
            </View>
            {/* Trending Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending</Text>
                <TouchableOpacity onPress={handleShowTrending}>
                  <Text style={styles.moreButton}>More</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={trendingItems}
                renderItem={renderTrendingItem}
                keyExtractor={(item) => item.id || ""}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.grid}
              />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    // Remove borderRadius to make it a complete rectangle
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    backgroundColor: 'transparent', // Fix yellow background issue
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  moreButton: {
    fontSize: 16,
    color: '#111',
    textDecorationLine: 'underline',
  },
  horizontalList: {
    paddingLeft: 1,
  },
  grid: {
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 8, // Reduced gap between rows
    paddingHorizontal: 8, // Add horizontal padding for grid items
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});