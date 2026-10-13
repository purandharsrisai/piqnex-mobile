import React from "react";
import { RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";

/** Standard screen wrapper: safe area, optional scrolling + pull-to-refresh, 16px side padding. */
export function Screen({
  children, scroll = true, padded = true, refreshing, onRefresh, edges = ["bottom"], style, contentStyle, keyboard,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: ("top" | "bottom" | "left" | "right")[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  keyboard?: boolean;
}) {
  const pad: ViewStyle = padded ? { paddingHorizontal: 16, paddingVertical: 16 } : {};
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.paper }, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1 }, pad, contentStyle]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={keyboard}
          showsVerticalScrollIndicator={false}
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.clay[600]} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
