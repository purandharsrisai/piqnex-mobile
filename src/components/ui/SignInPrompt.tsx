import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";
import { Text } from "./Text";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

/** Shown on tabs that need an account (Sell, Messages, Profile) when signed out. */
export function SignInPrompt({ icon, title, message }: { icon: IconName; title: string; message: string }) {
  const router = useRouter();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 24 }}>
      <View style={{ alignItems: "center", gap: 12 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.clay[50], alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={34} color={colors.clay[600]} />
        </View>
        <Text variant="h2" center>{title}</Text>
        <Text color={colors.ink[500]} center>{message}</Text>
        <View style={{ alignSelf: "stretch", gap: 10, marginTop: 10 }}>
          <Button title="Log in" onPress={() => router.push("/login")} />
          <Button title="Create an account" variant="outline" onPress={() => router.push("/signup")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
