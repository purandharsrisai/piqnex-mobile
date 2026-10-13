import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, fonts } from "@/theme";
import { Avatar, EmptyState, ErrorState, Icon, Loading, SignInPrompt, Text } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { useSaved } from "@/context/Saved";
import { getConversations, type ConversationSummary } from "@/lib/data";
import { useQuery } from "@/lib/hooks";
import { previewOf } from "@/lib/message-format";
import { timeAgo } from "@/lib/utils";

type Tab = "all" | "buying" | "selling";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "buying", label: "Buying" },
  { id: "selling", label: "Selling" },
];

export default function MessagesTab() {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) return <SignInPrompt icon="chatbubbles-outline" title="Your messages" message="Log in to chat with buyers and sellers." />;
  return <Inbox userId={user.id} />;
}

function Inbox({ userId }: { userId: string }) {
  const router = useRouter();
  const { refreshUnread } = useSaved();
  const { data, error, loading, refreshing, refresh, reload } = useQuery(getConversations, [userId], { pollMs: 15000 });
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useFocusEffect(useCallback(() => { refreshUnread(); }, [refreshUnread]));

  const all = data ?? [];
  const rows = useMemo(() => {
    const byTab = tab === "all" ? all : all.filter((c) => c.role === tab);
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((c) =>
      [c.other.displayName, c.listing.brandName, c.listing.productName, c.listing.partName, previewOf(c.lastMessage?.body)].some((f) => f.toLowerCase().includes(q)),
    );
  }, [all, tab, query]);

  const header = (
    <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 39, letterSpacing: -0.6 }} accessibilityRole="header">Messages</Text>
        <Pressable
          onPress={() => { if (searching) setQuery(""); setSearching(!searching); }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={searching ? "Close search" : "Search messages"}
          style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink[50] }}
        >
          <Icon name={searching ? "close" : "search"} size={21} color={colors.ink[600]} />
        </Pressable>
      </View>
      {searching ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, borderRadius: 999, backgroundColor: colors.ink[50], paddingHorizontal: 14 }}>
          <Icon name="search" size={16} color={colors.ink[400]} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Search people or messages"
            placeholderTextColor={colors.ink[400]}
            accessibilityLabel="Search messages"
            returnKeyType="search"
            autoCorrect={false}
            style={{ flex: 1, fontFamily: fonts.regular, fontSize: 16.5, color: colors.ink[900], paddingVertical: 10 }}
          />
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={{ minHeight: 40, justifyContent: "center", paddingHorizontal: 20, borderRadius: 999, backgroundColor: on ? colors.ink[900] : colors.ink[100] }}
            >
              <Text color={on ? "#fff" : colors.ink[600]} style={{ fontFamily: fonts.bold, fontSize: 15.5 }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={header}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.clay[600]} />}
          renderItem={({ item }) => <Row c={item} userId={userId} onPress={() => router.push(`/chat/${item.id}`)} />}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title={all.length === 0 ? "No conversations yet" : "Nothing here"}
              message={all.length === 0 ? "Message a seller from any part page and your chats will show up here." : query.trim() ? `No conversations match "${query.trim()}".` : `No ${tab} conversations.`}
              actionLabel={all.length === 0 ? "Browse parts" : undefined}
              onAction={all.length === 0 ? () => router.push("/browse") : undefined}
            />
          }
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}

function Row({ c, userId, onPress }: { c: ConversationSummary; userId: string; onPress: () => void }) {
  const mine = c.lastMessage?.senderId === userId;
  const preview = previewOf(c.lastMessage?.body);
  const unread = c.unread > 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${c.other.displayName}${unread ? ", unread" : ""}`}
      style={({ pressed }) => ({ marginHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.ink[100], opacity: pressed ? 0.7 : 1 })}
    >
      <Avatar name={c.other.displayName} uri={c.other.avatarUrl} size={52} />
      <View style={{ flex: 1, gap: 2, paddingRight: 14 }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: 17, lineHeight: 23 }}>{c.other.displayName}</Text>
        <Text numberOfLines={1} color={unread ? colors.ink[900] : colors.ink[500]} style={{ fontFamily: unread ? fonts.bold : fonts.regular, fontSize: 15.5, lineHeight: 21 }}>
          {mine ? "You: " : ""}{preview}
        </Text>
        <Text numberOfLines={1} color={colors.ink[400]} style={{ fontSize: 13.5, lineHeight: 18 }}>{c.listing.partName} · {timeAgo(c.lastMessageAt)}</Text>
      </View>
      {unread ? <View style={{ position: "absolute", top: 20, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.clay[600] }} /> : null}
    </Pressable>
  );
}
