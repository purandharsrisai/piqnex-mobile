import React from "react";
import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import { colors, fonts } from "@/theme";

const variants: Record<string, TextStyle> = {
  h1: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 11.5, lineHeight: 15 },
};

export interface AppTextProps extends TextProps {
  variant?: keyof typeof variants;
  color?: string;
  center?: boolean;
}

export function Text({ variant = "body", color = colors.ink[900], center, style, ...rest }: AppTextProps) {
  return <RNText {...rest} style={[variants[variant], { color }, center && { textAlign: "center" }, style]} />;
}
