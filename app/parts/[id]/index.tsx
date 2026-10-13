import React, { useState } from "react";
import { Pressable, ScrollView, Share, View, useWindowDimensions } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native";
import { colors, radius } from "@/theme";
import { Button, LetterTile, EmptyState, ErrorState, Icon, Input, Loading, Text } from "@/components/ui";
import { Photo } from "@/components/ui";
import { BottomSheet } from "@/components/listing/BottomSheet";
import { PhotoCarousel } from "@/components/listing/PhotoCarousel";
import { ReportSheet } from "@/components/listing/ReportSheet";
import { StarRating } from "@/components/listing/StarRating";
import { getListingDetail, getReviewEligibility, getSellerRating } from "@/lib/data";
import { contactSeller, createReview, setListingStatus } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { useQuery } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/context/Auth";
import { useSaved } from "@/context/Saved";

export default function PartDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const { isSaved, toggle } = useSaved();

  const detail = useQuery(() => getListingDetail(id), [id]);
  const d = detail.data;
  const sellerId = d?.sellerId;
  const rating = useQuery(() => (sellerId ? getSellerRating(sellerId) : Promise.resolve(null)), [sellerId]);
  const isOwner = !!(user && d && user.id === d.sellerId);
  const elig = useQuery(() => (user && d && !isOwner ? getReviewEligibility(d.id) : Promise.resolve(null)), [user?.id, d?.id, isOwner]);

  const { width } = useWindowDimensions();
  const [moreOpen, setMoreOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [offer, setOffer] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewErr, setReviewErr] = useState<string | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);

  if (detail.loading) return <><Stack.Screen options={{ title: "" }} /><Loading /></>;
  if (detail.error) return <><Stack.Screen options={{ title: "" }} /><ErrorState message={detail.error} onRetry={detail.reload} /></>;
  if (!d) return <><Stack.Screen options={{ title: "" }} /><EmptyState icon="alert-circle-outline" title="Listing not found" message="It may have been removed." actionLabel="Browse parts" onAction={() => router.replace("/browse")} /></>;

  const title = `${d.part} - ${d.brand} ${d.product}${d.model ? ` ${d.model}` : ""}`;
  const saved = isSaved(d.id);
  const active = d.status === "active";

  const share = async () => {
    try {
      await Share.share({ title, message: `${title} for ${formatPrice(d.price, d.currency)} on Piqnex\npiqnex://parts/${d.id}` });
    } catch { /* dismissed */ }
  };

  const openMessage = () => requireAuth(() => {
    setMessage(`Hi, is the ${d.part} for ${d.brand} ${d.product}${d.model ? ` ${d.model}` : ""} still available?`);
    setErr(null); setMsgOpen(true);
  });
  const openOffer = () => requireAuth(() => { setOffer(""); setErr(null); setOfferOpen(true); });

  const send = async (text: string, close: () => void) => {
    setBusy(true); setErr(null);
    try {
      const r = await contactSeller(d.id, text);
      close();
      router.push(`/chat/${r.conversationId}`);
    } catch (e) { setErr(errorMessage(e)); }
    finally { setBusy(false); }
  };

  const sendMessage = () => {
    if (message.trim().length < 5) { setErr("Write a short message to the seller."); return; }
    send(message.trim(), () => setMsgOpen(false));
  };
  const sendOffer = () => {
    const n = Math.round(Number(offer));
    if (!offer || !Number.isFinite(n) || n <= 0) { setErr("Enter a valid offer amount."); return; }
    send(`Offer: ${formatPrice(n, d.currency)} (listed at ${formatPrice(d.price, d.currency)})`, () => setOfferOpen(false));
  };

  const changeStatus = (status: "sold" | "active") => {
    const go = async () => {
      try { await setListingStatus(d.id, status); await detail.reload(); }
      catch (e) { Alert.alert("Couldn't update listing", errorMessage(e)); }
    };
    if (status === "sold") Alert.alert("Mark as sold?", "It will no longer appear in search.", [{ text: "Cancel", style: "cancel" }, { text: "Mark as sold", onPress: go }]);
    else go();
  };

  const submitReview = async () => {
    if (!stars) { setReviewErr("Tap a star to rate."); return; }
    setReviewBusy(true); setReviewErr(null);
    try { await createReview(d.id, stars, comment.trim()); await elig.reload(); }
    catch (e) { setReviewErr(errorMessage(e)); }
    finally { setReviewBusy(false); }
  };

  const photoW = width - 40;
  const created = new Date(d.createdAt);
  const listed = `${created.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][created.getMonth()]}`;
  const subtitle = ["Member of Piqnex", d.seller?.location ?? d.location].filter(Boolean).join(" · ");
  const overlay = { position: "absolute" as const, top: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", alignItems: "center" as const, justifyContent: "center" as const, shadowColor: "#0f1228", shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView refreshControl={<RefreshControl refreshing={detail.refreshing} onRefresh={detail.refresh} tintColor={colors.clay[600]} />} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ marginHorizontal: 20, marginTop: 8, width: photoW, height: Math.round(photoW * 0.9), borderRadius: 24, overflow: "hidden", backgroundColor: colors.clay[100] }}>
          {d.images.length > 1 ? <PhotoCarousel images={d.images} width={photoW} borderRadius={24} /> : d.images[0] ? <Photo uri={d.images[0]} letter={d.part} style={{ width: "100%", height: "100%" }} /> : <LetterTile letter={d.part} seed={d.part} />}
        </View>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={[overlay, { left: 32, top: 20 }]}>
          <Icon name="chevron-back" size={22} color={colors.ink[900]} />
        </Pressable>
        <View style={{ position: "absolute", right: 32, top: 20, flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => setMoreOpen(true)} accessibilityRole="button" accessibilityLabel="More options" style={[overlay, { position: "relative", top: 0 }]}>
            <Icon name="ellipsis-horizontal" size={20} color={colors.ink[900]} />
          </Pressable>
          <Pressable onPress={() => toggle(d.id)} accessibilityRole="button" accessibilityLabel={saved ? "Remove from saved" : "Save listing"} style={[overlay, { position: "relative", top: 0 }]}>
            <Icon name={saved ? "heart" : "heart-outline"} size={20} color={saved ? colors.clay[600] : colors.ink[900]} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 10 }}>
          <Text variant="caption" color={colors.clay[600]} style={{ textTransform: "uppercase", letterSpacing: 0.6, fontFamily: "PlusJakartaSans_700Bold" }}>{d.brand} {d.product}{d.model ? ` · ${d.model}` : ""}</Text>
          <Text variant="h1" style={{ fontSize: 26, lineHeight: 31 }}>{d.part}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <View style={{ backgroundColor: colors.clay[100], borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text variant="label" color={colors.clay[700]}>{d.condition}</Text>
            </View>
            {d.status === "sold" ? <View style={{ backgroundColor: colors.ink[100], borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}><Text variant="label" color={colors.ink[600]}>Sold</Text></View> : null}
            {d.status === "removed" ? <View style={{ backgroundColor: colors.dangerBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}><Text variant="label" color={colors.danger}>Removed</Text></View> : null}
            <Text variant="small" color={colors.ink[500]}>Listed {listed}</Text>
          </View>
          <Text variant="h1" style={{ fontSize: 28, marginTop: 4 }}>{formatPrice(d.price, d.currency)}</Text>

          {d.seller ? (
            <Pressable
              onPress={() => router.push(`/sellers/${d.sellerId}`)}
              accessibilityRole="button"
              accessibilityLabel={`Seller ${d.seller.displayName}`}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.ink[100], marginTop: 6 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.clay[100], alignItems: "center", justifyContent: "center" }}>
                <Text variant="label" color={colors.clay[600]} style={{ fontSize: 15 }}>{d.seller.displayName.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label" numberOfLines={1} style={{ fontFamily: "PlusJakartaSans_700Bold" }}>Seller {d.seller.displayName}</Text>
                <Text variant="caption" color={colors.ink[500]} numberOfLines={1}>{subtitle}</Text>
                {rating.data && rating.data.count > 0 && rating.data.average != null ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <StarRating value={rating.data.average} size={12} />
                    <Text variant="caption" color={colors.ink[500]}>{rating.data.average.toFixed(1)} ({rating.data.count})</Text>
                  </View>
                ) : null}
              </View>
              <Icon name="chevron-forward" size={18} color={colors.ink[400]} />
            </Pressable>
          ) : null}

          <Text color={colors.ink[500]} style={{ marginTop: 6 }}>{d.description}</Text>

          {elig.data?.canReview && !elig.data.hasReviewed ? (
            <View style={{ gap: 10, padding: 14, borderRadius: radius.lg, backgroundColor: colors.moss[50], borderWidth: 1, borderColor: colors.moss[100], marginTop: 8 }}>
              <Text variant="h3">Review this seller</Text>
              <StarRating value={stars} onChange={setStars} size={28} />
              <Input placeholder="How was the deal? (optional)" value={comment} onChangeText={setComment} multiline maxLength={1000} />
              {reviewErr ? <Text variant="small" color={colors.danger}>{reviewErr}</Text> : null}
              <Button title="Submit review" onPress={submitReview} loading={reviewBusy} />
            </View>
          ) : elig.data?.hasReviewed ? (
            <Text variant="small" color={colors.moss[700]} style={{ marginTop: 8 }}>Thanks - you've reviewed this seller.</Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.ink[100], backgroundColor: "#fff" }}>
        {isOwner ? (
          <>
            <Button title="Edit listing" variant="outline" style={{ flex: 1 }} onPress={() => router.push(`/parts/${d.id}/edit`)} />
            {active ? <Button title="Mark as sold" style={{ flex: 1 }} onPress={() => changeStatus("sold")} /> : <Button title="Relist" style={{ flex: 1 }} onPress={() => changeStatus("active")} />}
          </>
        ) : active ? (
          <>
            <Button title="Make an offer" variant="outline" style={{ flex: 1 }} onPress={openOffer} />
            <Button title="Message seller" style={{ flex: 1.3 }} onPress={openMessage} />
          </>
        ) : (
          <View style={{ flex: 1, minHeight: 50, justifyContent: "center", alignItems: "center" }}>
            <Text color={colors.ink[500]}>This listing is no longer available.</Text>
          </View>
        )}
      </View>

      <BottomSheet visible={moreOpen} onClose={() => setMoreOpen(false)} title="Listing options">
        <ActionRow icon="share-outline" label="Share" onPress={() => { setMoreOpen(false); share(); }} />
        {!isOwner ? <ActionRow icon="flag-outline" label="Report listing" danger onPress={() => { setMoreOpen(false); requireAuth(() => setReportOpen(true)); }} /> : null}
      </BottomSheet>

      <BottomSheet visible={msgOpen} onClose={() => setMsgOpen(false)} title="Message seller">
        <Input value={message} onChangeText={setMessage} multiline maxLength={1000} placeholder="Write your message" />
        {err ? <Text variant="small" color={colors.danger}>{err}</Text> : null}
        <Button title="Send message" onPress={sendMessage} loading={busy} />
      </BottomSheet>

      <BottomSheet visible={offerOpen} onClose={() => setOfferOpen(false)} title="Make an offer">
        <Text color={colors.ink[500]}>Listed at {formatPrice(d.price, d.currency)}. The seller can accept or reply in chat.</Text>
        <Input label="Your offer (₹)" value={offer} onChangeText={(v) => setOffer(v.replace(/[^0-9]/g, ""))} keyboardType="number-pad" placeholder="e.g. 1500" autoFocus />
        {err ? <Text variant="small" color={colors.danger}>{err}</Text> : null}
        <Button title="Send offer" onPress={sendOffer} loading={busy} />
      </BottomSheet>

      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} targetType="listing" targetId={d.id} />
    </SafeAreaView>
  );
}

function ActionRow({ icon, label, onPress, danger }: { icon: React.ComponentProps<typeof Icon>["name"]; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
      <Icon name={icon} size={20} color={danger ? colors.clay[600] : colors.ink[800]} />
      <Text variant="bodyMedium" color={danger ? colors.clay[600] : colors.ink[900]}>{label}</Text>
    </Pressable>
  );
}
