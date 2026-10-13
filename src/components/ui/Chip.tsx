import React from "react";
import { Pressable } from "react-native";
import { colors } from "@/theme";
import { Text } from "./Text";

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: selected ? colors.clay[600] : colors.ink[200], backgroundColor: selected ? colors.clay[600] : "#fff" }}
    >
      <Text variant="label" color={selected ? "#fff" : colors.ink[700]}>{label}</Text>
    </Pressable>
  );
}
