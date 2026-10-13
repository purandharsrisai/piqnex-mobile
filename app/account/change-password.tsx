import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { colors, fonts } from "@/theme";
import { Button, Icon, Screen, SignInPrompt, Text } from "@/components/ui";
import { ErrorBanner, Field } from "@/components/account/kit";
import { useAuth } from "@/context/Auth";
import { changePassword } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validations";
import { fieldErrors } from "@/lib/auth-flow";

/** 0 = empty, 1 = weak (<8 chars), 2 = okay, 3-4 = strong. */
function strength(p: string): { filled: number; label: string } {
  if (!p) return { filled: 0, label: "" };
  if (p.length < 8) return { filled: 1, label: "Weak" };
  const score = 1 + (p.length >= 12 ? 1 : 0) + (/[a-z]/.test(p) && /[A-Z]/.test(p) ? 1 : 0) + (/\d/.test(p) || /[^A-Za-z0-9]/.test(p) ? 1 : 0);
  return { filled: score, label: score <= 2 ? "Okay" : "Strong" };
}

export default function ChangePassword() {
  const { user } = useAuth();
  const router = useRouter();
  const nRef = useRef<TextInput>(null);
  const cRef = useRef<TextInput>(null);
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) return <SignInPrompt icon="key-outline" title="Log in first" message="Sign in to change your password." />;

  const submit = async () => {
    setFormError(null);
    const r = changePasswordSchema.safeParse(f);
    if (!r.success) { setErrors(fieldErrors(r.error.issues)); return; }
    setErrors({});
    setBusy(true);
    try {
      await changePassword(f.currentPassword, f.newPassword);
      setDone(true);
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen contentStyle={{ gap: 14, paddingTop: 48, paddingHorizontal: 20, alignItems: "center" }}>
        <Stack.Screen options={{ headerTitleAlign: "center" }} />
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.moss[100], alignItems: "center", justifyContent: "center" }}>
          <Icon name="checkmark" size={30} color={colors.moss[700]} />
        </View>
        <Text variant="h2" center style={{ fontSize: 24, lineHeight: 30 }}>Password changed</Text>
        <Text color={colors.ink[600]} center style={{ fontSize: 16, lineHeight: 23 }}>Your password has been updated.</Text>
        <View style={{ alignSelf: "stretch", marginTop: 10 }}><Button title="Done" onPress={() => router.back()} /></View>
      </Screen>
    );
  }

  const st = strength(f.newPassword);
  const barColor = st.filled <= 1 ? colors.clay[500] : colors.moss[500];
  const strengthUi = (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={st.label ? `Password strength: ${st.label}` : "Password strength"}>
        {[1, 2, 3, 4].map((i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= st.filled ? barColor : colors.ink[100] }} />)}
      </View>
      {!errors.newPassword ? <Text color={colors.ink[500]} style={{ fontSize: 13, lineHeight: 18 }}>{st.label ? `At least 8 characters. ${st.label}.` : "At least 8 characters."}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerTitleAlign: "center" }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
          <Field label="Current password" password value={f.currentPassword} onChangeText={(v) => setF({ ...f, currentPassword: v })} error={errors.currentPassword} autoCapitalize="none" autoComplete="current-password" returnKeyType="next" onSubmitEditing={() => nRef.current?.focus()} />
          <Field ref={nRef} label="New password" password value={f.newPassword} onChangeText={(v) => setF({ ...f, newPassword: v })} error={errors.newPassword} below={strengthUi} autoCapitalize="none" autoComplete="new-password" returnKeyType="next" onSubmitEditing={() => cRef.current?.focus()} />
          <Field ref={cRef} label="Confirm new password" password value={f.confirmPassword} onChangeText={(v) => setF({ ...f, confirmPassword: v })} error={errors.confirmPassword} autoCapitalize="none" autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit} />
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.ink[100], backgroundColor: "#fff" }}>
          <Button title="Update password" onPress={submit} loading={busy} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
