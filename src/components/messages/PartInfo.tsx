import React from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Badge, Icon, Photo, Text } from "@/components/ui";
import type { ConversationThread } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

/** Compact part header under the nav bar: photo, name, price, status; taps through to the listing. */
export function PartInfo({ listing }: { listing: ConversationThread["listing"] }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/parts/${listing.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`View listing: ${listing.brandName} ${listing.productName} ${listing.partName}`}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.ink[100] }}
    >
      <Photo uri={listing.imageUrl} style={{ width: 48, height: 48, borderRadius: radius.md }} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="label" numberOfLines={1}>{listing.brandName} {listing.productName} - {listing.partName}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text variant="bodyMedium" color={colors.clay[700]} style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }}>{formatPrice(Number(listing.price), listing.currency)}</Text>
          {listing.status !== "active" ? <Badge label={listing.status} tone="neutral" /> : null}
        </View>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.ink[400]} />
    </Pressable>
  );
}
