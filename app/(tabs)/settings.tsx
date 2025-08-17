import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppBar } from "@/components/AppBar";
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import { getUserPreferences, addPreferencePhoto, removePreferencePhoto, UserPreferences } from "@/services/userPreferencesService";

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const userPrefs = await getUserPreferences();
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        setLoading(true);
        await addPreferencePhoto(result.assets[0].uri);
        await loadPreferences(); // Reload to get updated preferences
        Alert.alert('Success', 'Photo added to your preferences!');
      } catch (error) {
        console.error('Error adding photo:', error);
        Alert.alert('Error', 'Failed to add photo. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const removePhoto = async (index: number) => {
    try {
      setLoading(true);
      await removePreferencePhoto(index);
      await loadPreferences(); // Reload to get updated preferences
    } catch (error) {
      console.error('Error removing photo:', error);
      Alert.alert('Error', 'Failed to remove photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppBar title="Settings" />
      
      <ThemedView style={styles.content}>
        <ScrollView>
          <ThemedText type="title">Account Settings</ThemedText>
          <ThemedText>
            Manage your account, payment methods, and app settings.
          </ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Style Preferences
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Add photos of styles you like to personalize your recommendations.
            {preferences?.photoCount ? ` (${preferences.photoCount} photos)` : ''}
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
            
            <TouchableOpacity 
              style={[styles.addPhotoButton, { opacity: loading ? 0.5 : 1 }]} 
              onPress={addPhoto}
              disabled={loading}
            >
              <ThemedText style={styles.addPhotoText}>+</ThemedText>
              <ThemedText style={styles.addPhotoLabel}>
                {loading ? 'Processing...' : 'Add Photo'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {preferences?.embedding && (
            <View style={styles.embeddingInfo}>
              <ThemedText style={styles.embeddingText}>
                ✓ Your style profile is active and personalizing your recommendations
              </ThemedText>
            </View>
          )}

          {/* Add user info, payment methods, settings, help, etc. */}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  photoItem: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  addPhotoText: {
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  addPhotoLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
    textAlign: 'center',
  },
  embeddingInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  embeddingText: {
    color: '#2d5a2d',
    fontSize: 14,
    textAlign: 'center',
  },
});