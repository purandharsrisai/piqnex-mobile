import React from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/theme";
import { Text } from "./Text";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
      <ActivityIndicator color={colors.clay[600]} size="large" />
    </View>
  );
}

export function EmptyState({ icon = "file-tray-outline", title, message, actionLabel, onAction }: { icon?: IconName; title: string; message?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.clay[50], alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={28} color={colors.clay[600]} />
      </View>
      <Text variant="h3" center>{title}</Text>
      {message ? <Text color={colors.ink[500]} center>{message}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: 6 }} /> : null}
    </View>
  );
}

export function ErrorState({ message = "We couldn't load this.", onRetry }: { message?: string; onRetry?: () => void }) {
  return <EmptyState icon="cloud-offline-outline" title="Something went wrong" message={message} actionLabel={onRetry ? "Try again" : undefined} onAction={onRetry} />;
}
