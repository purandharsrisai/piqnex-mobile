import React, { useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";
import { Button, EmptyState, Text } from "@/components/ui";
import { BackChevron, ErrorBanner, Field, IconTile, titleStyle } from "@/components/account/kit";
import { resetPassword } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validations";
import { fieldErrors } from "@/lib/auth-flow";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const confirm = useRef<TextInput>(null);
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const shell = (children: React.ReactNode) => (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 14 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets showsVerticalScrollIndicator={false}>
        <BackChevron />
        {children}
      </ScrollView>
    </SafeAreaView>
  );

  if (!token) {
    return shell(<EmptyState icon="link-outline" title="Reset link missing" message="Open the reset link from your email, or request a new one." actionLabel="Request a new link" onAction={() => router.replace("/forgot-password")} />);
  }

  const submit = async () => {
    setFormError(null);
    const r = resetPasswordSchema.safeParse({ token, newPassword, confirmPassword });
    if (!r.success) { setErrors(fieldErrors(r.error.issues)); return; }
    setErrors({});
    setBusy(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (e) {
      setFormError(errorMessage(e, "That reset link may have expired. Request a new one."));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return shell(
      <>
        <IconTile icon="checkmark" bg={colors.moss[100]} fg={colors.moss[700]} />
        <View style={{ gap: 6 }}>
          <Text style={titleStyle}>Password updated</Text>
          <Text variant="small" color={colors.ink[500]}>You can now log in with your new password.</Text>
        </View>
        <Button title="Log in" onPress={() => router.replace("/login")} />
      </>,
    );
  }

  return shell(
    <>
      <IconTile icon="shield-outline" />
      <View style={{ gap: 6 }}>
        <Text style={titleStyle}>Choose a new password</Text>
        <Text variant="small" color={colors.ink[500]}>Pick something at least 8 characters long.</Text>
      </View>
      {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
      <Field label="New password" password value={newPassword} onChangeText={setNew} error={errors.newPassword || errors.token} autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" returnKeyType="next" onSubmitEditing={() => confirm.current?.focus()} />
      <Field ref={confirm} label="Confirm new password" password value={confirmPassword} onChangeText={setConfirm} error={errors.confirmPassword} autoCapitalize="none" autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit} />
      <Button title="Update password" onPress={submit} loading={busy} />
    </>,
  );
}
