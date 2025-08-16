import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AddItemModal from "@/components/AddItemModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { auth } from "@/config/firebase";
import { getUserItems, ItemData, updateItem } from "@/services/itemService";
import { moveItemToActive, moveItemToInactive } from "@/services/userService";

const { width } = Dimensions.get("window");
const itemWidth = (width - 60) / 2;

export default function ItemsScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userItems = await getUserItems(user.uid);
        setItems(userItems);
      }
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleItemAdded = () => {
    loadItems(); // Refresh the list
  };

  const toggleItemStatus = async (item: ItemData) => {
    if (!item.id) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const newStatus = !item.isActive;

      // Update item status in Firestore
      await updateItem(item.id, { isActive: newStatus });

      // Update user's active/inactive items arrays
      if (newStatus) {
        await moveItemToActive(user.uid, item.id);
      } else {
        await moveItemToInactive(user.uid, item.id);
      }

      // Refresh the list
      loadItems();

      Alert.alert(
        "Status Updated",
        `Item ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating item status:", error);
      Alert.alert("Error", "Failed to update item status");
    }
  };

  const renderItem = (item: ItemData, index: number) => (
    <View key={item.id || index} style={styles.itemCard}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          contentFit="cover"
          placeholder={{ blurhash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6." }}
        />
      ) : (
        <View style={[styles.itemImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusTag,
              { backgroundColor: item.isActive ? "#28a745" : "#dc3545" },
            ]}
          >
            <Text style={styles.statusTagText}>
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>
            {item.type === "both"
              ? "Rent & Buy"
              : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          {item.rentPrice && (
            <Text style={styles.priceText}>Rent: ${item.rentPrice}</Text>
          )}
          {item.buyPrice && (
            <Text style={styles.priceText}>Buy: ${item.buyPrice}</Text>
          )}
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.dateText}>
            Added: {new Date(item.createdAt).toLocaleDateString()}
          </Text>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => toggleItemStatus(item)}
          >
            <Text style={styles.toggleButtonText}>
              {item.isActive ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Items</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <IconSymbol name="house.fill" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {items.filter((item) => item.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {items.filter((item) => !item.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{items.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadItems} />
        }
      >
        {items.length > 0 ? (
          <View style={styles.itemsGrid}>
            {items.map((item, index) => renderItem(item, index))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText>
              No items yet. Add your first item to start renting!
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onItemAdded={handleItemAdded}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemCard: {
    width: itemWidth,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
  },
  itemContent: {
    padding: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 16,
  },
  typeTag: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  typeTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#28a745",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 10,
    color: "#999",
    flex: 1,
  },
  toggleButton: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});
