import React, { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { colors, fonts } from "@/theme";
import { Icon, Text } from "@/components/ui";
import { DEMO_MODE, errorMessage } from "@/lib/api";
import { sendMessage, uploadImage } from "@/lib/actions";
import { OfferSheet } from "./OfferSheet";
import { CancelButton, SheetShell } from "./ActionSheet";

const MAX_DATA_URL = 450_000;

/** Shrinks a picked photo to a small JPEG data URL (<= 450k chars), trying smaller sizes until it fits. */
async function shrinkToDataUrl(uri: string): Promise<string> {
  for (const [width, compress] of [[900, 0.6], [700, 0.5], [520, 0.4], [400, 0.35]] as const) {
    // manipulateAsync is the simplest API for a one-shot resize + base64 export.
    const r = await ImageManipulator.manipulateAsync(uri, [{ resize: { width } }], { compress, format: ImageManipulator.SaveFormat.JPEG, base64: true });
    if (r.base64) {
      const url = `data:image/jpeg;base64,${r.base64}`;
      if (url.length <= MAX_DATA_URL) return url;
    }
  }
  throw new Error("too large");
}

export function Composer({
  conversationId, suggestions, offer, unavailable, onSent,
}: {
  conversationId: string;
  /** Quick replies; pass [] once I have already written in this conversation. */
  suggestions: string[];
  offer?: { price: number; currency: string };
  /** e.g. "sold" - disables sending. */
  unavailable: string | null;
  onSent: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const disabled = !!unavailable;

  async function send(body: string, clear = false) {
    const t = body.trim();
    if (!t || busy || disabled) return;
    setBusy(true);
    setError(null);
    try {
      await sendMessage(conversationId, t);
      if (clear) setText("");
      onSent();
    } catch (e) {
      setError(errorMessage(e, "Couldn't send your message. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function pickPhoto() {
    if (busy || photoBusy || disabled) return;
    setError(null);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1, allowsEditing: false });
      if (res.canceled || !res.assets[0]) return;
      setPhotoBusy(true);
      const dataUrl = await shrinkToDataUrl(res.assets[0].uri);
      let ref: string | null = dataUrl;
      if (!DEMO_MODE) {
        ref = await uploadImage("chat-photo.jpg");
        if (!ref) { setError("Photo sharing isn't available yet - photo storage hasn't been set up."); return; }
      }
      await sendMessage(conversationId, `Photo: ${ref}`);
      onSent();
    } catch (e) {
      const msg = e instanceof Error && e.message === "too large" ? "That photo is too large. Try a smaller one." : errorMessage(e, "Couldn't send the photo. Please try again.");
      setError(msg);
      if (Platform.OS !== "web" && !(e instanceof Error && e.message === "too large")) Alert.alert("Photo not sent", msg);
    } finally {
      setPhotoBusy(false);
    }
  }

  const canSend = text.trim().length > 0 && !busy && !disabled;

  return (
    <View>
      <View style={{ borderTopWidth: 1, borderTopColor: colors.ink[100], backgroundColor: "#fff" }}>
        {unavailable ? (
          <View accessibilityRole="alert" style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", padding: 12, backgroundColor: colors.warnBg }}>
            <Icon name="alert-circle" size={18} color={colors.warn} />
            <Text variant="small" color={colors.warn} style={{ flex: 1 }}>This part is {unavailable} and isn't available any more, so you can't send new messages. You can still read this conversation.</Text>
          </View>
        ) : suggestions.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 10 }} accessibilityLabel="Quick replies">
            {suggestions.map((s) => (
              <Pressable key={s} onPress={() => setText(s)} accessibilityRole="button" style={{ minHeight: 34, justifyContent: "center", paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.ink[100] }}>
                <Text variant="label" color={colors.ink[700]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {error ? <Text variant="small" color={colors.danger} accessibilityRole="alert" style={{ paddingHorizontal: 16, paddingTop: 8 }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Pressable onPress={() => setAttachOpen(true)} disabled={disabled} accessibilityRole="button" accessibilityLabel="Attach" style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink[100], opacity: disabled ? 0.5 : 1 }}>
            {photoBusy ? <ActivityIndicator color={colors.clay[600]} /> : <Icon name="add" size={22} color={colors.ink[700]} />}
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            editable={!disabled}
            placeholder={disabled ? "Messaging is disabled" : "Write a message..."}
            placeholderTextColor={colors.ink[400]}
            accessibilityLabel="Message"
            maxLength={2000}
            style={{ flex: 1, maxHeight: 120, minHeight: 44, borderWidth: 1, borderColor: colors.ink[200], borderRadius: 22, paddingHorizontal: 18, paddingTop: Platform.OS === "ios" ? 12 : 8, paddingBottom: Platform.OS === "ios" ? 12 : 8, fontFamily: fonts.regular, fontSize: 16.5, color: colors.ink[900], backgroundColor: disabled ? colors.ink[50] : "#fff" }}
          />
          <Pressable onPress={() => send(text, true)} disabled={!canSend} accessibilityRole="button" accessibilityLabel="Send message" style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: canSend ? colors.clay[600] : colors.clay[300] }}>
            {busy ? <ActivityIndicator color="#fff" /> : <Icon name="paper-plane-outline" size={20} color="#fff" />}
          </Pressable>
        </View>
      </View>
      <SheetShell visible={attachOpen} onClose={() => setAttachOpen(false)}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontFamily: fonts.extrabold, fontSize: 20, lineHeight: 26 }}>Share in chat</Text>
          <Text style={{ fontSize: 14.5, lineHeight: 20 }} color={colors.ink[500]}>Send a photo or make an offer on this part.</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 14 }}>
          {[
            { key: "photo", label: "Photo", hint: "From your library", icon: "image-outline" as const, bg: colors.moss[100], fg: colors.moss[700], on: pickPhoto, show: true },
            { key: "offer", label: "Make an offer", hint: "Suggest a price", icon: "pricetag-outline" as const, bg: colors.clay[50], fg: colors.clay[600], on: () => setOfferOpen(true), show: !!offer },
          ].filter((o) => o.show).map((o) => (
            <Pressable
              key={o.key}
              onPress={() => { setAttachOpen(false); setTimeout(o.on, 250); }}
              accessibilityRole="button"
              accessibilityLabel={o.label}
              style={({ pressed }) => ({ flex: 1, minHeight: 124, borderRadius: 20, borderWidth: 1, borderColor: colors.ink[100], padding: 14, gap: 10, justifyContent: "space-between", backgroundColor: pressed ? colors.ink[50] : "#fff" })}
            >
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: o.bg, alignItems: "center", justifyContent: "center" }}>
                <Icon name={o.icon} size={24} color={o.fg} />
              </View>
              <View>
                <Text style={{ fontFamily: fonts.bold, fontSize: 16.5, lineHeight: 22 }}>{o.label}</Text>
                <Text style={{ fontSize: 14, lineHeight: 19 }} color={colors.ink[500]}>{o.hint}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <CancelButton onPress={() => setAttachOpen(false)} />
      </SheetShell>
      {offer ? <OfferSheet visible={offerOpen} onClose={() => setOfferOpen(false)} price={offer.price} currency={offer.currency} onSend={(t) => send(t)} /> : null}
    </View>
  );
}
