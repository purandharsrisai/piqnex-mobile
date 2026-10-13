import React from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/theme";
import { Icon } from "@/components/ui";

/** Read-only stars (fractional rounded to nearest) or, with onChange, a tappable 1-5 row. */
export function StarRating({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const rounded = Math.round(value);
  return (
    <View style={{ flexDirection: "row", gap: onChange ? 6 : 2 }} accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Icon name={n <= rounded ? "star" : "star-outline"} size={size} color={n <= rounded ? "#f5a623" : colors.ink[300]} />;
        return onChange ? (
          <Pressable key={n} onPress={() => onChange(n)} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            {icon}
          </Pressable>
        ) : (
          <View key={n}>{icon}</View>
        );
      })}
    </View>
  );
}
