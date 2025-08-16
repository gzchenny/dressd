import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView, StyleSheet } from "react-native";

export default function StyleProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText type="title">Style Profile</ThemedText>
        <ThemedText>
          Set up your style preferences and connect social media for
          personalized recommendations.
        </ThemedText>
        {/* Add Pinterest integration, style preferences, size info, etc. */}
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
