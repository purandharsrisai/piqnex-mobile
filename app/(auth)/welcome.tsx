import React, { useRef, useState } from "react";
import { Animated, FlatList, Pressable, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "@/theme";
import { Button, Text } from "@/components/ui";
import { markWelcomeSeen } from "@/lib/auth-flow";

interface Slide { key: string; title: string; body: string; tag: { title: string; sub: string; pill: string; pillBg: string; pillFg: string }; tilt: string }

const SLIDES: Slide[] = [
  {
    key: "find", title: "Don’t replace the product. Find the piece.",
    body: "Find the exact spare part you need from someone who has it, or sell the one in your drawer.",
    tag: { title: "Right earbud", sub: "Sony WF-1000XM4", pill: "Matched", pillBg: colors.moss[600], pillFg: "#fff" }, tilt: "-6deg",
  },
  {
    key: "sell", title: "Sell what’s in your drawer",
    body: "List a leftover part in minutes and meet someone who needs it.",
    tag: { title: "Charging cable", sub: "Apple Watch S7 · ₹800", pill: "Listed", pillBg: colors.clay[600], pillFg: "#fff" }, tilt: "5deg",
  },
  {
    key: "chat", title: "Chat directly, meet safely",
    body: "Message sellers, agree the details yourselves and meet in a public place.",
    tag: { title: "Is this still available?", sub: "Aarav K. · Right earbud", pill: "Meet in public", pillBg: colors.moss[600], pillFg: "#fff" }, tilt: "-4deg",
  },
];

function TagCard({ s }: { s: Slide }) {
  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, gap: 3, transform: [{ rotate: s.tilt }], minWidth: 190,
      shadowColor: "#4a1405", shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8,
    }}>
      <Text style={{ fontFamily: fonts.extrabold, fontSize: 19, letterSpacing: -0.3 }}>{s.tag.title}</Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 13 }} color={colors.ink[500]}>{s.tag.sub}</Text>
      <View style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: s.tag.pillBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 12 }} color={s.tag.pillFg}>{s.tag.pill}</Text>
      </View>
    </View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const x = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Slide>>(null);
  const [idx, setIdx] = useState(0);
  const cardH = Math.max(260, Math.min(400, Math.round(height * 0.42)));
  const cardScale = Math.min(1.4, Math.max(1.1, cardH / 230));

  const go = async (path: "/signup" | "/login") => { await markWelcomeSeen(); router.push(path); };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Animated.FlatList
          ref={listRef as never}
          data={SLIDES}
          keyExtractor={(s) => s.key}
          horizontal
          pagingEnabled
          snapToInterval={width}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          overScrollMode="never"
          bounces={false}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: false, listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => { const i = Math.round(e.nativeEvent.contentOffset.x / width); if (i !== idx) setIdx(i); } })}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onEnd}
          renderItem={({ item }) => (
            <View style={{ width, paddingHorizontal: 20, gap: 22 }}>
              <LinearGradient colors={["#ff7a4d", "#d23510"]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ height: cardH, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <View style={{ transform: [{ scale: cardScale }] }}><TagCard s={item} /></View>
              </LinearGradient>
              <View style={{ gap: 12 }}>
                <Text style={{ fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 33, letterSpacing: -0.7 }}>{item.title}</Text>
                <Text color={colors.ink[600]} style={{ fontSize: 17, lineHeight: 26, fontFamily: fonts.regular }}>{item.body}</Text>
              </View>
            </View>
          )}
        />
        <View style={{ flexDirection: "row", gap: 8, alignSelf: "center", alignItems: "center", marginTop: 22 }} accessibilityLabel={`Slide ${idx + 1} of ${SLIDES.length}`}>
          {SLIDES.map((s, i) => {
            const input = [(i - 1) * width, i * width, (i + 1) * width];
            return (
              <Pressable key={s.key} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Go to slide ${i + 1}`} onPress={() => listRef.current?.scrollToOffset({ offset: i * width, animated: true })}>
                <Animated.View style={{
                  height: 8, borderRadius: 4,
                  width: x.interpolate({ inputRange: input, outputRange: [8, 26, 8], extrapolate: "clamp" }),
                  backgroundColor: x.interpolate({ inputRange: input, outputRange: [colors.ink[200], colors.clay[600], colors.ink[200]], extrapolate: "clamp" }),
                }} />
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 6 }}>
        <Button title="Get started" onPress={() => go("/signup")} />
        <Pressable onPress={() => go("/login")} accessibilityRole="link" accessibilityLabel="I already have an account" style={{ minHeight: 60, alignItems: "center", justifyContent: "center", paddingVertical: 10 }}>
          <Text color={colors.ink[700]} style={{ fontFamily: fonts.semibold, fontSize: 15.5 }}>I already have an account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
