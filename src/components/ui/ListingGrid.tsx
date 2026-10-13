import React from "react";
import { View, useWindowDimensions } from "react-native";
import type { ListingCardData } from "@/lib/data";
import { ListingCard } from "./ListingCard";

/** Two-column grid of ListingCards (non-scrolling; put inside a ScrollView/FlatList header/footer). */
export function ListingGrid({ items, padding = 16 }: { items: ListingCardData[]; padding?: number }) {
  const { width } = useWindowDimensions();
  const gap = 12;
  const cardW = Math.floor((Math.min(width, 640) - padding * 2 - gap) / 2);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
      {items.map((l) => <ListingCard key={l.id} item={l} width={cardW} />)}
    </View>
  );
}
