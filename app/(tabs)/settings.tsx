import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppBar } from "@/components/AppBar";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ThemedView style={styles.container}>
        <ScrollView>
          <ThemedText type="title">Settings</ThemedText>
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppBar title="Settings" />
      
      <ThemedView style={styles.content}>
        <ScrollView>
          <ThemedText>
            Manage your account, payment methods, and app settings.
          </ThemedText>
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
});
