import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { EmptyState, ErrorState, Icon, ListingGrid, Loading, Screen, Text } from "@/components/ui";
import { ReportSheet } from "@/components/listing/ReportSheet";
import { ReviewCard } from "@/components/listing/ReviewCard";
import { StarRating } from "@/components/listing/StarRating";
import { getSellerProfile } from "@/lib/data";
import { blockUser } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { useQuery } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/Auth";

export default function SellerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const { data, error, loading, refreshing, refresh, reload } = useQuery(() => getSellerProfile(id), [id]);
  const [tab, setTab] = useState<"listings" | "reviews">("listings");
  const [menu, setMenu] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const isSelf = user?.id === id;

  const block = () => requireAuth(() => {
    Alert.alert("Block this user?", "You won't see their messages and they can't contact you.", [
      { text: "Cancel", style: "cancel" },
      { text: "Block", style: "destructive", onPress: async () => {
        try { await blockUser(id); Alert.alert("User blocked"); router.back(); }
        catch (e) { Alert.alert("Couldn't block user", errorMessage(e)); }
      } },
    ]);
  });

  const options = {
    title: "Seller",
    headerRight: () => isSelf ? null : (
      <Pressable onPress={() => setMenu((m) => !m)} accessibilityRole="button" accessibilityLabel="More options" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
        <Icon name="ellipsis-horizontal" size={22} color={colors.ink[800]} />
      </Pressable>
    ),
  };

  if (loading) return <><Stack.Screen options={{ title: "Seller" }} /><Loading /></>;
  if (error) return <><Stack.Screen options={{ title: "Seller" }} /><ErrorState message={error} onRetry={reload} /></>;
  if (!data) return <><Stack.Screen options={{ title: "Seller" }} /><EmptyState icon="person-outline" title="Seller not found" /></>;

  const { seller, rating, soldCount, reviews, listings } = data;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} padded={false} contentStyle={{ gap: 16, paddingHorizontal: 20, paddingVertical: 16 }}>
      <Stack.Screen options={options} />
      {menu && !isSelf ? (
        <View style={{ borderWidth: 1, borderColor: colors.ink[100], borderRadius: radius.lg, overflow: "hidden" }}>
          <MenuRow icon="flag-outline" label="Report seller" onPress={() => { setMenu(false); requireAuth(() => setReportOpen(true)); }} />
          <MenuRow icon="ban-outline" label="Block seller" danger onPress={() => { setMenu(false); block(); }} />
        </View>
      ) : null}

      <View style={{ alignItems: "center", gap: 6, paddingVertical: 8 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.clay[600], alignItems: "center", justifyContent: "center" }}>
          <Text color="#fff" style={{ fontSize: 38, fontFamily: "PlusJakartaSans_800ExtraBold" }}>{seller.displayName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text variant="h2" center style={{ marginTop: 6 }}>{seller.displayName}</Text>
        {seller.location ? <Text color={colors.ink[500]}>{seller.location}</Text> : null}
        <Text variant="small" color={colors.ink[500]}>Member since {formatDate(seller.createdAt)}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          {rating.count > 0 && rating.average != null ? (
            <>
              <StarRating value={rating.average} size={16} />
              <Text variant="label">{rating.average.toFixed(1)}</Text>
              <Text variant="small" color={colors.ink[500]}>({rating.count} review{rating.count === 1 ? "" : "s"})</Text>
            </>
          ) : <Text variant="small" color={colors.ink[400]}>No reviews yet</Text>}
        </View>
        <Text variant="small" color={colors.ink[500]}>{soldCount} part{soldCount === 1 ? "" : "s"} sold</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["listings", "reviews"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} style={{ height: 38, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: tab === t ? colors.ink[900] : colors.ink[50], borderWidth: 1, borderColor: tab === t ? colors.ink[900] : colors.ink[100] }}>
            <Text variant="label" color={tab === t ? "#fff" : colors.ink[700]}>{t === "listings" ? `Listings (${listings.length})` : `Reviews (${reviews.length})`}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "listings" ? (
        listings.length ? <ListingGrid items={listings} padding={20} /> : <EmptyState icon="pricetags-outline" title="No active listings" message="This seller has nothing listed right now." />
      ) : reviews.length ? (
        <View style={{ gap: 12 }}>{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</View>
      ) : (
        <EmptyState icon="star-outline" title="No reviews yet" message="Reviews appear after a completed deal." />
      )}

      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={seller.id} />
    </Screen>
  );
}

function MenuRow({ icon, label, onPress, danger }: { icon: React.ComponentProps<typeof Icon>["name"]; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 14 }}>
      <Icon name={icon} size={20} color={danger ? colors.danger : colors.ink[700]} />
      <Text variant="bodyMedium" color={danger ? colors.danger : colors.ink[900]}>{label}</Text>
    </Pressable>
  );
}
