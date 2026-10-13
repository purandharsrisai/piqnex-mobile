import React, { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import { colors } from "@/theme";
import { Button, Icon, Input, Screen, SelectField, Text } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { sendSupportMessage } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { fieldErrors } from "@/lib/auth-flow";

const TOPICS = [
  { value: "account", label: "Account help" },
  { value: "listing", label: "Listings and requests" },
  { value: "report", label: "Reporting a problem" },
  { value: "feedback", label: "Feedback and ideas" },
  { value: "other", label: "Something else" },
];

// Mirrors the website's contact form validation.
const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  topic: z.enum(["account", "listing", "report", "feedback", "other"], { errorMap: () => ({ message: "Choose a topic" }) }),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000, "Please keep it under 2000 characters"),
});

export default function Contact() {
  const { user } = useAuth();
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const [f, setF] = useState({ name: user?.displayName ?? "", email: user?.email ?? "", topic: "account", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setFormError(null);
    const r = schema.safeParse(f);
    if (!r.success) { setErrors(fieldErrors(r.error.issues)); return; }
    setErrors({});
    setBusy(true);
    try {
      await sendSupportMessage(r.data);
      setDone(true);
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen contentStyle={{ gap: 14, paddingTop: 48, alignItems: "center" }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.moss[100], alignItems: "center", justifyContent: "center" }}>
          <Icon name="checkmark" size={30} color={colors.moss[700]} />
        </View>
        <Text variant="h2" center>Message sent</Text>
        <Text color={colors.ink[600]} center>Thanks for reaching out. We'll reply to {f.email} as soon as we can.</Text>
        <View style={{ alignSelf: "stretch", marginTop: 10 }}><Button title="Done" onPress={() => router.back()} /></View>
      </Screen>
    );
  }

  return (
    <Screen keyboard contentStyle={{ gap: 16, paddingBottom: 40 }}>
      <Text color={colors.ink[500]}>Questions, problems or ideas? Send us a note and we'll get back to you.</Text>
      {formError ? <Text color={colors.danger} style={{ backgroundColor: colors.dangerBg, padding: 12, borderRadius: 12 }} accessibilityRole="alert">{formError}</Text> : null}
      <Input label="Your name" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} error={errors.name} placeholder="e.g. Priya S." autoComplete="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />
      <Input ref={emailRef} label="Email" value={f.email} onChangeText={(v) => setF({ ...f, email: v })} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <SelectField label="What is this about?" value={f.topic} options={TOPICS} onChange={(v) => setF({ ...f, topic: v })} error={errors.topic} />
      <Input label="Message" value={f.message} onChangeText={(v) => setF({ ...f, message: v.slice(0, 2000) })} error={errors.message} multiline placeholder="Tell us how we can help..." hint="Include a link to the listing or request if it is about one. Please don't send passwords or payment details." />
      <Button title="Send message" icon="send" onPress={submit} loading={busy} />
    </Screen>
  );
}
