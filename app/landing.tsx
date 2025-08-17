// import themed components for consistent styling
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Link } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// landing screen main component
export default function LandingScreen() {
  const text = useThemeColor({}, "text");

  // safe area for top and sides
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "left", "right"]}
    >
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          // app title
          <ThemedText type="title" style={[styles.title, { color: "#653A79" }]}>
            dress.
          </ThemedText>
          // tagline for the app
          <ThemedText style={[styles.tagline, { color: "#653A79" }]}>
            Rent fashion. Refresh style.
          </ThemedText>
        </View>
        // buttons for navigation
        <View style={styles.buttons}>
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.primary}>
              // signup button
              <ThemedText style={styles.primaryText}>Get Started</ThemedText>
            </TouchableOpacity>
          </Link>
          <Link href="/login" asChild>
            <TouchableOpacity
              style={[styles.secondary, { borderColor: "#653A79" }]}
            >
              // login button
              <ThemedText style={[styles.secondaryText, { color: "#653A79" }]}>
                I already have an acount
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

// styles for layout and buttons
const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, backgroundColor: "white" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  title: {
    fontSize: 48,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 48,
  },
  tagline: { fontSize: 16, opacity: 0.7, textAlign: "center", maxWidth: 260 },
  buttons: { gap: 16, paddingBottom: 40 },
  primary: {
    backgroundColor: "#653A79",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: { color: "white", fontSize: 18, fontWeight: "600" },
  secondary: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  secondaryText: { fontSize: 16, fontWeight: "500", textAlign: "center" },
});
