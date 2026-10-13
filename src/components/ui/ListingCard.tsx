import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import type { ListingCardData } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Text } from "./Text";
import { Photo } from "./Photo";

const SHORT: Record<string, string> = { "Used - Working": "Used", "Used - Good": "Good", "Used - Fair": "Fair", "For Parts": "For parts" };
export const conditionShort = (c: string) => SHORT[c] ?? c;

/** Grid card (Home, Browse, Saved, seller pages): photo with condition tag, name + price row, brand/model line. */
export function ListingCard({ item, width, sold }: { item: ListingCardData; width?: number | `${number}%`; sold?: boolean }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/parts/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.brand} ${item.part}, ${formatPrice(item.price)}`}
      style={({ pressed }) => [styles.card, { width: width ?? "100%", opacity: pressed ? 0.9 : 1 }]}
    >
      <View>
        <Photo uri={item.imageUrl} letter={item.part} style={{ aspectRatio: 1.15, width: "100%" }} />
        <View style={styles.tag}><Text variant="caption" color={colors.ink[900]} style={{ fontFamily: "PlusJakartaSans_700Bold" }}>{sold ? "Sold" : conditionShort(item.condition)}</Text></View>
      </View>
      <View style={{ padding: 10, gap: 2 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
          <Text variant="label" numberOfLines={2} style={{ flex: 1, fontFamily: "PlusJakartaSans_700Bold" }}>{item.part}</Text>
          <Text variant="label" style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }}>{formatPrice(item.price)}</Text>
        </View>
        <Text variant="caption" color={colors.ink[400]} numberOfLines={1}>{item.brand} · {item.product}{item.model ? ` ${item.model}` : ""}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.ink[100] },
  tag: { position: "absolute", top: 8, left: 8, backgroundColor: "#fff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
});
