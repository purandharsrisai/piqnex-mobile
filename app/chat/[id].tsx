import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/theme";
import { EmptyState, ErrorState, Icon, Loading, Text } from "@/components/ui";
import { ReportSheet } from "@/components/listing/ReportSheet";
import { useSaved } from "@/context/Saved";
import { blockUser } from "@/lib/actions";
import { errorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { getThread, type ChatMessage } from "@/lib/data";
import { useQuery } from "@/lib/hooks";
import { BlockSheet } from "@/components/messages/BlockSheet";
import { Composer } from "@/components/messages/Composer";
import { ChatActionSheet, ChatHeader, SafetyBanner } from "@/components/messages/ChatHeader";
import { MessageBubble, type Receipt } from "@/components/messages/MessageBubble";
import { BUYER_REPLIES, SELLER_REPLIES, dayKey, dayLabel } from "@/components/messages/helpers";

type Row = { type: "day"; key: string; label: string } | { type: "msg"; key: string; m: ChatMessage };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refreshUnread } = useSaved();
  const { data: thread, error, loading, reload, refresh } = useQuery(() => getThread(String(id)), [id], { pollMs: 6000 });
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  const scroller = useRef<ScrollView>(null);
  const nearBottom = useRef(true);
  const initialDone = useRef(false);
  const dividerY = useRef<number | null>(null);
  const baseline = useRef<{ id: string; readAt: number | null } | null>(null);
  const prevCount = useRef(0);
  const [away, setAway] = useState(false);
  const insets = useSafeAreaInsets();
  const [kbOpen, setKbOpen] = useState(false);

  // Track the keyboard: drop the bottom safe-area gap while it's open, and keep the latest message in view.
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => {
      setKbOpen(true);
      if (nearBottom.current) setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), Platform.OS === "ios" ? 60 : 120);
    });
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKbOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Remember what was unread when the chat was opened (the server marks it read on load).
  if (thread && baseline.current?.id !== thread.id) {
    baseline.current = { id: thread.id, readAt: thread.myReadAt ? new Date(thread.myReadAt).getTime() : null };
    initialDone.current = false;
    dividerY.current = null;
  }

  useEffect(() => { if (thread) refreshUnread(); }, [thread?.id, thread?.messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const derived = useMemo(() => {
    if (!thread) return null;
    const readMs = baseline.current?.readAt ?? null;
    const isUnread = (m: ChatMessage) => m.senderId !== thread.me && (readMs === null || new Date(m.createdAt).getTime() > readMs);
    const firstUnreadId = thread.messages.find(isUnread)?.id ?? null;
    const unreadCount = thread.messages.filter(isUnread).length;
    const lastMineId = [...thread.messages].reverse().find((m) => m.senderId === thread.me)?.id ?? null;
    const rows: Row[] = [];
    let lastDay = "";
    for (const m of thread.messages) {
      const k = dayKey(m.createdAt);
      if (k !== lastDay) { rows.push({ type: "day", key: `d${k}`, label: dayLabel(m.createdAt) }); lastDay = k; }
      rows.push({ type: "msg", key: m.id, m });
    }
    return { rows, firstUnreadId, unreadCount, lastMineId };
  }, [thread]);

  const scrollToEnd = useCallback((animated = false) => { scroller.current?.scrollToEnd({ animated }); }, []);

  function onContentSizeChange() {
    if (!derived || !thread) return;
    if (!initialDone.current) {
      if (!derived.firstUnreadId) { scrollToEnd(false); initialDone.current = true; prevCount.current = thread.messages.length; }
      return;
    }
    const grew = thread.messages.length > prevCount.current;
    prevCount.current = thread.messages.length;
    const lastIsMine = thread.messages[thread.messages.length - 1]?.senderId === thread.me;
    if (grew && (nearBottom.current || lastIsMine)) scrollToEnd(true);
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const dist = contentSize.height - contentOffset.y - layoutMeasurement.height;
    nearBottom.current = dist < 160;
    setAway(dist > 220);
  }

  async function doBlock() {
    if (!thread) return;
    try {
      await blockUser(thread.other.id);
    } catch (e) {
      throw new Error(errorMessage(e));
    }
    setBlockOpen(false);
    router.replace("/messages");
  }

  const listing = thread?.listing;
  const iAmSeller = !!thread && listing?.sellerId === thread.me;
  const unavailable = !listing || listing.status === "active" ? null : listing.status === "sold" ? "sold" : "no longer listed";
  const about = listing ? `About: ${listing.partName} · ${formatPrice(Number(listing.price), listing.currency)}` : "";

  const screen = (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatHeader
        name={thread?.other.displayName ?? ""}
        avatarUrl={thread?.other.avatarUrl ?? null}
        about={about}
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/messages"))}
        onOpenListing={listing ? () => router.push(`/parts/${listing.id}`) : undefined}
        onMenu={thread ? () => setMenuOpen(true) : undefined}
      />
    </>
  );

  if (loading && !thread) return <>{screen}<Loading /></>;
  if (error && !thread) return <>{screen}<ErrorState message={error} onRetry={reload} /></>;
  if (!thread || !listing || !derived) return <>{screen}<EmptyState icon="chatbubble-outline" title="Conversation not found" message="It may have been removed, or you may not have access to it." actionLabel="Back to messages" onAction={() => router.replace("/messages")} /></>;

  const myRead = thread.otherReadAt ? new Date(thread.otherReadAt).getTime() : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: "#fff" }}>
     <View style={{ flex: 1, paddingBottom: kbOpen ? 0 : insets.bottom }}>
      {screen}
      <SafetyBanner />
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          ref={scroller}
          onScroll={onScroll}
          scrollEventThrottle={64}
          onContentSizeChange={onContentSizeChange}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          contentContainerStyle={{ padding: 14, gap: 8, flexGrow: 1 }}
        >
          {derived.rows.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center" }}><Text color={colors.ink[500]} center>No messages yet. Say hello!</Text></View>
          ) : null}
          {derived.rows.map((r) => {
            if (r.type === "day") {
              return (
                <View key={r.key} style={{ alignSelf: "center", marginVertical: 6, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.ink[100] }}>
                  <Text variant="caption" color={colors.ink[500]}>{r.label}</Text>
                </View>
              );
            }
            const m = r.m;
            const mine = m.senderId === thread.me;
            let receipt: Receipt = null;
            if (m.id === derived.lastMineId) receipt = myRead !== null && myRead >= new Date(m.createdAt).getTime() ? "seen" : "sent";
            return (
              <View key={r.key} style={{ gap: 6 }}>
                {m.id === derived.firstUnreadId ? (
                  <View
                    onLayout={(e) => {
                      dividerY.current = e.nativeEvent.layout.y;
                      if (!initialDone.current) {
                        initialDone.current = true;
                        prevCount.current = thread.messages.length;
                        scroller.current?.scrollTo({ y: Math.max(0, e.nativeEvent.layout.y - 64), animated: false });
                      }
                    }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 6 }}
                  >
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.clay[200] }} />
                    <Text variant="caption" color={colors.clay[600]} style={{ textTransform: "uppercase", letterSpacing: 1 }}>New messages</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.clay[200] }} />
                  </View>
                ) : null}
                <MessageBubble m={m} mine={mine} receipt={receipt} />
              </View>
            );
          })}
        </ScrollView>
        {away ? (
          <Pressable
            onPress={() => scrollToEnd(true)}
            accessibilityRole="button"
            accessibilityLabel={derived.unreadCount > 0 ? `${derived.unreadCount} new messages, jump to latest` : "Jump to latest message"}
            style={{ position: "absolute", right: 14, bottom: 12, minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.ink[900] }}
          >
            <Icon name="arrow-down" size={15} color="#fff" />
            <Text variant="label" color="#fff">{derived.unreadCount > 0 ? `${derived.unreadCount} new` : "Latest"}</Text>
          </Pressable>
        ) : null}
      </View>
      <Composer
        conversationId={thread.id}
        suggestions={derived.lastMineId ? [] : (iAmSeller ? SELLER_REPLIES : BUYER_REPLIES).slice(0, 3)}
        offer={iAmSeller ? undefined : { price: Number(listing.price), currency: listing.currency }}
        unavailable={unavailable}
        onSent={() => { nearBottom.current = true; refresh(); }}
      />
      <ChatActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        name={thread.other.displayName}
        avatarUrl={thread.other.avatarUrl}
        onBlock={() => setBlockOpen(true)}
        onReport={() => setReportOpen(true)}
        onViewListing={() => router.push(`/parts/${listing.id}`)}
      />
      <BlockSheet visible={blockOpen} onClose={() => setBlockOpen(false)} name={thread.other.displayName} avatarUrl={thread.other.avatarUrl} onConfirm={doBlock} />
      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={thread.other.id} />
     </View>
    </KeyboardAvoidingView>
  );
}
