import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  console.log('RootLayout rendering');
  const pathname = usePathname();
  console.log('Current pathname:', pathname);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  if (!loaded) return null;

  const lightNavTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.background,
      primary: Colors.light.tint,
      text: Colors.light.text,
      border: '#E6DFEA',
    },
  };

  const darkNavTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.background,
      primary: Colors.dark.tint,
      text: Colors.dark.text,
      border: '#3A2A44',
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'light' ? lightNavTheme : darkNavTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Sign In', headerBackTitle: 'Back' }} />
          <Stack.Screen 
            name="product/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'modal' // Optional: makes it slide up from bottom
            }} 
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}