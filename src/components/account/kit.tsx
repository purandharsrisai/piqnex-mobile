import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type ViewStyle, type StyleProp } from "react-native";
import { useRouter } from "expo-router";
import { colors, fonts } from "@/theme";
import { Icon, Text, type IconName } from "@/components/ui";

export const RED = "#d92d20";

/** "+91 98765 43210" / "98765-43210" -> "9876543210" (last 10 digits when a country code is present). */
export function normalizePhone(v: string): string {
  let d = v.replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2);
  if (d.length > 10 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** Soft-bordered field with a bold label above, optional hint / error and an eye toggle for passwords. */
export const Field = React.forwardRef<TextInput, TextInputProps & {
  label?: string; hint?: string; error?: string; invalid?: boolean; password?: boolean; below?: React.ReactNode; wrapStyle?: StyleProp<ViewStyle>;
}>(function Field({ label, hint, error, invalid, password, below, wrapStyle, style, ...rest }, ref) {
  const [hidden, setHidden] = useState(true);
  const [focus, setFocus] = useState(false);
  const bad = invalid || !!error;
  return (
    <View style={[{ gap: 6 }, wrapStyle]}>
      {label ? <Text style={{ fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 }} color={colors.ink[900]}>{label}</Text> : null}
      <View style={[styles.box, focus && { borderColor: colors.clay[500] }, bad && { borderColor: RED }]}>
        <TextInput
          ref={ref}
          {...rest}
          secureTextEntry={password && hidden}
          onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
          placeholderTextColor={colors.ink[400]}
          accessibilityLabel={label ?? rest.placeholder}
          style={[styles.input, style]}
        />
        {password ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={12} accessibilityRole="button" accessibilityLabel={hidden ? "Show password" : "Hide password"}>
            <Icon name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={colors.ink[400]} />
          </Pressable>
        ) : null}
      </View>
      {below}
      {error ? <Text color={RED} style={{ fontSize: 13, lineHeight: 18 }}>{error}</Text> : hint ? <Text color={colors.ink[500]} style={{ fontSize: 13, lineHeight: 18 }}>{hint}</Text> : null}
    </View>
  );
});

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <View accessibilityRole="alert" style={{ backgroundColor: "#fff0ee", borderWidth: 1, borderColor: "#ffd5cc", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19 }} color={colors.clay[700]}>{children}</Text>
    </View>
  );
}

export function BackChevron() {
  const router = useRouter();
  return (
    <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} hitSlop={10} accessibilityRole="button" accessibilityLabel="Go back"
      style={{ width: 44, height: 44, marginLeft: -10, alignItems: "flex-start", justifyContent: "center", paddingLeft: 10 }}>
      <Icon name="chevron-back" size={26} color={colors.ink[900]} />
    </Pressable>
  );
}

export function IconTile({ icon, size = 60, bg = colors.clay[100], fg = colors.clay[600], radius = 18, iconSize }: { icon: IconName; size?: number; bg?: string; fg?: string; radius?: number; iconSize?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.42)} color={fg} />
    </View>
  );
}

export const titleStyle = { fontFamily: fonts.extrabold, fontSize: 31, lineHeight: 38, letterSpacing: -0.7 } as const;

const styles = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, borderWidth: 1, borderColor: colors.ink[200], borderRadius: 14, paddingHorizontal: 14, backgroundColor: "#fff" },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16.5, color: colors.ink[900], paddingVertical: 10 },
});
