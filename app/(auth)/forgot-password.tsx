import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "@/theme";
import { Button, Text } from "@/components/ui";
import { BackChevron, ErrorBanner, Field, IconTile, titleStyle } from "@/components/account/kit";
import { forgotPassword } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    const r = forgotPasswordSchema.safeParse({ email });
    if (!r.success) { setError(r.error.issues[0]?.message); return; }
    setError(undefined);
    setBusy(true);
    try {
      const res = (await forgotPassword(r.data.email)) as { message?: string; resetToken?: string } | undefined;
      // Dev/demo backends return the token directly - go straight to the reset screen (same as the website).
      if (res?.resetToken) { router.replace({ pathname: "/reset-password", params: { token: res.resetToken } }); return; }
      setDone(res?.message ?? "If that email exists, we've sent a reset link.");
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const backToLogin = (
    <Text onPress={() => router.replace("/login")} accessibilityRole="link" center style={{ fontFamily: fonts.bold, fontSize: 16, paddingVertical: 10 }} color={colors.ink[600]}>Back to log in</Text>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets showsVerticalScrollIndicator={false}>
        <BackChevron />
        {done ? (
          <>
            <IconTile icon="mail-open-outline" bg={colors.moss[100]} fg={colors.moss[700]} />
            <View style={{ gap: 6 }}>
              <Text style={[titleStyle, { fontSize: 34, lineHeight: 41 }]}>Check your email</Text>
              <Text color={colors.ink[500]} accessibilityRole="alert" style={{ fontSize: 16, lineHeight: 23 }}>{done}</Text>
              <Text color={colors.ink[500]} style={{ fontSize: 16, lineHeight: 23 }}>Open the link in the email on this phone to choose a new password.</Text>
            </View>
            <Button title="Back to log in" onPress={() => router.replace("/login")} />
          </>
        ) : (
          <>
            <IconTile icon="shield-outline" />
            <View style={{ gap: 6 }}>
              <Text style={[titleStyle, { fontSize: 34, lineHeight: 41 }]}>Reset your password</Text>
              <Text color={colors.ink[500]} style={{ fontSize: 16, lineHeight: 23 }}>Enter the email you signed up with and we'll send you a link to choose a new password.</Text>
            </View>
            {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
            <Field label="Email" value={email} onChangeText={setEmail} error={error} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="go" onSubmitEditing={submit} />
            <Button title="Send reset link" onPress={submit} loading={busy} />
            {backToLogin}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
