import React, { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EmptyState, ErrorState, Icon, Loading, Photo, SignInPrompt, Text } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { colors, fonts } from "@/theme";
import { useQuery } from "@/lib/hooks";
import { getMyListings, type MyListing } from "@/lib/data";
import { deleteListing, setListingStatus } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

const FILTERS = [["all", "All"], ["active", "Active"], ["sold", "Sold"]] as const;

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: selected ? colors.ink[900] : colors.ink[50] }}>
      <Text variant="label" color={selected ? "#fff" : colors.ink[600]}>{label}</Text>
    </Pressable>
  );
}

export default function MyListingsScreen() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const q = useQuery(() => (user ? getMyListings() : Promise.resolve([] as MyListing[])), [user?.id]);
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<"all" | "active" | "sold">(params.filter === "active" || params.filter === "sold" ? params.filter : "all");
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!ready) return <Loading />;
  if (!user) return <SignInPrompt icon="pricetag-outline" title="Your listings" message="Log in to see and manage the parts you're selling." />;
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;

  const all = q.data ?? [];
  const rows = all.filter((l) => (filter === "all" ? true : l.status === filter));

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try { await fn(); await q.refresh(); } catch (e) { Alert.alert("Couldn't update listing", errorMessage(e)); } finally { setBusyId(null); }
  };

  const confirmDelete = (l: MyListing) =>
    Alert.alert("Delete listing?", `"${l.part}" will be permanently removed.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => run(l.id, () => deleteListing(l.id)) },
    ]);

  const menu = (l: MyListing) =>
    Alert.alert(l.part, formatPrice(l.price), [
      { text: "View", onPress: () => router.push(`/parts/${l.id}`) },
      { text: "Edit", onPress: () => router.push(`/parts/${l.id}/edit`) },
      l.status === "active"
        ? { text: "Mark as sold", onPress: () => run(l.id, () => setListingStatus(l.id, "sold")) }
        : { text: "Relist", onPress: () => run(l.id, () => setListingStatus(l.id, "active")) },
      { text: "Delete", style: "destructive", onPress: () => confirmDelete(l) },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <FlatList
      data={rows}
      keyExtractor={(l) => l.id}
      refreshing={q.refreshing}
      onRefresh={q.refresh}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, flexGrow: 1 }} style={{ backgroundColor: "#fff" }}
      ListHeaderComponent={
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          {FILTERS.map(([k, label]) => <FilterChip key={k} label={label} selected={filter === k} onPress={() => setFilter(k)} />)}
        </View>
      }
      ListEmptyComponent={
        all.length === 0 ? (
          <EmptyState icon="pricetag-outline" title="Sell your first part" message="List a spare part and reach people who need it." actionLabel="Sell your first part" onAction={() => router.push("/sell")} />
        ) : (
          <EmptyState icon="funnel-outline" title="Nothing here" message="No listings match this filter." />
        )
      }
      renderItem={({ item: l, index }) => (
        <View style={{ flexDirection: "row", alignItems: "center", opacity: busyId === l.id ? 0.5 : 1, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.ink[100] }}>
          <Pressable onPress={() => router.push(`/parts/${l.id}`)} accessibilityRole="button" accessibilityLabel={`View ${l.part}`} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
            <Photo uri={l.imageUrl} letter={l.part} style={{ width: 40, height: 40, borderRadius: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 14.5 }} numberOfLines={1}>{l.part}</Text>
              <Text variant="small" color={colors.ink[500]} numberOfLines={1}>{formatPrice(l.price)} · {l.status}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => menu(l)} hitSlop={8} accessibilityLabel={`More actions for ${l.part}`} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
            <Icon name="ellipsis-horizontal" size={20} color={colors.ink[500]} />
          </Pressable>
        </View>
      )}
    />
  );
}
