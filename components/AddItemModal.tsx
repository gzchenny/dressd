import { auth } from "@/config/firebase";
import { addItem } from "@/services/itemService";
import { getUserProfile } from "@/services/userService";
import { ItemData } from "@/types/itemAttributes"; // Import from types instead
import * as ImagePicker from "expo-image-picker";
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRentPrice("");
    setSecurityDeposit("");
    setImageUri(null);
    // Force a small delay to let iOS clear autofill state
    setTimeout(() => {
      console.log("Form reset completed");
    }, 100);
  };

  const pickImage = async () => {
    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4], // Good aspect ratio for clothing items
      quality: 0.7, // Compress to reduce file size
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission to access camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera is required!"
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert("Select Image", "Choose how you want to add an image", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    console.log("Submit button pressed");

    if (!title.trim() || !description.trim()) {
      console.log("Validation failed: title or description empty");
      Alert.alert("Error", "Please fill in title and description");
      return;
    }

    if (!rentPrice || parseFloat(rentPrice) <= 0) {
      console.log("Validation failed: rent price missing or invalid");
      Alert.alert("Error", "Please enter a valid rent price");
      return;
    }

    if (!securityDeposit || parseFloat(securityDeposit) <= 0) {
      console.log("Validation failed: security deposit missing or invalid");
      Alert.alert("Error", "Please enter a valid security deposit");
      return;
    }

    console.log("Starting item creation...");
    setLoading(true);
    try {
      const user = auth.currentUser;
      console.log("Current user:", user?.uid);

      if (!user) {
        console.log("No user logged in");
        Alert.alert("Error", "You must be logged in to add items");
        return;
      }

      const userProfile = await getUserProfile(user.uid);
      console.log("User profile:", userProfile);

      if (!userProfile) {
        console.log("No user profile found");
        Alert.alert("Error", "User profile not found");
        return;
      }

      // Note: attributes and embedding will be generated automatically in addItem
      const itemData: Omit<
        ItemData,
        "id" | "createdAt" | "updatedAt" | "attributes" | "embedding"
      > = {
        title: title.trim(),
        description: description.trim(),
        rentPrice: parseFloat(rentPrice),
        securityDeposit: parseFloat(securityDeposit),
        ownerId: user.uid,
        ownerUsername: userProfile.username,
        isActive: true,
        imageUrl: imageUri || undefined,
      };

      console.log("Item data:", itemData);

      // Add item to Firestore (attributes and embedding will be generated automatically)
      await addItem(itemData);
      console.log("Item created");

      Alert.alert("Success", "Item added successfully!");
      resetForm();
      onItemAdded();
      onClose();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", error.message);
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
          <Text style={styles.title}>Add Item for Rent</Text>
          <TouchableOpacity
            onPress={() => {
              console.log("Button touched!");
              handleSubmit();
            }}
            disabled={loading}
          >
            <Text style={[styles.saveButton, { opacity: loading ? 0.6 : 1 }]}>
              {loading ? "Adding..." : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Designer Evening Dress"
              maxLength={100}
              // Comprehensive iOS autofill prevention:
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              textContentType="none"
              passwordRules=""
              keyboardType="default"
              // Force clear background:
              selectionColor="#007AFF"
              placeholderTextColor="#999"
              // Prevent any form associations:
              importantForAutofill="no"
              clearButtonMode="never"
              autoCapitalize="sentences"
              // Force re-render key to break autofill cache:
              key={`title-${visible}`}
            />
          </View>

          <View style={styles.section}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item: size, color, brand, condition..."
              multiline
              numberOfLines={4}
              maxLength={500}
              // Same autofill prevention:
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              textContentType="none"
              selectionColor="#007AFF"
              placeholderTextColor="#999"
              importantForAutofill="no"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Photo</Text>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.selectedImage}
                />
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={showImagePicker}
                  >
                    <Text style={styles.changeImageText}>Change Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Text style={styles.removeImageText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={showImagePicker}
              >
                <Text style={styles.addImageText}>+ Add Photo</Text>
                <Text style={styles.addImageSubtext}>
                  Tap to add a photo of your item
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Rent Price ($ per day)</Text>
            <TextInput
              style={styles.input}
              value={rentPrice}
              onChangeText={setRentPrice}
              placeholder="25.00"
              keyboardType="decimal-pad"
              // Autofill prevention:
              autoComplete="off"
              textContentType="none"
              selectionColor="#007AFF"
              placeholderTextColor="#999"
              importantForAutofill="no"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Security Deposit ($)</Text>
            <TextInput
              style={styles.input}
              value={securityDeposit}
              onChangeText={setSecurityDeposit}
              placeholder="100.00"
              keyboardType="decimal-pad"
              // Autofill prevention:
              autoComplete="off"
              textContentType="none"
              selectionColor="#007AFF"
              placeholderTextColor="#999"
              importantForAutofill="no"
              clearButtonMode="never"
              autoCapitalize="sentences"
              key={`description-${visible}`}
            />
            <Text style={styles.helperText}>
              Refundable deposit to protect against damage or loss
            </Text>
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
  imageContainer: {
    alignItems: "center",
  },
  selectedImage: {
    width: 200,
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
  },
  changeImageButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  removeImageButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  addImageButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  addImageSubtext: {
    fontSize: 14,
    color: "#666",
  },
});
