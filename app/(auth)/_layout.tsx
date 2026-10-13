import React from "react";
import { Stack } from "expo-router";
import { colors, fonts } from "@/theme";

export const unstable_settings = { initialRouteName: "welcome" };

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTintColor: colors.ink[900], headerTitleStyle: { fontFamily: fonts.bold }, headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: "#fff" } }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Log in" }} />
      <Stack.Screen name="signup" options={{ title: "Create account" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Forgot password" }} />
      <Stack.Screen name="reset-password" options={{ title: "Reset password" }} />
    </Stack>
  );
}
