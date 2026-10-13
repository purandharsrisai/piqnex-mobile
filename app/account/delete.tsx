import React, { useState } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors, fonts } from "@/theme";
import { Button, Icon, Screen, SignInPrompt, Text } from "@/components/ui";
import { ErrorBanner, Field, IconTile, titleStyle } from "@/components/account/kit";
import { useAuth } from "@/context/Auth";
import { deleteAccount } from "@/lib/actions";
import { errorMessage } from "@/lib/api";

const REMOVED = ["Your profile and contact details", "All your listings and need requests", "Your messages and saved items"];
const DARK_RED = "#b3261e";

export default function DeleteAccount() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return <SignInPrompt icon="shield-outline" title="Log in first" message="Sign in to manage your account." />;

  const doDelete = async () => {
    if (!pw) { setErr("Enter your password to confirm."); return; }
    setBusy(true); setErr(null);
    try {
      await deleteAccount(pw);
      await signOut();
      router.replace("/");
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen keyboard contentStyle={{ gap: 16, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
      <Stack.Screen options={{ headerTitle: "Delete account", headerTitleAlign: "center" }} />
      <IconTile icon="shield-outline" bg="#fdecea" fg={DARK_RED} />
      <View style={{ gap: 6 }}>
        <Text style={[titleStyle, { fontSize: 34, lineHeight: 41 }]}>Delete your account?</Text>
        <Text color={colors.ink[500]} style={{ fontSize: 16, lineHeight: 23 }}>This permanently removes:</Text>
      </View>
      <View style={{ gap: 14 }}>
        {REMOVED.map((t) => (
          <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icon name="checkmark" size={20} color={DARK_RED} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 16.5, lineHeight: 23, flex: 1 }}>{t}</Text>
          </View>
        ))}
      </View>
      <Text color={colors.ink[500]} style={{ fontSize: 16, lineHeight: 23 }}>This can't be undone. Type your password to confirm.</Text>
      {err && !pw ? <ErrorBanner>{err}</ErrorBanner> : null}
      <Field password value={pw} onChangeText={(v) => { setPw(v); setErr(null); }} error={err && pw ? err : undefined} placeholder="Password" accessibilityLabel="Password" autoCapitalize="none" autoComplete="current-password" returnKeyType="go" onSubmitEditing={doDelete} />
      <Button title="Delete my account" variant="destructive" onPress={doDelete} loading={busy} />
      <Button title="Keep my account" variant="outline" onPress={() => router.back()} disabled={busy} />
    </Screen>
  );
}
