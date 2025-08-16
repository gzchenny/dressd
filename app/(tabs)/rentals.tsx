import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView, StyleSheet } from "react-native";

export default function RentalsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText type="title">My Rentals</ThemedText>
        <ThemedText>
          Track your current and past clothing rentals here.
        </ThemedText>
        {/* Add rental history, current rentals, return dates, etc. */}
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
