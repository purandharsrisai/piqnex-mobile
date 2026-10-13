import React, { useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { colors } from "@/theme";
import { Photo, Text } from "@/components/ui";

/** Full-width 4:3 horizontal paging carousel with dots and an "n / total" counter. */
export function PhotoCarousel({ images, width: w, borderRadius = 0 }: { images: string[]; width?: number; borderRadius?: number }) {
  const win = useWindowDimensions().width;
  const width = w ?? win;
  const [index, setIndex] = useState(0);
  const h = Math.round(w ? width * 0.9 : (width * 3) / 4);
  const data: (string | null)[] = images.length ? images : [null];
  return (
    <View style={{ width, height: h, backgroundColor: colors.ink[100], borderRadius, overflow: "hidden" }}>
      <FlatList
        data={data}
        keyExtractor={(u, i) => `${u ?? "none"}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => <Photo uri={item} style={{ width, height: h }} />}
      />
      {data.length > 1 ? (
        <>
          <View style={{ position: "absolute", top: 12, right: 12, backgroundColor: "rgba(15,18,40,0.65)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text variant="caption" color="#fff">{index + 1} / {data.length}</Text>
          </View>
          <View style={{ position: "absolute", bottom: 10, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }}>
            {data.map((_, i) => <View key={i} style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? colors.clay[600] : "rgba(255,255,255,0.85)" }} />)}
          </View>
        </>
      ) : null}
    </View>
  );
}
