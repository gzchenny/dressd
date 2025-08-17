import { auth } from "@/config/firebase";
import {
  createEmbeddingFromAttributes,
  generateItemAttributes,
} from "@/services/attributeGenerator";
import { addItem } from "@/services/itemService";
import { addItemToUser } from "@/services/userService";
import { ItemData } from "@/types/itemAttributes";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRentPrice("");
    setSecurityDeposit("");
    setImageUrl("");
    setImageUri(null);
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to grant gallery permissions to upload images"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        // for demo purposes, we're using the local URI as the imageUrl
        setImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image from gallery");
    }
  };

  useEffect(() => {
    const titleLower = title.toLowerCase();

    if (
      (titleLower.includes("red dress") ||
        (titleLower.includes("red") && titleLower.includes("dress"))) &&
      !imageUri
    ) {
      const redDressUrl =
        "https://t3.ftcdn.net/jpg/01/99/82/42/360_F_199824276_somlbrYKh1XlUnyvLbn3xwjZLlXvEkHx.jpg";
      setImageUrl(redDressUrl);
      setImageUri(redDressUrl);
    } else if (
      (titleLower.includes("blue dress") ||
        (titleLower.includes("blue") && titleLower.includes("dress"))) &&
      !imageUri
    ) {
      const blueDressUrl =
        "https://reluv.com.au/cdn/shop/files/22081650.A_1024x1024.jpg?v=1690094036";
      setImageUrl(blueDressUrl);
      setImageUri(blueDressUrl);
    } else if (
      (titleLower.includes("black hoodie") ||
        (titleLower.includes("black") && titleLower.includes("hoodie"))) &&
      !imageUri
    ) {
      const blackHoodieUrl =
        "https://au.yeti.com/cdn/shop/products/YETI_2H21_M_BFleece_Hoodie_Full_Pullover_Elevated_Black_Back_0340_B_f48d9e84-d1b0-46ca-82a1-2e48b3bdc2ca.png?v=1662717885&width=846";
      setImageUrl(blackHoodieUrl);
      setImageUri(blackHoodieUrl);
    }
  }, [title]);

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

      // generate simple attributes from text
      const attributes = generateItemAttributes(title, description);
      console.log("Generated attributes:", attributes);

      // create simple embedding from attributes (no vision AI needed)
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
        imageUrl,
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

          <View style={styles.section}>
            <Text style={styles.label}>Item Image *</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <Text style={styles.imagePickerButtonText}>
                {imageUri ? "Change Image" : "Select Image from Gallery"}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  onError={() => Alert.alert("Error", "Invalid image")}
                />
              </View>
            )}

            <Text style={styles.helperText}>
              Try titles like "Red Dress", "Blue Dress", or "Black Hoodie" for
              demo
            </Text>
          </View>

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
    backgroundColor: "#FFFFFF",
    color: "#000000",
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
  imagePickerButton: {
    backgroundColor: "#653A79",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  imagePickerButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
