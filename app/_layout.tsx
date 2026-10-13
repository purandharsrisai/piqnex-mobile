import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { AuthProvider, useAuth } from "@/context/Auth";
import { SavedProvider } from "@/context/Saved";
import { colors, fonts } from "@/theme";
import { AnimatedSplash, DialogHost } from "@/components/ui";
import { usePushNotifications } from "@/lib/push";

export const unstable_settings = { anchor: "(tabs)" };

SplashScreen.preventAutoHideAsync().catch(() => {});

function Gate() {
  const { ready, user } = useAuth();
  const [minTime, setMinTime] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const hidden = useCallback(() => setSplashGone(true), []);
  useEffect(() => { const t = setTimeout(() => setMinTime(true), 1500); return () => clearTimeout(t); }, []);
  usePushNotifications(user?.id ?? null);

  return (
    <View style={{ flex: 1 }}>
    {ready ? (
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: colors.ink[900],
          headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        {/* Signed out: only the welcome / log in / sign up / reset screens exist. */}
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Signed in: every internal screen. Signed-out visitors are redirected to the welcome screen. */}
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="parts/[id]/index" options={{ title: "" }} />
          <Stack.Screen name="parts/[id]/edit" options={{ title: "Edit listing" }} />
          <Stack.Screen name="sellers/[id]" options={{ title: "Seller" }} />
          <Stack.Screen name="chat/[id]" options={{ title: "" }} />
          <Stack.Screen name="saved" options={{ title: "Saved" }} />
          <Stack.Screen name="my-listings" options={{ title: "My listings" }} />
          <Stack.Screen name="my-requests" options={{ title: "My requests" }} />
          <Stack.Screen name="need" options={{ title: "I need a part" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="contact" options={{ title: "Contact us" }} />
          <Stack.Screen name="account/edit" options={{ title: "Edit profile" }} />
          <Stack.Screen name="account/change-password" options={{ title: "Change password" }} />
          <Stack.Screen name="account/delete" options={{ title: "Delete account" }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="safety" options={{ title: "Safety & help" }} />
        </Stack.Protected>

        {/* Terms / privacy / FAQ are readable before signing up. */}
        <Stack.Screen name="info/[slug]" options={{ title: "" }} />
      </Stack>
    ) : null}
    {!splashGone ? <AnimatedSplash done={ready && minTime} onHidden={hidden} /> : null}
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => {}); }, [loaded]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SavedProvider>
          <StatusBar style="dark" />
          <Gate />
          <DialogHost />
        </SavedProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
