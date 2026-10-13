import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { colors, fonts } from "@/theme";

/** Soft pastel tiles with a big dark letter - the placeholder look from the mobile designs. */
const TILES = [
  { bg: "#ffe4d8", fg: "#b43010" },
  { bg: "#d5f6ef", fg: "#1a6a63" },
  { bg: "#e4e6f5", fg: "#4a5270" },
  { bg: "#fff1d6", fg: "#9a5b00" },
];
export const tileFor = (seed: string) => TILES[(seed.charCodeAt(0) + seed.length) % TILES.length]!;

export function LetterTile({ letter, seed }: { letter: string; seed?: string }) {
  const t = tileFor(seed ?? letter);
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice">
      <Rect width="100" height="75" fill={t.bg} />
      <SvgText x="50" y="55" textAnchor="middle" fontSize="46" fontWeight="800" fontFamily={fonts.extrabold} fill={t.fg}>{letter.slice(0, 1).toUpperCase()}</SvgText>
    </Svg>
  );
}

/**
 * Listing photo. Real photos use expo-image; demo photo paths ("/api/demo-photo?t=Part...") and missing
 * photos render the pastel letter tile (first letter of `letter`, or of the demo title).
 */
export function Photo({ uri, style, contain, letter }: { uri: string | null | undefined; style?: StyleProp<ViewStyle>; contain?: boolean; letter?: string }) {
  let content: React.ReactNode;
  if (uri && uri.startsWith("/api/demo-photo")) {
    const q = new URLSearchParams(uri.split("?")[1] ?? "");
    const title = q.get("t") ?? letter ?? "P";
    content = <LetterTile letter={title} seed={title} />;
  } else if (uri) {
    content = <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit={contain ? "contain" : "cover"} transition={150} />;
  } else {
    content = <LetterTile letter={letter ?? "P"} seed={letter} />;
  }
  return <View style={[{ backgroundColor: colors.ink[100], overflow: "hidden", alignItems: "center", justifyContent: "center" }, style]}>{content}</View>;
}
