import React from "react";
import { View } from "react-native";
import { colors, radius } from "@/theme";
import { Text, Avatar } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { StarRating } from "./StarRating";

export interface ReviewItem { id: string; rating: number; comment: string; createdAt: string; reviewer: { id: string; displayName: string }; listing: { id: string; partName: string } }

export function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.ink[100], borderRadius: radius.lg, padding: 14, gap: 8, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Avatar name={review.reviewer.displayName} size={36} />
        <View style={{ flex: 1 }}>
          <Text variant="label" numberOfLines={1}>{review.reviewer.displayName}</Text>
          <Text variant="caption" color={colors.ink[500]}>{formatDate(review.createdAt)}</Text>
        </View>
        <StarRating value={review.rating} size={14} />
      </View>
      {review.comment ? <Text>{review.comment}</Text> : null}
      <Text variant="caption" color={colors.ink[400]}>For: {review.listing.partName}</Text>
    </View>
  );
}
