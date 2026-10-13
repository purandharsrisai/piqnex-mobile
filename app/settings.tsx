import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter, type Href } from "expo-router";
import Constants from "expo-constants";
import { colors, fonts } from "@/theme";
import { Icon, SignInPrompt, Text, type IconName } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { getItem, setItem } from "@/lib/storage";

const PUSH_KEY = "piqnex_push_enabled"; // "0" = off, anything else = on (push.ts reads this)
const ALERTS_KEY = "piqnex_pref_alerts"; // default on
const NEWS_KEY = "piqnex_pref_news"; // default off

function Label({ children }: { children: string }) {
  return <Text style={{ fontFamily: fonts.extrabold, fontSize: 12.5, letterSpacing: 1, marginTop: 22, marginBottom: 2, marginLeft: 2 }} color={colors.ink[500]}>{children}</Text>;
}

type Tone = "clay" | "moss" | "ink";
const TONES: Record<Tone, { bg: string; fg: string }> = {
  clay: { bg: colors.clay[50], fg: colors.clay[600] },
  moss: { bg: colors.moss[100], fg: colors.moss[700] },
  ink: { bg: "#e6e8f6", fg: colors.ink[700] },
};

function Row({ icon, title, sub, onPress, value, onValueChange, last, tone = "ink" }: {
  icon: IconName; title: string; sub?: string; onPress?: () => void; value?: boolean; onValueChange?: (v: boolean) => void; last?: boolean; tone?: Tone;
}) {
  const toggle = onValueChange !== undefined;
  const t = TONES[tone];
  return (
    <Pressable onPress={onPress} disabled={toggle} accessibilityRole={toggle ? undefined : "button"} accessibilityLabel={title}
      style={({ pressed }) => ({ minHeight: 66, flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.ink[100], opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.bg, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={21} color={t.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 15.5, lineHeight: 21 }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 13.5, lineHeight: 18 }} color={colors.ink[500]}>{sub}</Text> : null}
      </View>
      {toggle ? (
        <Switch value={!!value} onValueChange={onValueChange} accessibilityLabel={title} trackColor={{ true: colors.clay[600], false: colors.ink[200] }} thumbColor="#fff" ios_backgroundColor={colors.ink[200]} />
      ) : (
        <Icon name="chevron-forward" size={18} color={colors.ink[300]} />
      )}
    </Pressable>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [push, setPush] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [news, setNews] = useState(false);

  useEffect(() => {
    getItem(PUSH_KEY).then((v) => setPush(v !== "0"));
    getItem(ALERTS_KEY).then((v) => setAlerts(v !== "0"));
    getItem(NEWS_KEY).then((v) => setNews(v === "1"));
  }, []);

  if (!user) return <SignInPrompt icon="settings-outline" title="Log in for settings" message="Sign in to manage your account." />;

  const flip = (set: (v: boolean) => void, key: string) => (v: boolean) => { set(v); setItem(key, v ? "1" : "0"); };
  const go = (p: string) => () => router.push(p as Href);
  const logout = () =>
    Alert.alert("Log out?", "You'll need to log in again to message sellers or manage listings.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: async () => { await signOut(); router.replace("/"); } },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#ff7a4d", "#d23510"]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingTop: insets.top + 4, paddingHorizontal: 20, paddingBottom: 64 }}>
        <View style={{ height: 44 }} />
        <Text style={{ fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 39, letterSpacing: -0.7, marginTop: 4 }} color="#fff" accessibilityRole="header">Settings</Text>
        <Text style={{ fontSize: 15.5, lineHeight: 22, marginTop: 2 }} color="rgba(255,255,255,0.9)">Manage your account and preferences</Text>
      </LinearGradient>

      <View style={{ flex: 1, marginTop: -30, backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" }}>
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 4, paddingBottom: Math.max(insets.bottom, 12) + 28 }}>
          <Label>ACCOUNT</Label>
          <Row tone="clay" icon="lock-closed-outline" title="Change password" onPress={go("/account/change-password")} last />

          <Label>NOTIFICATIONS</Label>
          <Row tone="moss" icon="chatbubble-outline" title="Messages" sub="New messages about listings" value={push} onValueChange={flip(setPush, PUSH_KEY)} />
          <Row tone="moss" icon="search-outline" title="Part alerts" sub="Matches for parts you need" value={alerts} onValueChange={flip(setAlerts, ALERTS_KEY)} />
          <Row tone="moss" icon="pricetag-outline" title="Offers & news" sub="Occasional product updates" value={news} onValueChange={flip(setNews, NEWS_KEY)} last />

          <Label>SUPPORT</Label>
          <Row icon="shield-outline" title="Safety tips & help" onPress={go("/safety")} />
          <Row icon="mail-outline" title="Contact us" onPress={go("/contact")} />
          <Row icon="document-text-outline" title="Terms & Privacy" onPress={go("/info/terms")} last />

          <Pressable onPress={logout} accessibilityRole="button" accessibilityLabel="Log out" style={({ pressed }) => ({ minHeight: 52, borderRadius: 26, borderWidth: 1.5, borderColor: colors.clay[600], alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 26, opacity: pressed ? 0.6 : 1 })}>
            <Icon name="log-out-outline" size={20} color={colors.clay[600]} />
            <Text style={{ fontFamily: fonts.bold, fontSize: 16 }} color={colors.clay[600]}>Log out</Text>
          </Pressable>
          <Pressable onPress={go("/account/delete")} accessibilityRole="link" accessibilityLabel="Delete account" hitSlop={8} style={{ alignItems: "center", paddingVertical: 14 }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14.5 }} color="#b3261e">Delete account</Text>
          </Pressable>
          <Text center color={colors.ink[300]} style={{ fontSize: 12.5, lineHeight: 18 }}>Piqnex v{Constants.expoConfig?.version ?? "1.0.0"}</Text>
        </View>
      </ScrollView>
      </View>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/profile"))} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={{ position: "absolute", top: insets.top + 4, left: 14, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(15,18,40,0.28)", alignItems: "center", justifyContent: "center" }}>
        <Icon name="chevron-back" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
