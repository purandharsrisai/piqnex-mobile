import React from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "@/theme";
import { Avatar, Icon, Photo, SignInPrompt, Text } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { useSaved } from "@/context/Saved";
import { useQuery } from "@/lib/hooks";
import { getMyListings, getMyNeedRequests } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

function Stat({ value, label, onPress, last }: { value: number | string; label: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${value} ${label}`}
      style={({ pressed }) => ({ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4, gap: 1, borderRightWidth: last ? 0 : 1, borderRightColor: colors.ink[100], opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 28 }}>{value}</Text>
      <Text style={{ fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 17 }} color={colors.ink[500]}>{label}</Text>
    </Pressable>
  );
}

function StatusBadge({ status }: { status: string }) {
  const live = status === "active";
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: live ? colors.moss[100] : colors.ink[100] }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, textTransform: "capitalize" }} color={live ? colors.moss[700] : colors.ink[500]}>{status}</Text>
    </View>
  );
}

export default function ProfileTab() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const { savedIds } = useSaved();
  const insets = useSafeAreaInsets();
  const data = useQuery(async () => {
    if (!user) return null;
    const [listings, requests] = await Promise.all([getMyListings(), getMyNeedRequests()]);
    return { listings, requests: requests.length };
  }, [user?.id]);

  if (!user) {
    return <SignInPrompt icon="person-outline" title="Your Piqnex profile" message="Log in to manage your listings, requests and saved parts." />;
  }

  const onRefresh = async () => { await Promise.all([refresh(), data.refresh()]); };
  const d = data.data;
  const active = d ? d.listings.filter((l) => l.status === "active").length : "-";
  const sold = d ? d.listings.filter((l) => l.status === "sold").length : "-";
  const shown = d ? d.listings.filter((l) => l.status !== "removed") : [];
  const refreshing = data.refreshing;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={[colors.clay[600]]} progressViewOffset={insets.top} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <LinearGradient colors={["#ff7a4d", "#d23510"]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 72 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 37, letterSpacing: -0.6 }} color="#fff" accessibilityRole="header">Profile</Text>
            <Pressable onPress={() => router.push("/settings")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Settings" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Icon name="settings-outline" size={22} color="#fff" />
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 16 }}>
            <View style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: "#fff", backgroundColor: "#fff", alignItems: "center", justifyContent: "center", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 }}>
              {user.avatarUrl ? (
                <Avatar name={user.displayName} uri={user.avatarUrl} size={70} />
              ) : (
                <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.clay[50], alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34 }} color={colors.clay[600]}>{(user.displayName.trim()[0] ?? "?").toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 19, lineHeight: 25 }} color="#fff" numberOfLines={1}>{user.displayName}</Text>
              <Text style={{ fontSize: 13.5, lineHeight: 19 }} color="rgba(255,255,255,0.92)" numberOfLines={1} ellipsizeMode="middle">{user.email}</Text>
              {user.location ? <Text style={{ fontSize: 13.5, lineHeight: 19 }} color="rgba(255,255,255,0.92)" numberOfLines={1}>{user.location}</Text> : null}
            </View>
            <Pressable onPress={() => router.push("/account/edit")} hitSlop={6} accessibilityRole="button" accessibilityLabel="Edit profile" style={({ pressed }) => ({ width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
              <Icon name="create-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </LinearGradient>

        <View style={{ marginHorizontal: 18, marginTop: -48, backgroundColor: "#fff", borderRadius: 22, paddingVertical: 16, flexDirection: "row", shadowColor: "#0f1228", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
          <Stat value={active} label="Active" onPress={() => router.push("/my-listings?filter=active" as Href)} />
          <Stat value={sold} label="Sold" onPress={() => router.push("/my-listings?filter=sold" as Href)} />
          <Stat value={d ? d.requests : "-"} label="Requests" onPress={() => router.push("/my-requests")} />
          <Stat value={savedIds.size} label="Saved" onPress={() => router.push("/saved")} last />
        </View>

        <View style={{ paddingHorizontal: 20, gap: 4, marginTop: 8 }}>
          {data.error && !d ? <Text variant="small" color={colors.ink[500]} center style={{ marginTop: 10 }}>Couldn't load your listings. Pull down to retry.</Text> : null}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 4 }}>
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 19, lineHeight: 26, letterSpacing: -0.3 }}>My listings</Text>
          </View>
          {d && shown.length === 0 ? (
            <Text color={colors.ink[500]} style={{ paddingVertical: 12, fontSize: 15, lineHeight: 22 }}>You haven't listed anything yet. Tap Sell below to list a spare part.</Text>
          ) : null}
          {shown.slice(0, 3).map((l) => (
            <Pressable key={l.id} onPress={() => router.push(`/parts/${l.id}` as Href)} accessibilityRole="button" accessibilityLabel={l.part}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 9, opacity: pressed ? 0.6 : 1 })}>
              <Photo uri={l.imageUrl} letter={l.part} style={{ width: 52, height: 52, borderRadius: 14 }} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 15.5, lineHeight: 21 }} numberOfLines={2}>{l.part}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 14.5, lineHeight: 20 }}>{formatPrice(l.price)}</Text>
                  <StatusBadge status={l.status} />
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.ink[300]} />
            </Pressable>
          ))}
          {shown.length > 3 ? (
            <Pressable onPress={() => router.push("/my-listings")} accessibilityRole="button" accessibilityLabel="See all listings" style={{ paddingVertical: 8 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 14.5, lineHeight: 20 }} color={colors.clay[600]}>See all {shown.length} listings</Text>
            </Pressable>
          ) : null}

        </View>
      </ScrollView>
    </View>
  );
}
