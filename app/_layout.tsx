import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, Tabs, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log("RootLayout rendering");
  const pathname = usePathname();
  console.log("Current pathname:", pathname);

  // Force light mode - comment out this line to use system theme
  // const colorScheme = useColorScheme();
  const colorScheme = 'light'; // Force light mode

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const lightNavTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#FFFFFF',        // Force white background
      card: '#FFFFFF',              // Force white cards
      primary: '#653A79',           // Your brand color
      text: '#2B1F31',              // Dark text
      border: "#E6DFEA",
    },
  };

  const darkNavTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#FFFFFF',        // Even "dark" theme uses white background
      card: '#FFFFFF',              // Even "dark" theme uses white cards
      primary: '#653A79',           // Your brand color
      text: '#2B1F31',              // Dark text even in "dark" mode
      border: "#E6DFEA",
    },
  };

  return (
    // Always use light theme regardless of colorScheme
    <ThemeProvider value={lightNavTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign In', headerBackTitle: 'Back' }} />
        <Stack.Screen 
          name="product/[id]" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="checkout" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}