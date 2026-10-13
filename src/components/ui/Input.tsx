import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { colors, fonts, radius } from "@/theme";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: IconName;
}

export const Input = React.forwardRef<TextInput, InputProps>(function Input({ label, error, hint, icon, secureTextEntry, multiline, style, ...rest }, ref) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text variant="label" color={colors.ink[700]}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.focused, !!error && styles.err, multiline && { alignItems: "flex-start" }]}>
        {icon ? <Icon name={icon} size={18} color={colors.ink[400]} /> : null}
        <TextInput
          ref={ref}
          {...rest}
          multiline={multiline}
          secureTextEntry={secureTextEntry && hidden}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          placeholderTextColor={colors.ink[400]}
          style={[styles.input, multiline && { minHeight: 92, textAlignVertical: "top", paddingTop: 12 }, style]}
          accessibilityLabel={label ?? rest.placeholder}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? "Show password" : "Hide password"}>
            <Icon name={hidden ? "eye-outline" : "eye-off-outline"} size={19} color={colors.ink[400]} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text variant="small" color={colors.danger}>{error}</Text> : hint ? <Text variant="small" color={colors.ink[500]}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 50, borderWidth: 1, borderColor: colors.ink[200], borderRadius: 14, paddingHorizontal: 14, backgroundColor: "#fff" },
  focused: { borderColor: colors.clay[500] },
  err: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15.5, color: colors.ink[900], paddingVertical: 10 },
});
