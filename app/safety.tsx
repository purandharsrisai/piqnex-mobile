import React from "react";
import { Pressable, View } from "react-native";
import { Stack, useRouter, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "@/theme";
import { Icon, Screen, Text, type IconName } from "@/components/ui";

const TIPS = [
  { title: "Meet in a public place", body: "Daytime, busy, ideally with a friend." },
  { title: "Check the part first", body: "Test it before you pay." },
  { title: "Never pay in advance", body: "Pay on handover, not before." },
];
const HELP: { icon: IconName; label: string; href: string }[] = [
  { icon: "chatbubble-outline", label: "FAQ", href: "/info/faq" },
];

export default function Safety() {
  const router = useRouter();
  return (
    <Screen contentStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 6 }}>
      <Stack.Screen options={{ headerTitle: "Safety & help", headerTitleAlign: "center" }} />
      <LinearGradient colors={["#ff7a4d", "#d23510"]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ borderRadius: 20, padding: 20, gap: 6, marginBottom: 14 }}>
        <Text style={{ fontFamily: fonts.extrabold, fontSize: 21, lineHeight: 27 }} color="#fff">Buy and sell safely</Text>
        <Text style={{ fontSize: 15.5, lineHeight: 22 }} color="rgba(255,255,255,0.92)">Piqnex doesn't handle payments or shipping, so a few habits keep you safe.</Text>
      </LinearGradient>

      {TIPS.map((t) => (
        <View key={t.title} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.ink[100] }}>
          <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: colors.moss[100], alignItems: "center", justifyContent: "center" }}>
            <Icon name="checkmark" size={21} color={colors.moss[700]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, lineHeight: 23 }}>{t.title}</Text>
            <Text style={{ fontSize: 15, lineHeight: 21 }} color={colors.ink[500]}>{t.body}</Text>
          </View>
        </View>
      ))}

      <Text style={{ fontFamily: fonts.bold, fontSize: 13, letterSpacing: 0.8, marginTop: 20, marginBottom: 2 }} color={colors.ink[500]}>HELP</Text>
      {HELP.map((h) => (
        <Pressable key={h.label} onPress={() => router.push(h.href as Href)} accessibilityRole="button" accessibilityLabel={h.label}
          style={({ pressed }) => ({ minHeight: 66, flexDirection: "row", alignItems: "center", gap: 14, borderBottomWidth: 1, borderBottomColor: colors.ink[100], opacity: pressed ? 0.6 : 1 })}>
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.ink[50], alignItems: "center", justifyContent: "center" }}>
            <Icon name={h.icon} size={21} color={colors.ink[800]} />
          </View>
          <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 17 }}>{h.label}</Text>
          <Icon name="chevron-forward" size={20} color={colors.ink[300]} />
        </Pressable>
      ))}
    </Screen>
  );
}
