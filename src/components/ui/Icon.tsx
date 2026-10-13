import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function Icon({ name, size = 22, color = colors.ink[700] }: { name: IconName; size?: number; color?: import("react-native").ColorValue }) {
  return <Ionicons name={name} size={size} color={color} />;
}
