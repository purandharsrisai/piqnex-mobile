import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect, Path } from "react-native-svg";
import { Text } from "./Text";

/** Splash "A - Brand orange": orange gradient, white tile with the logo, name, tagline and a progress bar. */
export function AnimatedSplash({ done, onHidden }: { done: boolean; onHidden: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    Animated.timing(progress, { toValue: 0.85, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress, scale]);

  useEffect(() => {
    if (!done) return;
    Animated.timing(progress, { toValue: 1, duration: 250, useNativeDriver: false }).start(() => {
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }).start(onHidden);
    });
  }, [done, progress, opacity, onHidden]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <LinearGradient colors={["#ff7a4d", "#d23510"]} style={styles.fill}>
        <Animated.View style={{ alignItems: "center", transform: [{ scale }] }}>
          <View style={styles.tile}>
            <Svg width={88} height={88} viewBox="0 0 64 64">
              <Defs>
                <SvgGradient id="sp" x1="8" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor="#ff7a4d" />
                  <Stop offset="1" stopColor="#d23510" />
                </SvgGradient>
              </Defs>
              <Rect x={4} y={4} width={56} height={56} rx={17} fill="url(#sp)" />
              <Path d="M21 47V17h10.5a11 11 0 0 1 0 22H21" fill="none" stroke="#fff" strokeWidth={8.5} strokeLinecap="round" strokeLinejoin="round" />
              <Rect x={40} y={41} width={12} height={12} rx={3.5} fill="#7cd8ca" transform="rotate(12 46 47)" />
            </Svg>
          </View>
          <Text color="#fff" style={{ fontSize: 40, lineHeight: 52, marginTop: 18, paddingHorizontal: 12, fontFamily: "PlusJakartaSans_800ExtraBold", includeFontPadding: false }}>Piqnex</Text>
          <Text color="rgba(255,255,255,0.95)" style={{ marginTop: 6, fontSize: 18, lineHeight: 26, fontFamily: "PlusJakartaSans_600SemiBold" }}>Find the missing piece</Text>
        </Animated.View>
        <View style={styles.track}>
          <Animated.View style={{ height: 4, width, borderRadius: 2, backgroundColor: "#fff" }} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: "center", justifyContent: "center" },
  tile: { width: 128, height: 128, borderRadius: 36, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#7a1d05", shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  track: { position: "absolute", bottom: 56, left: 60, right: 60, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" },
});
