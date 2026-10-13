import React from "react";
import { View } from "react-native";
import { colors, fonts } from "@/theme";
import { Icon, Photo, Text } from "@/components/ui";
import { publicImageUrl } from "@/lib/api";
import type { ChatMessage } from "@/lib/data";
import { OFFER_RE, PHOTO_RE } from "@/lib/message-format";
import { timeOf } from "./helpers";

export type Receipt = "seen" | "sent" | null;

/** One chat message: text bubble, offer card or photo bubble, with "Seen"/"Sent" under the last own message. */
export function MessageBubble({ m, mine, receipt }: { m: ChatMessage; mine: boolean; receipt: Receipt }) {
  const offer = OFFER_RE.exec(m.body);
  const photo = PHOTO_RE.exec(m.body);
  const faint = mine ? "rgba(255,255,255,0.8)" : colors.ink[400];
  // Footer inside the bubble: time, and for the latest own message a Sent/Seen status, right-aligned at the bottom corner.
  const time = (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 4 }}>
      <Text color={faint} style={{ fontSize: 12.5, lineHeight: 16 }}>{timeOf(m.createdAt)}</Text>
      {mine && receipt ? (
        <View accessibilityLabel={receipt === "seen" ? "Seen" : "Sent"} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Icon name={receipt === "seen" ? "checkmark-done" : "checkmark"} size={15} color={receipt === "seen" ? "#fff" : "rgba(255,255,255,0.8)"} />
          <Text style={{ fontSize: 12.5, lineHeight: 16, fontFamily: fonts.bold }} color={receipt === "seen" ? "#fff" : "rgba(255,255,255,0.8)"}>{receipt === "seen" ? "Seen" : "Sent"}</Text>
        </View>
      ) : null}
    </View>
  );
  const align = { alignItems: mine ? ("flex-end" as const) : ("flex-start" as const) };

  let bubble: React.ReactNode;
  if (photo) {
    const raw = photo[1] as string;
    const src = raw.startsWith("data:") ? raw : publicImageUrl(raw);
    bubble = (
      <View style={{ width: 230, padding: 4, borderRadius: 18, borderBottomRightRadius: mine ? 4 : 18, borderBottomLeftRadius: mine ? 18 : 4, backgroundColor: mine ? colors.clay[600] : "#f1f2f8" }}>
        <Photo uri={src} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 14 }} />
        <View style={{ paddingHorizontal: 8, paddingBottom: 4 }}>{time}</View>
      </View>
    );
  } else if (offer) {
    bubble = (
      <View style={{ width: 230, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, borderBottomRightRadius: mine ? 4 : 18, borderBottomLeftRadius: mine ? 18 : 4, backgroundColor: mine ? colors.clay[600] : "#f1f2f8" }}>
        <Text variant="caption" color={mine ? "rgba(255,255,255,0.85)" : colors.clay[600]} style={{ textTransform: "uppercase", letterSpacing: 0.8 }}>{mine ? "Your offer" : "Offer"}</Text>
        <Text variant="h1" color={mine ? "#fff" : colors.ink[900]} style={{ fontSize: 26 }}>{offer[1]}</Text>
        {offer[2] ? <Text variant="small" color={mine ? "rgba(255,255,255,0.85)" : colors.ink[500]}>Listed at {offer[2]}</Text> : null}
        {time}
      </View>
    );
  } else {
    bubble = (
      <View style={{ maxWidth: "80%", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderBottomRightRadius: mine ? 4 : 18, borderBottomLeftRadius: mine ? 18 : 4, backgroundColor: mine ? colors.clay[600] : "#f1f2f8" }}>
        <Text color={mine ? "#fff" : colors.ink[900]} selectable style={{ fontSize: 16.5, lineHeight: 23 }}>{m.body}</Text>
        {time}
      </View>
    );
  }

  return (
    <View style={[{ gap: 3 }, align]}>
      {bubble}
    </View>
  );
}
