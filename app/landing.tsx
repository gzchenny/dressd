import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LandingScreen() {
  const text = useThemeColor({}, 'text');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.center}>
        <ThemedText type="title" style={[styles.title, { color: '#653A79' }]}>Dressd</ThemedText>
        <ThemedText style={[styles.tagline, { color: '#653A79' }]}>Rent fashion. Refresh style.</ThemedText>
      </View>

      <View style={styles.buttons}>
        <Link href="/signup" asChild>
          <TouchableOpacity style={styles.primary}>
            <ThemedText style={styles.primaryText}>Get Started</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/login" asChild>
          <TouchableOpacity style={[styles.secondary, { borderColor: '#653A79' }]}>
            <ThemedText style={[styles.secondaryText, { color: '#653A79' }]}>
              I already have an account
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title: { fontSize: 48, fontWeight: '700', textAlign: 'center', lineHeight: 48},
  tagline: { fontSize: 16, opacity: 0.7, textAlign: 'center', maxWidth: 260 },
  buttons: { gap: 16, paddingBottom: 40 },
  primary: { backgroundColor: '#653A79', padding: 18, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: 'white', fontSize: 18, fontWeight: '600' },
  secondary: { padding: 18, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  secondaryText: { fontSize: 16, fontWeight: '500' },
});