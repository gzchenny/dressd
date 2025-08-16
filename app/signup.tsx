import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { auth } from "@/config/firebase";
import { useThemeColor } from "@/hooks/useThemeColor";
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
} from "react-native";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, "text");

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
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>
          Create Account
        </ThemedText>

        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Email"
          placeholderTextColor={textColor + "80"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Username"
          placeholderTextColor={textColor + "80"}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Birthday (YYYY-MM-DD)"
          placeholderTextColor={textColor + "80"}
          value={birthday}
          onChangeText={setBirthday}
        />

        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Location (Country)"
          placeholderTextColor={textColor + "80"}
          value={location}
          onChangeText={setLocation}
        />

        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Password"
          placeholderTextColor={textColor + "80"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Confirm Password"
          placeholderTextColor={textColor + "80"}
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
          <ThemedText type="link">Already have an account? Sign In</ThemedText>
        </Link>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0a7ea4",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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
});
