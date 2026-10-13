import React, { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme";
import { EmptyState, ErrorState, Icon, ListingGrid, Loading, Logo, Screen, Text } from "@/components/ui";
import { TextInput } from "react-native";
import { CATEGORIES } from "@/lib/categories";
import { getHomepageListings } from "@/lib/data";
import { useQuery } from "@/lib/hooks";
import { useAuth } from "@/context/Auth";
import { useSaved } from "@/context/Saved";

export default function Home() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const { unread } = useSaved();
  const [q, setQ] = useState("");
  const { data, error, loading, refreshing, refresh, reload } = useQuery(() => getHomepageListings(8), []);

  const search = () => router.push({ pathname: "/browse", params: q.trim() ? { q: q.trim() } : {} });

  return (
    <Screen edges={["top"]} scroll={false} padded={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.ink[100], flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={30} />
        <Pressable onPress={() => router.push("/notifications")} accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Icon name="notifications-outline" size={24} color={colors.ink[900]} />
          {unread > 0 ? <View style={{ position: "absolute", top: 10, right: 11, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.clay[600], borderWidth: 1.5, borderColor: "#fff" }} /> : null}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={refresh} tintColor={colors.clay[600]} />}
      >
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <Text variant="h1" style={{ fontSize: 26, lineHeight: 31 }}>What piece are you missing?</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.ink[200], paddingHorizontal: 16, backgroundColor: "#fff" }}>
          <Icon name="search-outline" size={18} color={colors.ink[400]} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Earbud charging case..."
            placeholderTextColor={colors.ink[400]}
            returnKeyType="search"
            onSubmitEditing={search}
            autoCorrect={false}
            accessibilityLabel="Search parts"
            style={{ flex: 1, fontFamily: "PlusJakartaSans_400Regular", fontSize: 14.5, color: colors.ink[900] }}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}>
        <Pill label="All" selected />
        {CATEGORIES.map((c) => (
          <Pill key={c.slug} label={c.name} onPress={() => router.push({ pathname: "/browse", params: { category: c.slug } })} />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="h3">Fresh listings</Text>
          <Pressable onPress={() => router.push("/browse")} hitSlop={10} accessibilityRole="link" accessibilityLabel="View all listings" style={{ minHeight: 36, justifyContent: "center" }}>
            <Text variant="label" color={colors.clay[600]}>View all</Text>
          </Pressable>
        </View>
        {loading ? (
          <View style={{ height: 200 }}><Loading /></View>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data && data.length === 0 ? (
          <EmptyState icon="pricetags-outline" title="No listings yet" message="Be the first to list a spare part." actionLabel="Sell a part" onAction={() => router.push("/sell")} />
        ) : (
          <ListingGrid items={data ?? []} padding={20} />
        )}
      </View>

      <Pressable
        onPress={() => requireAuth(() => router.push("/need"))}
        accessibilityRole="button"
        accessibilityLabel="Can't find a part? Tell us what you need"
        style={({ pressed }) => ({ marginHorizontal: 20, marginTop: 24, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.clay[50], opacity: pressed ? 0.85 : 1 })}
      >
        <Icon name="search-outline" size={18} color={colors.clay[600]} />
        <Text variant="label" color={colors.clay[700]} style={{ flex: 1 }}>Can't find a part? Tell us what you need</Text>
        <Icon name="chevron-forward" size={16} color={colors.clay[600]} />
      </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Pill({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }} style={{ height: 36, paddingHorizontal: 16, borderRadius: 18, justifyContent: "center", backgroundColor: selected ? colors.ink[900] : colors.ink[50], borderWidth: 1, borderColor: selected ? colors.ink[900] : colors.ink[100] }}>
      <Text variant="label" color={selected ? "#fff" : colors.ink[700]}>{label}</Text>
    </Pressable>
  );
}
