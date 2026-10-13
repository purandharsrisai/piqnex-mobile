import React from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from "react-native-svg";
import { colors } from "@/theme";
import { Text } from "./Text";

/** Piqnex logo: rounded tile with a bold white "P" and a small teal "piece" docking beside it (same as the website). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="lg" x1="8" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ff7a4d" />
          <Stop offset="1" stopColor="#d23510" />
        </LinearGradient>
      </Defs>
      <Rect x={2} y={2} width={60} height={60} rx={18} fill="url(#lg)" />
      <Path d="M21 47V17h10.5a11 11 0 0 1 0 22H21" fill="none" stroke="#fff" strokeWidth={8.5} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={40} y={41} width={12} height={12} rx={3.5} fill="#7cd8ca" transform="rotate(12 46 47)" />
    </Svg>
  );
}

export function Logo({ size = 36, onDark }: { size?: number; onDark?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <LogoMark size={size} />
      <Text variant="h2" color={onDark ? "#fff" : colors.ink[900]} style={{ fontSize: size * 0.7 }}>
        Piq<Text variant="h2" color={onDark ? colors.clay[400] : colors.clay[600]} style={{ fontSize: size * 0.7 }}>nex</Text>
      </Text>
    </View>
  );
}
