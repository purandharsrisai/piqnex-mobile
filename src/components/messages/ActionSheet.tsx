import React from "react";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "@/theme";
import { Icon, Text, type IconName } from "@/components/ui";

/** Shared bottom sheet shell for the chat menus: dimmed backdrop, grab handle, rounded top, safe-area aware. */
export function SheetShell({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,18,40,0.45)" }} onPress={onClose} accessibilityLabel="Close menu" />
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", width: "100%", maxWidth: 560, alignSelf: "center" }}>
          <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.ink[200] }} />
          </View>
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export type Tone = "neutral" | "accent" | "danger";
const TONES: Record<Tone, { bg: string; fg: string; text: string }> = {
  neutral: { bg: colors.ink[50], fg: colors.ink[800], text: colors.ink[900] },
  accent: { bg: colors.clay[50], fg: colors.clay[600], text: colors.ink[900] },
  danger: { bg: "#fdecea", fg: "#b3261e", text: "#b3261e" },
};

/** One row of the "..." menu: tinted icon tile, bold label, short description and a chevron. */
export function ActionRow({ icon, label, hint, tone = "neutral", onPress }: { icon: IconName; label: string; hint?: string; tone?: Tone; onPress: () => void }) {
  const t = TONES[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ minHeight: 68, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, backgroundColor: pressed ? colors.ink[50] : "#fff" })}
    >
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: t.bg, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={22} color={t.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 16.5, lineHeight: 22 }} color={t.text}>{label}</Text>
        {hint ? <Text style={{ fontSize: 14, lineHeight: 19 }} color={colors.ink[500]}>{hint}</Text> : null}
      </View>
      <Icon name="chevron-forward" size={18} color={colors.ink[300]} />
    </Pressable>
  );
}

/** Pill-shaped Cancel button used at the bottom of the sheets. */
export function CancelButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 }}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Cancel" style={({ pressed }) => ({ minHeight: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.ink[200], alignItems: "center", justifyContent: "center", backgroundColor: pressed ? colors.ink[50] : "#fff" })}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 16 }}>Cancel</Text>
      </Pressable>
    </View>
  );
}
