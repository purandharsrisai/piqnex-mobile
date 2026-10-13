import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "@/theme";
import { Avatar, Icon, type IconName } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSaved } from "@/context/Saved";

/** Tab icon: outline when idle, filled when selected, with a small orange dot under the active tab. */
function TabIcon({ outline, filled, color, focused }: { outline: IconName; filled: IconName; color: import("react-native").ColorValue; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 48, height: 30 }}>
      {focused ? <View style={{ position: "absolute", top: -6, width: 5, height: 5, borderRadius: 3, backgroundColor: colors.clay[600] }} /> : null}
      <Icon name={focused ? filled : outline} size={25} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const { unread } = useSaved();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === "ios" ? 18 : 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.clay[600],
        tabBarInactiveTintColor: colors.ink[400],
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12, marginTop: 0 },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarStyle: {
          height: 62 + bottom, paddingTop: 8, paddingBottom: bottom, backgroundColor: "#fff",
          borderTopWidth: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          shadowColor: "#0f1228", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 16,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <TabIcon outline="home-outline" filled="home" color={color} focused={focused} /> }} />
      <Tabs.Screen name="browse" options={{ title: "Browse", tabBarIcon: ({ color, focused }) => <TabIcon outline="search-outline" filled="search" color={color} focused={focused} /> }} />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarButton: ({ onPress, accessibilityState }) => {
            const on = !!accessibilityState?.selected;
            return (
              <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Sell a part" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: "center", paddingTop: 2 }}>
                <LinearGradient colors={["#ff7a4d", "#d23510"]} style={{ width: 58, height: 58, marginTop: -28, borderRadius: 29, borderWidth: 5, borderColor: colors.paper, alignItems: "center", justifyContent: "center", shadowColor: colors.clay[600], shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 8 }}>
                  <Icon name="add" size={30} color="#fff" />
                </LinearGradient>
                <Text style={{ fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, marginTop: 3, color: colors.clay[600] }}>Sell</Text>
              </Pressable>
            );
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: "Inbox", tabBarBadge: unread > 0 ? (unread > 9 ? "9+" : unread) : undefined, tabBarBadgeStyle: { backgroundColor: colors.clay[600], color: "#fff", fontFamily: fonts.bold, fontSize: 11, minWidth: 18, height: 18, lineHeight: 14, borderWidth: 2, borderColor: "#fff" }, tabBarIcon: ({ color, focused }) => <TabIcon outline="chatbubble-outline" filled="chatbubble" color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center", width: 48, height: 32 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: focused ? colors.clay[600] : "transparent", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <Avatar name={user?.displayName || "You"} uri={user?.avatarUrl} size={focused ? 30 : 33} />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
