import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { colors } from "@/theme";
import { Button, Input, Text } from "@/components/ui";
import { BottomSheet } from "@/components/listing/BottomSheet";
import { formatPrice } from "@/lib/utils";

/** Buyer's "Make an offer" sheet. Calls onSend with the exact website message format. */
export function OfferSheet({ visible, onClose, price, currency, onSend }: { visible: boolean; onClose: () => void; price: number; currency: string; onSend: (text: string) => void }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (visible) { setAmount(""); setError(null); } }, [visible]);

  function submit() {
    const n = Math.round(Number(amount.replace(/[^0-9.]/g, "")));
    if (!Number.isFinite(n) || n <= 0) { setError("Enter an amount greater than 0."); return; }
    onSend(`Offer: ${formatPrice(n, currency)} (listed at ${formatPrice(price, currency)})`);
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Make an offer">
      <Text color={colors.ink[500]}>Listed at {formatPrice(price, currency)}</Text>
      <Input label="Your offer (₹)" value={amount} onChangeText={(t) => { setAmount(t); setError(null); }} keyboardType="number-pad" placeholder="Your price" error={error ?? undefined} autoFocus onSubmitEditing={submit} returnKeyType="send" />
      <View style={{ marginTop: 4 }}><Button title="Send offer" icon="pricetag" onPress={submit} /></View>
    </BottomSheet>
  );
}
