import { AppBar } from "@/components/AppBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  addPreferencePhoto,
  getUserPreferences,
  removePreferencePhoto,
  UserPreferences,
} from "@/services/userPreferencesService";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StylesScreen() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // track component mount state to avoid memory leaks
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadPreferences();
    }
  }, [isMounted]);

  const loadPreferences = async () => {
    if (!isMounted) return;

    try {
      const userPrefs = await getUserPreferences();
      if (isMounted) {
        setPreferences(userPrefs);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  // let user pick and analyze a style photo
  const addPhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access photos is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);

        try {
          // send photo for AI analysis and embedding generation
          await addPreferencePhoto(result.assets[0].uri);
          await loadPreferences();
          Alert.alert("Success", "Style photo added and analyzed!");
        } catch (error) {
          console.error("Error adding photo:", error);
          Alert.alert("Error", "Failed to analyze photo. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error adding photo:", error);
      Alert.alert("Error", "Failed to analyze photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = async (index: number) => {
    if (!isMounted) return;

    try {
      setLoading(true);
      await removePreferencePhoto(index);
      await loadPreferences();
    } catch (error) {
      console.error("Error removing photo:", error);
      Alert.alert("Error", "Failed to remove photo. Please try again.");
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppBar title="Styles" />
      <ThemedView
        style={styles.content}
        lightColor="#ffffff"
        darkColor="#ffffff"
      >
        <ScrollView>
          <ThemedText type="title" lightColor="#000000" darkColor="#000000">
            Style Preferences
          </ThemedText>
          <ThemedText lightColor="#000000" darkColor="#000000">
            Add photos of styles you like to get personalized recommendations.
          </ThemedText>

          <ThemedText
            type="subtitle"
            style={styles.sectionTitle}
            lightColor="#000000"
            darkColor="#000000"
          >
            Your Style Photos
          </ThemedText>
          <ThemedText
            style={styles.sectionDescription}
            lightColor="#000000"
            darkColor="#000000"
          >
            Add photos of styles you like to personalize your recommendations.
            {preferences?.photoCount
              ? ` (${preferences.photoCount} photos)`
              : ""}
          </ThemedText>

          <View style={styles.photoGrid}>
            {preferences?.photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoItem}
                onLongPress={() => removePhoto(index)}
              >
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(index)}
                >
                  <ThemedText style={styles.removeButtonText}>×</ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            {/* add new photo button */}
            <TouchableOpacity
              style={[styles.addPhotoButton, { opacity: loading ? 0.5 : 1 }]}
              onPress={addPhoto}
              disabled={loading}
            >
              <ThemedText
                style={styles.addPhotoText}
                lightColor="#000000"
                darkColor="#000000"
              >
                +
              </ThemedText>
              <ThemedText
                style={styles.addPhotoLabel}
                lightColor="#000000"
                darkColor="#000000"
              >
                {loading ? "Processing..." : "Add Photo"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* show status if user has active preferences */}
          {preferences?.embedding && (
            <View style={styles.embeddingInfo}>
              <ThemedText style={styles.embeddingText}>
                ✓ Your style profile is active and personalizing your
                recommendations
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    marginTop: 30,
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  photoItem: {
    position: "relative",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  addPhotoText: {
    fontSize: 24,
    fontWeight: "bold",
    opacity: 0.6,
  },
  addPhotoLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
    textAlign: "center",
  },
  embeddingInfo: {
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  embeddingText: {
    color: "#2d5a2d",
    fontSize: 14,
    textAlign: "center",
  },
});
