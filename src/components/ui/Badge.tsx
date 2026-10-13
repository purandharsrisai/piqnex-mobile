import React from "react";
import { View } from "react-native";
import { colors } from "@/theme";
import { Text } from "./Text";

const tones = {
  neutral: { bg: colors.ink[100], fg: colors.ink[700] },
  clay: { bg: colors.clay[100], fg: colors.clay[800] },
  moss: { bg: colors.moss[100], fg: colors.moss[800] },
  warn: { bg: colors.warnBg, fg: colors.warn },
  danger: { bg: colors.dangerBg, fg: colors.danger },
} as const;

export function Badge({ label, tone = "neutral" }: { label: string; tone?: keyof typeof tones }) {
  const t = tones[tone];
  return (
    <View style={{ backgroundColor: t.bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, alignSelf: "flex-start" }}>
      <Text variant="caption" color={t.fg}>{label}</Text>
    </View>
  );
}
