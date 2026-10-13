import React, { useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "@/theme";
import { AppleLogo, Button, GoogleLogo, LogoMark, Text } from "@/components/ui";
import { ErrorBanner, Field, titleStyle } from "@/components/account/kit";
import { useAuth } from "@/context/Auth";
import { ApiError, errorMessage } from "@/lib/api";
import { authSchema } from "@/lib/validations";
import { fieldErrors, markWelcomeSeen } from "@/lib/auth-flow";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const pw = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [badCreds, setBadCreds] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setFormError(null);
    setBadCreds(false);
    const r = authSchema.safeParse({ email, password: password || "" });
    if (!r.success) { setErrors(fieldErrors(r.error.issues)); return; }
    setErrors({});
    setBusy(true);
    try {
      await signIn(r.data.email, password);
      await markWelcomeSeen();
      router.replace("/");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setBadCreds(true);
        setFormError("That email or password doesn't match our records.");
      } else {
        setFormError(errorMessage(e, "Couldn't log you in. Please try again."));
      }
    } finally {
      setBusy(false);
    }
  };
  const social = (name: string) => Alert.alert(`${name} sign-in isn't available yet. Please use email.`);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 16 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets showsVerticalScrollIndicator={false}>
        <LogoMark size={44} />
        <View style={{ gap: 4, marginTop: 6, marginBottom: 4 }}>
          <Text style={[titleStyle, { fontSize: 34, lineHeight: 41 }]}>Welcome back</Text>
          <Text color={colors.ink[500]} style={{ fontSize: 16, lineHeight: 23 }}>Log in to manage your listings and messages.</Text>
        </View>
        {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
        <Field label="Email" value={email} onChangeText={setEmail} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => pw.current?.focus()} />
        <Field ref={pw} label="Password" password value={password} onChangeText={setPassword} error={errors.password} invalid={badCreds} placeholder="Enter your password" autoCapitalize="none" autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
        <Text onPress={() => router.push("/forgot-password")} accessibilityRole="link" style={{ alignSelf: "flex-end", fontFamily: fonts.bold, fontSize: 16 }} color={colors.clay[600]}>Forgot password?</Text>
        <Button title="Log in" onPress={submit} loading={busy} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.ink[100] }} />
          <Text color={colors.ink[500]} style={{ fontSize: 15 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.ink[100] }} />
        </View>
        <Button title="Continue with Google" variant="outline" iconNode={<GoogleLogo size={20} />} onPress={() => social("Google")} />
        <Button title="Continue with Apple" variant="secondary" iconNode={<AppleLogo size={20} color="#fff" />} onPress={() => social("Apple")} />
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 4 }}>
          <Text color={colors.ink[500]} style={{ fontSize: 16 }}>New here? </Text>
          <Text onPress={() => router.replace("/signup")} accessibilityRole="link" color={colors.clay[600]} style={{ fontFamily: fonts.bold, fontSize: 16 }}>Create an account</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
