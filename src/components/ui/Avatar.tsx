import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { colors, fonts } from "@/theme";
import { publicImageUrl } from "@/lib/api";
import { initials } from "@/lib/utils";
import { Text } from "./Text";

const TINTS = [colors.clay[200], colors.moss[200], "#c9d3ff", "#ffe2a8", "#f5c6e0"];

export function Avatar({ name, uri, size = 40 }: { name: string; uri?: string | null; size?: number }) {
  const url = publicImageUrl(uri);
  const tint = TINTS[(name.charCodeAt(0) || 0) % TINTS.length];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {url && !url.startsWith("/api/demo-photo") ? (
        <Image source={{ uri: url }} style={{ width: size, height: size }} />
      ) : (
        <Text numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.36 * 1.35), textAlign: "center", includeFontPadding: false, width: size, paddingHorizontal: 2 }} color={colors.ink[800]}>{initials(name)}</Text>
      )}
    </View>
  );
}
