import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { colors, radius } from "@/theme";
import { Text } from "./Text";
import { Icon } from "./Icon";

export interface Option { value: string; label: string }

/** A dropdown that opens a bottom sheet list. */
export function SelectField({ label, value, options, onChange, placeholder = "Select", error, allowClear }: {
  label?: string; value: string; options: Option[]; onChange: (v: string) => void; placeholder?: string; error?: string; allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text variant="label" color={colors.ink[700]}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        style={{ minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: error ? colors.danger : colors.ink[200], borderRadius: radius.lg, paddingHorizontal: 14, backgroundColor: "#fff" }}
      >
        <Text color={current ? colors.ink[900] : colors.ink[400]} style={{ fontSize: 15.5 }}>{current?.label ?? placeholder}</Text>
        <Icon name="chevron-down" size={18} color={colors.ink[400]} />
      </Pressable>
      {error ? <Text variant="small" color={colors.danger}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(15,18,40,0.45)" }} onPress={() => setOpen(false)} />
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: "70%", paddingBottom: 24 }}>
          <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text variant="h3">{label ?? placeholder}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10} accessibilityLabel="Close"><Icon name="close" /></Pressable>
          </View>
          <ScrollView>
            {allowClear ? (
              <Pressable onPress={() => { onChange(""); setOpen(false); }} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text color={colors.ink[500]}>Any</Text>
              </Pressable>
            ) : null}
            {options.map((o) => (
              <Pressable key={o.value} onPress={() => { onChange(o.value); setOpen(false); }} style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.ink[100] }}>
                <Text variant="bodyMedium" color={o.value === value ? colors.clay[700] : colors.ink[900]}>{o.label}</Text>
                {o.value === value ? <Icon name="checkmark" color={colors.clay[600]} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
