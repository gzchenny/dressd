import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  // Force light mode colors regardless of system theme
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#653A79',      // Your brand color
        tabBarInactiveTintColor: '#666666',    // Gray for inactive
        tabBarStyle: {
          backgroundColor: '#FFFFFF',          // Force white background
          borderTopColor: '#E6DFEA',          // Light border
          borderTopWidth: 1,
          position: Platform.select({
            ios: "absolute",
            default: undefined,
          }),
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          href: null, // This hides it from the tab bar but keeps it in the stack
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null, // Hide cart from tab bar like wishlist
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "My Items",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bag.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}