import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { colors, fonts } from "@/theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export type DialogButton = { text?: string; style?: "default" | "cancel" | "destructive"; onPress?: () => void };
type Spec = { title: string; message?: string; buttons: DialogButton[] };

let push: ((s: Spec) => void) | null = null;

/** Drop-in replacement for react-native's Alert.alert that shows the app's styled dialog (and works on web). */
export const Alert = {
  alert(title: string, message?: string, buttons?: DialogButton[]) {
    const spec: Spec = { title, message, buttons: buttons && buttons.length ? buttons : [{ text: "OK" }] };
    if (push) push(spec);
  },
};

const RED = "#b3261e";

function look(spec: Spec): { icon: IconName; bg: string; fg: string } {
  if (spec.buttons.length > 2) return { icon: "ellipsis-horizontal-circle-outline", bg: colors.clay[50], fg: colors.clay[600] };
  if (spec.buttons.some((b) => b.style === "destructive")) return { icon: "warning-outline", bg: "#fdecea", fg: RED };
  if (/couldn't|can't|unavailable|needed|not sent/i.test(spec.title)) return { icon: "alert-circle-outline", bg: "#fdecea", fg: RED };
  if (/^saved|blocked|done|sent/i.test(spec.title)) return { icon: "checkmark-circle-outline", bg: colors.moss[100], fg: colors.moss[700] };
  return { icon: "information-circle-outline", bg: colors.clay[50], fg: colors.clay[600] };
}

/** Mount once near the root (inside the providers). */
export function DialogHost() {
  const [queue, setQueue] = useState<Spec[]>([]);
  useEffect(() => {
    push = (s) => setQueue((q) => [...q, s]);
    return () => { push = null; };
  }, []);
  const spec = queue[0];
  const closing = useRef(false);

  const close = useCallback((after?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    setQueue((q) => q.slice(1));
    setTimeout(() => { closing.current = false; after?.(); }, 80);
  }, []);

  if (!spec) return null;
  const l = look(spec);
  const stacked = spec.buttons.length > 2;
  // Cancel goes first in a side-by-side pair and last in a stack.
  const ordered = stacked ? [...spec.buttons.filter((b) => b.style !== "cancel"), ...spec.buttons.filter((b) => b.style === "cancel")] : [...spec.buttons].sort((a, b) => (a.style === "cancel" ? -1 : 0) - (b.style === "cancel" ? -1 : 0));
  const primaryIdx = ordered.findIndex((b) => b.style !== "cancel");

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => close()}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,18,40,0.5)" }} onPress={() => close()} accessibilityLabel="Dismiss" />
        <View accessibilityViewIsModal style={{ width: "100%", maxWidth: 360, backgroundColor: "#fff", borderRadius: 28, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22, alignItems: "center", shadowColor: "#0f1228", shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 18 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: l.bg, alignItems: "center", justifyContent: "center" }}>
            <Icon name={l.icon} size={30} color={l.fg} />
          </View>
          <Text center accessibilityRole="header" style={{ fontFamily: fonts.extrabold, fontSize: 21, lineHeight: 28, letterSpacing: -0.3, marginTop: 16 }}>{spec.title}</Text>
          {spec.message ? <Text center color={colors.ink[500]} style={{ fontSize: 15.5, lineHeight: 22, marginTop: 6 }}>{spec.message}</Text> : null}
          <View style={{ alignSelf: "stretch", flexDirection: stacked ? "column" : "row", gap: 10, marginTop: 22 }}>
            {ordered.map((b, i) => {
              const cancel = b.style === "cancel";
              const destructive = b.style === "destructive";
              // Pairs: Cancel outlined + one solid action. Menus (3+): soft grey actions, red-tinted Delete, plain Cancel.
              const solid = !stacked && !cancel;
              const bg = solid ? (destructive ? RED : colors.clay[600]) : stacked && destructive ? "#fdecea" : stacked && !cancel ? colors.ink[50] : "#fff";
              const border = stacked ? 0 : cancel ? 1.5 : 0;
              const fg = solid ? "#fff" : destructive ? RED : colors.ink[900];
              return (
                <Pressable
                  key={`${b.text}-${i}`}
                  onPress={() => close(b.onPress)}
                  accessibilityRole="button"
                  style={({ pressed }) => ({ flex: stacked ? undefined : 1, minHeight: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, borderWidth: border, borderColor: colors.ink[200], backgroundColor: bg, opacity: pressed ? 0.75 : 1 })}
                >
                  <Text center numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 }} color={fg}>{b.text ?? "OK"}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
