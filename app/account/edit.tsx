import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { colors, fonts } from "@/theme";
import { Avatar, Button, SignInPrompt, Text } from "@/components/ui";
import { ErrorBanner, Field, normalizePhone } from "@/components/account/kit";
import { useAuth } from "@/context/Auth";
import { updateProfile } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { z } from "zod";
import { fieldErrors } from "@/lib/auth-flow";

const schema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(80),
  location: z.string().trim().max(120).optional(),
  phone: z.string().trim().regex(/^([0-9]{10})?$/, "Enter a 10-digit phone number").optional(),
  bio: z.string().optional(),
});

export default function EditProfile() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const locRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const [f, setF] = useState({ displayName: user?.displayName ?? "", location: user?.location ?? "", phone: user?.phone ?? "", bio: user?.bio ?? "" });
  const [avatar, setAvatar] = useState<string | undefined>(undefined); // new data URL
  const prefilled = useRef(!!user);
  useEffect(() => {
    // Deep links can open this screen before the profile has loaded - fill the form once it arrives.
    if (user && !prefilled.current) {
      prefilled.current = true;
      setF({ displayName: user.displayName ?? "", location: user.location ?? "", phone: user.phone ?? "", bio: user.bio ?? "" });
    }
  }, [user]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return <SignInPrompt icon="person-outline" title="Log in to edit your profile" message="Sign in to update your details." />;

  const pick = async () => {
    setFormError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { setFormError("Allow photo access in Settings to change your picture."); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (res.canceled || !res.assets[0]) return;
      const ctx = ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 256 });
      const img = await ctx.renderAsync();
      const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
      if (out.base64) setAvatar(`data:image/jpeg;base64,${out.base64}`);
    } catch {
      setFormError("Couldn't use that photo. Please try another.");
    }
  };

  const submit = async () => {
    setFormError(null);
    const r = schema.safeParse({ ...f, phone: normalizePhone(f.phone) });
    if (!r.success) { setErrors(fieldErrors(r.error.issues)); return; }
    setErrors({});
    setBusy(true);
    try {
      await updateProfile({ displayName: r.data.displayName, location: r.data.location, phone: r.data.phone, bio: user.bio ?? undefined, ...(avatar ? { avatarUrl: avatar } : {}) });
      await refresh();
      router.back();
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const letter = ((f.displayName || user.displayName).trim()[0] ?? "?").toUpperCase();
  const photo = avatar ?? user.avatarUrl;

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerTitleAlign: "center" }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel="Change profile photo">
              {photo ? (
                <Avatar name={f.displayName || user.displayName} uri={photo} size={80} />
              ) : (
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.clay[600], alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: fonts.extrabold, fontSize: 33 }} color="#fff">{letter}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={pick} hitSlop={10} accessibilityRole="button" accessibilityLabel="Change photo">
              <Text style={{ fontFamily: fonts.bold, fontSize: 14.5 }} color={colors.clay[600]}>Change photo</Text>
            </Pressable>
          </View>
          {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
          <Field label="Display name *" value={f.displayName} onChangeText={(v) => setF({ ...f, displayName: v })} error={errors.displayName} autoComplete="name" returnKeyType="next" onSubmitEditing={() => locRef.current?.focus()} />
          <Field ref={locRef} label="Location" value={f.location} onChangeText={(v) => setF({ ...f, location: v })} error={errors.location} placeholder="City, State" hint="Shown on your listings" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} />
          <Field ref={phoneRef} label="Phone number" value={f.phone} onChangeText={(v) => setF({ ...f, phone: v })} error={errors.phone} placeholder="+91 98xxxxxxxx" hint="Optional – not shown publicly" keyboardType="phone-pad" maxLength={16} />
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.ink[100], backgroundColor: "#fff" }}>
          <Button title="Save changes" onPress={submit} loading={busy} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
