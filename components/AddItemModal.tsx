import { auth } from "@/config/firebase";
import {
  createEmbeddingFromAttributes,
  generateItemAttributes,
} from "@/services/attributeGenerator"; // Add createEmbeddingFromAttributes
import { addItem } from "@/services/itemService";
import { addItemToUser } from "@/services/userService";
import { ItemData } from "@/types/itemAttributes";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

export default function AddItemModal({
  visible,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [imageUrl, setImageUrl] = useState<string>(""); // Changed from imageUri to imageUrl
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRentPrice("");
    setSecurityDeposit("");
    setImageUrl(""); // Reset URL
  };

  const handleSubmit = async () => {
    if (!title || !description || !rentPrice || !securityDeposit || !imageUrl) {
      Alert.alert("Error", "Please fill in all fields including image URL");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add items");
      return;
    }

    setLoading(true);

    try {
      console.log("Starting item creation...");

      // Generate simple attributes from text
      const attributes = generateItemAttributes(title, description);
      console.log("Generated attributes:", attributes);

      // Create simple embedding from attributes (no Vision AI needed)
      const embedding = createEmbeddingFromAttributes(
        attributes,
        title,
        description
      );
      console.log("Generated embedding length:", embedding.length);

      const itemData: Omit<ItemData, "id"> = {
        title,
        description,
        rentPrice: parseFloat(rentPrice),
        securityDeposit: parseFloat(securityDeposit),
        imageUrl, // Use the URL directly
        embedding,
        attributes,
        ownerId: user.uid,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAvailable: true,
        tags: [],
        condition: "good",
        category: attributes.categories[0] || "clothing",
        size: attributes.sizes[0] || "M",
        brand: attributes.brands[0] || "Unknown",
        color: attributes.colors[0] || "Unknown",
      };

      console.log("Creating item...");
      const itemId = await addItem(itemData);

      console.log("Adding item to user...");
      await addItemToUser(user.uid, itemId);

      Alert.alert("Success", "Item added successfully!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            onClose();
            onItemAdded();
          },
        },
      ]);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", "Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Item</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text style={[styles.saveButton, loading && { opacity: 0.5 }]}>
              {loading ? "Adding..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter item title"
              placeholderTextColor="#999"
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Image URL Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Image URL *</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helperText}>
              Paste a URL to an image of your item
            </Text>

            {/* Preview image if URL is provided */}
            {imageUrl && (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.previewImage}
                  onError={() => Alert.alert("Error", "Invalid image URL")}
                />
              </View>
            )}
          </View>

          {/* Rent Price Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Rent Price (per day) *</Text>
            <TextInput
              style={styles.input}
              value={rentPrice}
              onChangeText={setRentPrice}
              placeholder="25.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Security Deposit Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Security Deposit *</Text>
            <TextInput
              style={styles.input}
              value={securityDeposit}
              onChangeText={setSecurityDeposit}
              placeholder="100.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    color: "#666",
    fontSize: 16,
  },
  saveButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    // Force white background and dark text:
    backgroundColor: "#FFFFFF",
    color: "#000000",
    // Additional iOS fixes:
    textAlign: "left",
    textAlignVertical: "center",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  imagePreview: {
    marginTop: 12,
    alignItems: "center",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
});
