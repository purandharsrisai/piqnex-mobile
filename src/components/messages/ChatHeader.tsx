import React from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "@/theme";
import { Avatar, Icon, Text } from "@/components/ui";
import { ActionRow, CancelButton, SheetShell } from "./ActionSheet";

/** Custom chat header: back chevron, avatar, name, "About: part · price" and a "..." menu button. */
export function ChatHeader({ name, avatarUrl, about, onBack, onOpenListing, onMenu }: { name: string; avatarUrl: string | null; about: string; onBack: () => void; onOpenListing?: () => void; onMenu?: () => void }) {
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, gap: 4 }}>
        <Pressable onPress={onBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Icon name="chevron-back" size={24} color={colors.ink[900]} />
        </Pressable>
        <Pressable onPress={onOpenListing} accessibilityRole="button" accessibilityLabel={`${name}, ${about}. Open listing`} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.clay[100], alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Avatar name={name} uri={avatarUrl} size={38} />
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: 17.5, lineHeight: 23 }}>{name}</Text>
            <Text numberOfLines={1} color={colors.ink[500]} style={{ fontSize: 13.5, lineHeight: 18 }}>{about}</Text>
          </View>
        </Pressable>
        {onMenu ? (
          <Pressable onPress={onMenu} hitSlop={8} accessibilityRole="button" accessibilityLabel="More options" style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Icon name="ellipsis-horizontal" size={22} color={colors.ink[700]} />
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export function SafetyBanner() {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.clay[50] }}>
      <Icon name="shield-outline" size={16} color={colors.clay[600]} />
      <Text variant="small" color={colors.clay[700]} style={{ flex: 1, fontSize: 14, lineHeight: 19 }}>Meet in public places. Never pay in advance.</Text>
    </View>
  );
}

/** Bottom sheet from the "..." menu (design: Block or report user). */
export function ChatActionSheet({ visible, onClose, name, avatarUrl, onBlock, onReport, onViewListing }: { visible: boolean; onClose: () => void; name: string; avatarUrl: string | null; onBlock: () => void; onReport: () => void; onViewListing: () => void }) {
  const run = (fn: () => void) => () => { onClose(); setTimeout(fn, 250); };
  const divider = <View style={{ height: 1, backgroundColor: colors.ink[100], marginLeft: 78, marginRight: 20 }} />;
  return (
    <SheetShell visible={visible} onClose={onClose}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 }}>
        <Avatar name={name} uri={avatarUrl} size={48} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: fonts.extrabold, fontSize: 19, lineHeight: 25 }}>{name}</Text>
          <Text style={{ fontSize: 14, lineHeight: 19 }} color={colors.ink[500]}>Conversation options</Text>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: colors.ink[100] }} />
      <ActionRow icon="pricetag-outline" label="View listing" hint="Open the part this chat is about" onPress={run(onViewListing)} />
      {divider}
      <ActionRow icon="flag-outline" label="Report user" hint="Tell us if something isn't right" tone="accent" onPress={run(onReport)} />
      {divider}
      <ActionRow icon="ban-outline" label="Block user" hint="Hides their listings and messages" tone="danger" onPress={run(onBlock)} />
      <CancelButton onPress={onClose} />
    </SheetShell>
  );
}
