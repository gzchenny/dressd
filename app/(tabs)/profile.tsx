import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText>
          Manage your account, payment methods, and app settings.
        </ThemedText>
        {/* Add user info, payment methods, settings, help, etc. */}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
