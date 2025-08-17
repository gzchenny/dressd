import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { auth } from "@/config/firebase";
import { createUserProfile } from "@/services/userService";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !username ||
      !birthday ||
      !location
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        email,
        username,
        birthday,
        location,
      });

      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/home") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'left', 'right']}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color="#653A79" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            Create Account
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#653A7980"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#653A7980"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Birthday (YYYY-MM-DD)"
            placeholderTextColor="#653A7980"
            value={birthday}
            onChangeText={setBirthday}
          />

          <TextInput
            style={styles.input}
            placeholder="Location (Country)"
            placeholderTextColor="#653A7980"
            value={location}
            onChangeText={setLocation}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#653A7980"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#653A7980"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </ThemedText>
          </TouchableOpacity>

          <Link href="/login" style={styles.link}>
            <ThemedText style={styles.linkText}>Already have an account? Sign In</ThemedText>
          </Link>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  header: {
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: "center",
    marginBottom: 40,
    marginTop: 20,
    color: "#653A79",
  },
  input: {
    borderWidth: 2,
    borderColor: "#653A79",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    fontSize: 16,
    color: "#653A79",
  },
  button: {
    backgroundColor: "#653A79",
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    marginTop: 15,
  },
  linkText: {
    color: "#653A79",
    textAlign: "center",
    fontSize: 16,
  },
});
