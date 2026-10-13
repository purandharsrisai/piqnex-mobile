import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { colors, fonts } from "@/theme";
import { Avatar, Button, Icon, Text, type IconName } from "@/components/ui";
import { SheetShell } from "./ActionSheet";

const EFFECTS: { icon: IconName; text: string }[] = [
  { icon: "chatbubble-outline", text: "You won't be able to message each other" },
  { icon: "eye-off-outline", text: "Their listings and messages are hidden from you" },
];

/** Confirmation sheet for "Block user" (replaces the plain system alert). onConfirm may throw; the sheet shows the message. */
export function BlockSheet({ visible, onClose, name, avatarUrl, onConfirm }: { visible: boolean; onClose: () => void; name: string; avatarUrl: string | null; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (visible) { setBusy(false); setError(null); } }, [visible]);

  async function confirm() {
    setBusy(true); setError(null);
    try { await onConfirm(); }
    catch (e) { setError(e instanceof Error ? e.message : "Couldn't block this user. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <SheetShell visible={visible} onClose={() => { if (!busy) onClose(); }}>
      <View style={{ alignItems: "center", paddingHorizontal: 24, paddingTop: 14 }}>
        <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
          <Avatar name={name} uri={avatarUrl} size={76} />
          <View style={{ position: "absolute", right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: "#b3261e", borderWidth: 3, borderColor: "#fff", alignItems: "center", justifyContent: "center" }}>
            <Icon name="ban" size={14} color="#fff" />
          </View>
        </View>
        <Text center style={{ fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 30, marginTop: 14, letterSpacing: -0.4 }}>Block {name}?</Text>
        <Text center color={colors.ink[500]} style={{ fontSize: 15.5, lineHeight: 22, marginTop: 4 }}>They won't be able to contact you about your listings.</Text>
      </View>

      <View style={{ marginHorizontal: 20, marginTop: 18, padding: 14, gap: 14, borderRadius: 18, backgroundColor: colors.ink[50] }}>
        {EFFECTS.map((e) => (
          <View key={e.text} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
              <Icon name={e.icon} size={18} color={colors.ink[700]} />
            </View>
            <Text style={{ flex: 1, fontSize: 15.5, lineHeight: 21 }}>{e.text}</Text>
          </View>
        ))}
      </View>

      {error ? <Text accessibilityRole="alert" color={colors.danger} style={{ marginHorizontal: 20, marginTop: 12, fontSize: 14.5 }}>{error}</Text> : null}

      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 }}>
        <View style={{ flex: 1 }}><Button title="Cancel" variant="outline" onPress={onClose} disabled={busy} /></View>
        <View style={{ flex: 1 }}><Button title="Block" variant="destructive" onPress={confirm} loading={busy} /></View>
      </View>
    </SheetShell>
  );
}
