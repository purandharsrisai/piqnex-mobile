import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, fonts, radius } from "@/theme";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "destructive";

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.clay[600], fg: "#fff", border: colors.clay[600] },
  secondary: { bg: colors.ink[900], fg: "#fff", border: colors.ink[900] },
  outline: { bg: "#fff", fg: colors.ink[800], border: colors.ink[200] },
  ghost: { bg: "transparent", fg: colors.clay[700], border: "transparent" },
  danger: { bg: "#fff", fg: colors.danger, border: "#f3b8b3" },
  destructive: { bg: "#b3261e", fg: "#fff", border: "#b3261e" },
};

export function Button({
  title, onPress, variant = "primary", loading, disabled, icon, iconNode, size = "md", style, fullWidth = true,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  /** Custom leading element (e.g. a brand logo) instead of an Ionicons icon. */
  iconNode?: React.ReactNode;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}) {
  const p = palette[variant];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.sm,
        { backgroundColor: p.bg, borderColor: p.border, opacity: off ? 0.55 : pressed ? 0.85 : 1 },
        !fullWidth && { alignSelf: "flex-start" },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {iconNode ?? (icon ? <Icon name={icon} size={size === "sm" ? 16 : 19} color={p.fg} /> : null)}
          <Text style={{ fontFamily: fonts.bold, fontSize: size === "sm" ? 13 : 15.5 }} color={p.fg}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 26, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  sm: { minHeight: 38, paddingHorizontal: 14, borderRadius: 19 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
