import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { colors, fonts } from "@/theme";
import { Button, Icon, Input, Text } from "@/components/ui";
import { reportItem } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { BottomSheet } from "./BottomSheet";

export const REPORT_REASONS = [
  { value: "scam", label: "Looks like a scam or fake" },
  { value: "misleading", label: "Wrong or misleading details" },
  { value: "prohibited", label: "Prohibited or unsafe item" },
  { value: "spam", label: "Spam or duplicate" },
  { value: "other", label: "Something else" },
];

export function ReportSheet({ visible, onClose, targetType, targetId }: { visible: boolean; onClose: () => void; targetType: "listing" | "user" | "message" | "conversation"; targetId: string }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => { if (visible) { setReason(""); setDetails(""); setError(null); setDone(false); } }, [visible]);

  const submit = async () => {
    if (!reason) { setError("Please choose a reason."); return; }
    setBusy(true); setError(null);
    try { await reportItem(targetType, targetId, reason, reason === "other" ? details.trim() : ""); setDone(true); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };

  const noun = targetType === "user" ? "user" : targetType;
  return (
    <BottomSheet visible={visible} onClose={onClose} title={`Report this ${noun}`}>
      {done ? (
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 12 }}>
          <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: colors.moss[100], alignItems: "center", justifyContent: "center" }}>
            <Icon name="checkmark" size={32} color={colors.moss[700]} />
          </View>
          <Text style={{ fontFamily: fonts.extrabold, fontSize: 20, lineHeight: 26 }} center>Report sent</Text>
          <Text color={colors.ink[500]} center style={{ fontSize: 15.5, lineHeight: 22 }}>Thanks for letting us know. Our team will review it. {targetType === "user" ? "They won't be told it was you." : ""}</Text>
          <View style={{ alignSelf: "stretch", marginTop: 8 }}><Button title="Done" onPress={onClose} /></View>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.clay[50] }}>
            <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
              <Icon name="flag-outline" size={20} color={colors.clay[600]} />
            </View>
            <Text style={{ flex: 1, fontSize: 14.5, lineHeight: 20 }} color={colors.clay[700]}>{targetType === "user" ? "Reports are private. We review every one and may remove accounts that break the rules." : "Reports are private and reviewed by our team."}</Text>
          </View>
          <Text style={{ fontFamily: fonts.bold, fontSize: 16 }}>Why are you reporting it?</Text>
          <View style={{ gap: 10 }}>
            {REPORT_REASONS.map((r) => {
              const on = reason === r.value;
              return (
                <Pressable key={r.value} onPress={() => { setReason(r.value); setError(null); }} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={r.label}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: 16, borderWidth: on ? 1.5 : 1, borderColor: on ? colors.clay[600] : colors.ink[100], backgroundColor: on ? colors.clay[50] : "#fff" }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? colors.clay[600] : colors.ink[200], alignItems: "center", justifyContent: "center" }}>
                    {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.clay[600] }} /> : null}
                  </View>
                  <Text style={{ flex: 1, fontFamily: on ? fonts.bold : fonts.medium, fontSize: 16, lineHeight: 22 }}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {reason === "other" ? <Input value={details} onChangeText={setDetails} multiline maxLength={1000} placeholder="Tell us what's wrong (optional)" /> : null}
          {error ? <Text color={colors.danger} accessibilityRole="alert" style={{ fontSize: 14.5 }}>{error}</Text> : null}
          <Button title="Submit report" onPress={submit} loading={busy} />
        </View>
      )}
    </BottomSheet>
  );
}
