import React from "react";
import { View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState, ErrorState, ListingCard, Loading, Screen, SignInPrompt, Text } from "@/components/ui";
import { colors } from "@/theme";
import { getSavedWithStatus } from "@/lib/saved-data";
import { useQuery } from "@/lib/hooks";
import { useAuth } from "@/context/Auth";
import { useSaved } from "@/context/Saved";

export default function Saved() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, ready } = useAuth();
  const { savedIds } = useSaved();
  const { data, error, loading, refreshing, refresh, reload } = useQuery(() => (user ? getSavedWithStatus() : Promise.resolve([])), [user?.id]);

  if (!ready) return <Loading />;
  if (!user) return <SignInPrompt icon="heart-outline" title="Your saved parts" message="Log in to save parts and find them here later." />;
  if (loading) return <Loading />;

  // Cards unsaved during this visit disappear straight away.
  const items = (data ?? []).filter((l) => savedIds.has(l.id));
  const gap = 12;
  const cardW = Math.floor((Math.min(width, 640) - 40 - gap) / 2);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} contentStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 16 }}>
      {!error && items.length > 0 ? <Text color={colors.ink[500]} center style={{ fontSize: 15, lineHeight: 21 }}>{items.length} {items.length === 1 ? "part" : "parts"} you are watching</Text> : null}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState icon="heart-outline" title="Nothing saved yet" message="Tap the heart on a part to keep it here." actionLabel="Browse parts" onAction={() => router.push("/browse")} />
        </View>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
          {items.map((l) => {
            const sold = l.status !== "active";
            return (
              <View key={l.id} style={{ opacity: sold ? 0.55 : 1 }}>
                <ListingCard item={l} width={cardW} sold={sold} />
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
