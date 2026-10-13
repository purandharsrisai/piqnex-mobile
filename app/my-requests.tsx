import React, { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { useRouter } from "expo-router";
import { EmptyState, ErrorState, Icon, Loading, Photo, SignInPrompt, Text } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { colors, fonts } from "@/theme";
import { useQuery } from "@/lib/hooks";
import { getMyNeedRequests, getNeedMatches, type MyNeedRequest } from "@/lib/data";
import { deleteNeedRequest, setNeedStatus } from "@/lib/actions";
import { errorMessage } from "@/lib/api";

export default function MyRequestsScreen() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const q = useQuery(() => (user ? getMyNeedRequests() : Promise.resolve([] as MyNeedRequest[])), [user?.id]);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!ready) return <Loading />;
  if (!user) return <SignInPrompt icon="search-outline" title="Your requests" message="Log in to see the parts you're looking for." />;
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try { await fn(); await q.refresh(); } catch (e) { Alert.alert("Couldn't update request", errorMessage(e)); } finally { setBusyId(null); }
  };

  const findMatches = async (r: MyNeedRequest) => {
    setBusyId(r.id);
    try {
      const m = await getNeedMatches({ brand: r.brand, product: r.product, model: r.model, part: r.part });
      const query = `${r.brand} ${r.product} ${r.part}`;
      if (m.length === 0) Alert.alert("No matches yet", "Nobody has listed this part yet. We'll keep your request open.");
      else Alert.alert(`${m.length} ${m.length === 1 ? "listing matches" : "listings match"}`, "See them in Browse?", [
        { text: "Not now", style: "cancel" },
        { text: "Browse", onPress: () => router.push({ pathname: "/browse", params: { q: query } }) },
      ]);
    } catch (e) {
      Alert.alert("Couldn't search", errorMessage(e));
    } finally { setBusyId(null); }
  };

  const confirmDelete = (r: MyNeedRequest) =>
    Alert.alert("Delete request?", `"${r.part}" will be permanently removed.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => run(r.id, () => deleteNeedRequest(r.id)) },
    ]);

  const menu = (r: MyNeedRequest) =>
    Alert.alert(r.part, `${r.brand} ${r.product}${r.model ? ` ${r.model}` : ""}`, [
      { text: "Find matches", onPress: () => findMatches(r) },
      ...(r.status !== "closed" ? [{ text: "Close request", onPress: () => run(r.id, () => setNeedStatus(r.id, "closed")) }] : []),
      { text: "Delete", style: "destructive" as const, onPress: () => confirmDelete(r) },
      { text: "Cancel", style: "cancel" as const },
    ]);

  return (
    <FlatList
      data={q.data ?? []}
      keyExtractor={(r) => r.id}
      refreshing={q.refreshing}
      onRefresh={q.refresh}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, flexGrow: 1 }} style={{ backgroundColor: "#fff" }}
      ListEmptyComponent={<EmptyState icon="search-outline" title="No requests yet" message="Can't find a part? Tell us what you need and we'll look for it." actionLabel="I need a part" onAction={() => router.push("/need")} />}
      renderItem={({ item: r, index }) => (
        <Pressable
          onPress={() => menu(r)}
          accessibilityRole="button"
          accessibilityLabel={`Actions for ${r.part}`}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, opacity: busyId === r.id ? 0.5 : 1, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.ink[100] }}
        >
          <Photo uri={null} letter={r.part} style={{ width: 40, height: 40, borderRadius: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 14.5 }} numberOfLines={1}>{r.part}</Text>
            <Text variant="small" color={colors.ink[500]} numberOfLines={1}>{r.brand} {r.product}{r.model ? ` ${r.model}` : ""} · {r.status}</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.ink[300]} />
        </Pressable>
      )}
    />
  );
}
