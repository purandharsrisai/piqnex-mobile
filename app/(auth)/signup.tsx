import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, TextInput, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { colors, fonts } from "@/theme";
import { AppleLogo, Button, GoogleLogo, Text } from "@/components/ui";
import { BackChevron, ErrorBanner, Field, titleStyle } from "@/components/account/kit";
import { useAuth } from "@/context/Auth";
import { errorMessage } from "@/lib/api";
import { fieldErrors, markWelcomeSeen } from "@/lib/auth-flow";

const schema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required").max(80),
    phone: z.string().min(1, "Phone number is required").regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })

/** Digits only, at most 10 (letters, symbols, spaces and extra digits are dropped as you type or paste). */
const digits10 = (v: string) => v.replace(/\D/g, "").slice(0, 10);

export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();
  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];
  const [f, setF] = useState({ displayName: "", phone: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [kb, setKb] = useState(0);
  useEffect(() => {
    // iOS doesn't resize the window for the keyboard, so pad the scroll area by its height (Android resizes by itself).
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (e) => { if (Platform.OS === "ios") setKb(e.endCoordinates.height); });
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKb(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  /** Keep the focused field above the keyboard: scroll to the bottom once the keyboard has opened. */
  const reveal = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  const set = (k: keyof typeof f) => (v: string) => {
    setF((p) => ({ ...p, [k]: k === "phone" ? digits10(v) : v }));
    setErrors((e) => { if (!e[k]) return e; const n = { ...e }; delete n[k]; return n; });
  };

  const submit = async () => {
    setFormError(null);
    const r = schema.safeParse({ ...f, phone: digits10(f.phone) });
    if (!r.success) { setErrors(fieldErrors(r.error.issues)); return; }
    setErrors({});
    setBusy(true);
    try {
      await signUp({ email: r.data.email, password: r.data.password, displayName: r.data.displayName, phone: r.data.phone });
      await markWelcomeSeen();
      router.replace("/");
    } catch (e) {
      setFormError(errorMessage(e, "Couldn't create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  };
  const social = (name: string) => Alert.alert(`${name} sign-in isn't available yet. Please use email.`);
  const link = { fontFamily: fonts.semibold, textDecorationLine: "underline" as const };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView ref={scrollRef} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 + kb, gap: 16 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        <BackChevron />
        <View style={{ gap: 4, marginBottom: 2 }}>
          <Text style={titleStyle}>Create your account</Text>
          <Text color={colors.ink[500]} style={{ fontSize: 16, lineHeight: 22 }}>Takes under a minute.</Text>
        </View>
        {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
        <Field label="Display name" value={f.displayName} onChangeText={set("displayName")} error={errors.displayName} placeholder="e.g. Priya S." autoComplete="name" textContentType="name" returnKeyType="next" onSubmitEditing={() => refs[0].current?.focus()} />
        <Field ref={refs[0]} label="Phone number" value={f.phone} onChangeText={set("phone")} error={errors.phone} placeholder="98xxxxxxxx" keyboardType="number-pad" inputMode="numeric" autoComplete="tel" textContentType="telephoneNumber" maxLength={10} returnKeyType="next" onSubmitEditing={() => refs[1].current?.focus()} />
        <Field ref={refs[1]} onFocus={reveal} label="Email" value={f.email} onChangeText={set("email")} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => refs[2].current?.focus()} />
        <Field ref={refs[2]} onFocus={reveal} label="Password" password value={f.password} onChangeText={set("password")} error={errors.password} placeholder="At least 8 characters" autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" returnKeyType="go" onSubmitEditing={submit} />
        <View style={{ marginTop: 4 }}><Button title="Create account" onPress={submit} loading={busy} /></View>
        <Text center color={colors.ink[500]} style={{ fontSize: 14.5 }}>or continue with</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}><Button title="Google" variant="outline" iconNode={<GoogleLogo size={19} />} onPress={() => social("Google")} /></View>
          <View style={{ flex: 1 }}><Button title="Apple" variant="outline" iconNode={<AppleLogo size={19} color="#000" />} onPress={() => social("Apple")} /></View>
        </View>
        <Text center color={colors.ink[500]} style={{ fontSize: 13, lineHeight: 19 }}>
          By continuing you agree to our{" "}
          <Text color={colors.ink[700]} style={[link, { fontSize: 13 }]} onPress={() => router.push("/info/terms")} accessibilityRole="link">Terms</Text>
          {" "}and{" "}
          <Text color={colors.ink[700]} style={[link, { fontSize: 13 }]} onPress={() => router.push("/info/privacy")} accessibilityRole="link">Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
