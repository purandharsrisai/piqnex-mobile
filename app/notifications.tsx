import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { colors, fonts } from "@/theme";
import { ErrorState, Icon, Loading, SignInPrompt, Text, type IconName } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { useQuery } from "@/lib/hooks";
import { buildNotifications, getReadIds, saveReadIds, type NotifIcon, type NotificationItem } from "@/lib/notifications";
import { timeAgo } from "@/lib/utils";

type Filter = "all" | "message" | "match" | "account";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "message", label: "Messages" },
  { id: "match", label: "Matches" },
  { id: "account", label: "Account" },
];

const TILES: Record<NotifIcon, { icon: IconName; bg: string; fg: string }> = {
  chat: { icon: "chatbubble-outline", bg: colors.clay[100], fg: colors.clay[600] },
  match: { icon: "checkmark", bg: colors.moss[100], fg: colors.moss[700] },
  listing: { icon: "pricetag-outline", bg: "#e6e8f6", fg: colors.ink[600] },
  safety: { icon: "shield-outline", bg: "#e6e8f6", fg: colors.ink[600] },
};

export default function NotificationsScreen() {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) return <><Stack.Screen options={{ headerShown: false }} /><SignInPrompt icon="notifications-outline" title="Notifications" message="Log in to see messages, matches and updates." /></>;
  return <Feed userId={user.id} />;
}

function Feed({ userId }: { userId: string }) {
  const router = useRouter();
  const { data, error, loading, refreshing, refresh, reload } = useQuery(buildNotifications, [userId], { pollMs: 30000 });
  const [read, setRead] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => { getReadIds().then(setRead); }, []);

  const markRead = useCallback((ids: string[]) => {
    setRead((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      void saveReadIds(next);
      return next;
    });
  }, []);

  const items = data ?? [];
  const shown = useMemo(() => items.filter((i) => filter === "all" || i.kind === filter), [items, filter]);
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const today = shown.filter((i) => new Date(i.at).getTime() >= startOfToday);
  const earlier = shown.filter((i) => new Date(i.at).getTime() < startOfToday);
  const hasUnread = items.some((i) => !read.includes(i.id));
  // The static safety reminder alone doesn't count as activity for the "all caught up" state.
  const empty = items.filter((i) => i.id !== "safety:reminder").length === 0;

  function open(i: NotificationItem) {
    markRead([i.id]);
    router.push(i.href as never);
  }

  const back = () => (router.canGoBack() ? router.back() : router.replace("/messages"));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, minHeight: 52, borderBottomWidth: 1, borderBottomColor: colors.ink[100] }}>
        <View style={{ width: 96, alignItems: "flex-start" }}>
          <Pressable onPress={back} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 40, height: 44, alignItems: "flex-start", justifyContent: "center" }}>
            <Icon name="chevron-back" size={24} color={colors.ink[900]} />
          </Pressable>
        </View>
        <Text center numberOfLines={1} style={{ flex: 1, fontFamily: fonts.extrabold, fontSize: 19, lineHeight: 25 }} accessibilityRole="header">Notifications</Text>
        <View style={{ width: 96, alignItems: "flex-end" }}>
          {!empty && hasUnread ? (
            <Pressable onPress={() => markRead(items.map((i) => i.id))} hitSlop={8} accessibilityRole="button" accessibilityLabel="Mark all read">
              <Text color={colors.clay[600]} style={{ fontFamily: fonts.bold, fontSize: 14, lineHeight: 19 }}>Mark all read</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.clay[600]} />}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32, flexGrow: 1 }}
        >
          {empty ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80, gap: 10 }}>
              <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: colors.clay[100], alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon name="notifications-outline" size={44} color={colors.clay[600]} />
              </View>
              <Text style={{ fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 28 }} center>You're all caught up</Text>
              <Text color={colors.ink[500]} center style={{ maxWidth: 310, fontSize: 16, lineHeight: 23 }}>We'll let you know when someone messages you or a part you need is listed.</Text>
              <Pressable onPress={() => router.push("/need")} accessibilityRole="button" style={{ marginTop: 10, minHeight: 52, paddingHorizontal: 30, borderRadius: 999, backgroundColor: colors.clay[600], alignItems: "center", justifyContent: "center" }}>
                <Text color="#fff" style={{ fontFamily: fonts.bold, fontSize: 16 }}>Set up a part alert</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16, paddingHorizontal: 6 }}>
                {FILTERS.map((f) => {
                  const on = filter === f.id;
                  return (
                    <Pressable key={f.id} onPress={() => setFilter(f.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ minHeight: 40, justifyContent: "center", paddingHorizontal: 20, borderRadius: 999, backgroundColor: on ? colors.ink[900] : colors.ink[100] }}>
                      <Text color={on ? "#fff" : colors.ink[600]} style={{ fontFamily: fonts.bold, fontSize: 15.5 }}>{f.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {shown.length === 0 ? <Text color={colors.ink[500]} center style={{ marginTop: 40 }}>Nothing here yet.</Text> : null}
              <Section label="TODAY" items={today} read={read} onOpen={open} />
              <Section label="EARLIER" items={earlier} read={read} onOpen={open} />
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Section({ label, items, read, onOpen }: { label: string; items: NotificationItem[]; read: string[]; onOpen: (i: NotificationItem) => void }) {
  if (items.length === 0) return null;
  return (
    <View style={{ marginTop: 22, gap: 8 }}>
      <Text color={colors.ink[400]} style={{ fontFamily: fonts.bold, letterSpacing: 0.9, fontSize: 11.5, paddingHorizontal: 6 }}>{label}</Text>
      {items.map((i, idx) => (
        <React.Fragment key={i.id}>
          {idx > 0 ? <View style={{ height: 1, backgroundColor: colors.ink[100], marginHorizontal: 6 }} /> : null}
          <Card i={i} unread={!read.includes(i.id)} onPress={() => onOpen(i)} />
        </React.Fragment>
      ))}
    </View>
  );
}

function Card({ i, unread, onPress }: { i: NotificationItem; unread: boolean; onPress: () => void }) {
  const t = TILES[i.icon];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${i.title}. ${i.body}${unread ? " Unread." : ""}`}
      style={({ pressed }) => ({ flexDirection: "row", gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 18, backgroundColor: unread ? colors.clay[50] : "#fff", opacity: pressed ? 0.75 : 1 })}
    >
      <View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: t.bg, alignItems: "center", justifyContent: "center" }}>
        <Icon name={t.icon} size={23} color={t.fg} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
          <Text style={{ flex: 1, fontFamily: unread ? fonts.bold : fonts.semibold, fontSize: 15, lineHeight: 21 }}>{i.title}</Text>
          <Text color={colors.ink[400]} style={{ fontSize: 13, lineHeight: 21 }}>{timeAgo(i.at)}</Text>
          {unread ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.clay[600], marginTop: 5 }} /> : null}
        </View>
        <Text color={colors.ink[500]} style={{ fontSize: 14.5, lineHeight: 21 }}>{i.body}</Text>
      </View>
    </Pressable>
  );
}
