import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, TextInput, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";
import { Button, Chip, EmptyState, ErrorState, Icon, Input, ListingCard, Loading, SelectField, Text } from "@/components/ui";
import { BottomSheet } from "@/components/listing/BottomSheet";
import { CATEGORIES } from "@/lib/categories";
import { PAGE_SIZE, searchListings, type ListingCardData } from "@/lib/data";
import { errorMessage } from "@/lib/api";
import { CONDITION_OPTIONS, type ConditionOption, type PartSearchQuery } from "@/lib/types";
import { useAuth } from "@/context/Auth";

type Sort = NonNullable<PartSearchQuery["sort"]>;
interface Filters { category: string; condition: string; minPrice: string; maxPrice: string; location: string }
const EMPTY: Filters = { category: "", condition: "", minPrice: "", maxPrice: "", location: "" };
const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];
const num = (s: string) => { const n = Number(s.replace(/[^0-9.]/g, "")); return s.trim() && Number.isFinite(n) ? n : undefined; };

export default function Browse() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const { width } = useWindowDimensions();
  const gap = 12;
  const cardW = Math.floor((Math.min(width, 640) - 40 - gap) / 2);

  const [text, setText] = useState(params.q ?? "");
  const [q, setQ] = useState(params.q ?? "");
  const [filters, setFilters] = useState<Filters>({ ...EMPTY, category: params.category ?? "" });
  const [draft, setDraft] = useState<Filters>(filters);
  const [sort, setSort] = useState<Sort>("newest");
  const [sheet, setSheet] = useState(false);

  const [items, setItems] = useState<ListingCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // Pick up q / category when navigating here from Home.
  useEffect(() => {
    if (params.q !== undefined) { setText(params.q); setQ(params.q); }
    if (params.category !== undefined) { setFilters((f) => ({ ...f, category: params.category ?? "" })); }
  }, [params.q, params.category]);

  // Debounce typing.
  useEffect(() => {
    const t = setTimeout(() => setQ(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text]);

  const build = useCallback((p: number): PartSearchQuery => ({
    q: q || undefined,
    category: filters.category || undefined,
    condition: (filters.condition || undefined) as ConditionOption | undefined,
    minPrice: num(filters.minPrice),
    maxPrice: num(filters.maxPrice),
    location: filters.location.trim() || undefined,
    sort,
    page: p,
  }), [q, filters, sort]);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    const id = ++reqId.current;
    if (mode === "initial") setLoading(true);
    try {
      const r = await searchListings(build(1));
      if (id !== reqId.current) return;
      setItems(r.listings); setTotal(r.total); setPage(1); setError(null);
    } catch (e) {
      if (id !== reqId.current) return;
      setError(errorMessage(e, "We couldn't load listings. Check your connection and try again."));
    } finally {
      if (id === reqId.current) { setLoading(false); setRefreshing(false); }
    }
  }, [build]);

  useEffect(() => { load("initial"); }, [load]);

  const loadMore = async () => {
    if (more || loading || items.length >= total || error) return;
    setMore(true);
    const id = reqId.current;
    try {
      const r = await searchListings(build(page + 1));
      if (id !== reqId.current) return;
      setItems((prev) => { const seen = new Set(prev.map((i) => i.id)); return [...prev, ...r.listings.filter((i) => !seen.has(i.id))]; });
      setPage((p) => p + 1);
    } catch { /* keep what we have; user can scroll again */ }
    finally { setMore(false); }
  };

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.category) activeChips.push({ key: "category", label: CATEGORIES.find((c) => c.slug === filters.category)?.name ?? filters.category, clear: () => setFilters((f) => ({ ...f, category: "" })) });
  if (filters.condition) activeChips.push({ key: "condition", label: filters.condition, clear: () => setFilters((f) => ({ ...f, condition: "" })) });
  if (filters.minPrice) activeChips.push({ key: "min", label: `Min ₹${filters.minPrice}`, clear: () => setFilters((f) => ({ ...f, minPrice: "" })) });
  if (filters.maxPrice) activeChips.push({ key: "max", label: `Max ₹${filters.maxPrice}`, clear: () => setFilters((f) => ({ ...f, maxPrice: "" })) });
  if (filters.location) activeChips.push({ key: "loc", label: filters.location, clear: () => setFilters((f) => ({ ...f, location: "" })) });

  const openSheet = () => { setDraft(filters); setSheet(true); };
  const clearAll = () => { setFilters(EMPTY); setText(""); setQ(""); };

  const search = (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12, paddingBottom: 8, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.ink[200], paddingLeft: 16, paddingRight: 6 }}>
        <Icon name="search-outline" size={18} color={colors.ink[400]} />
        <TextInput value={text} onChangeText={setText} placeholder="Search brand, product, part" placeholderTextColor={colors.ink[400]} returnKeyType="search" onSubmitEditing={() => setQ(text.trim())} autoCorrect={false} accessibilityLabel="Search" style={{ flex: 1, fontFamily: "PlusJakartaSans_400Regular", fontSize: 14.5, color: colors.ink[900] }} />
        <Pressable onPress={openSheet} accessibilityRole="button" accessibilityLabel="Filters" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.ink[900], alignItems: "center", justifyContent: "center" }}>
          <Icon name="options-outline" size={18} color="#fff" />
        </Pressable>
      </View>
      {activeChips.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {activeChips.map((c) => (
            <Pressable key={c.key} onPress={c.clear} accessibilityRole="button" accessibilityLabel={`Remove filter ${c.label}`} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.ink[900], borderRadius: 999, paddingHorizontal: 14, height: 34 }}>
              <Text variant="label" color="#fff">{c.label}</Text>
              <Icon name="close" size={13} color="#fff" />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
  const header = (
    <View style={{ paddingBottom: 12 }}>
      {!loading && !error ? <Text variant="small" color={colors.ink[500]}>{total} {total === 1 ? "listing" : "listings"} found</Text> : null}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading && items.length === 0 ? (
        <View style={{ flex: 1 }}>{search}<Loading /></View>
      ) : (
        <View style={{ flex: 1 }}>
        {search}
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap, marginBottom: gap }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, flexGrow: 1 }}
          ListHeaderComponent={header}
          renderItem={({ item }) => <ListingCard item={item} width={cardW} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load("refresh"); }} tintColor={colors.clay[600]} />}
          ListFooterComponent={more ? <ActivityIndicator color={colors.clay[600]} style={{ marginVertical: 16 }} /> : items.length >= PAGE_SIZE && items.length >= total ? <Text variant="small" color={colors.ink[400]} center style={{ marginVertical: 12 }}>You've reached the end</Text> : null}
          ListEmptyComponent={
            error ? <ErrorState message={error} onRetry={() => load("initial")} /> : (
              <View style={{ gap: 8 }}>
                <EmptyState icon="search-outline" title="No parts found" message="Try different words or fewer filters. Can't find it? Post a need request and sellers will come to you." actionLabel="Tell us what you need" onAction={() => requireAuth(() => router.push("/need"))} />
                {(activeChips.length || q) ? <Button title="Clear search and filters" variant="ghost" onPress={clearAll} /> : null}
              </View>
            )
          }
        />
        </View>
      )}

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Filters">
        <SelectField label="Category" value={draft.category} allowClear placeholder="Any category" options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))} onChange={(v) => setDraft((d) => ({ ...d, category: v }))} />
        <SelectField label="Condition" value={draft.condition} allowClear placeholder="Any condition" options={CONDITION_OPTIONS.map((c) => ({ value: c, label: c }))} onChange={(v) => setDraft((d) => ({ ...d, condition: v }))} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}><Input label="Min price (₹)" value={draft.minPrice} onChangeText={(v) => setDraft((d) => ({ ...d, minPrice: v.replace(/[^0-9]/g, "") }))} keyboardType="number-pad" placeholder="0" /></View>
          <View style={{ flex: 1 }}><Input label="Max price (₹)" value={draft.maxPrice} onChangeText={(v) => setDraft((d) => ({ ...d, maxPrice: v.replace(/[^0-9]/g, "") }))} keyboardType="number-pad" placeholder="Any" /></View>
        </View>
        <View style={{ gap: 6 }}>
          <Text variant="label" color={colors.ink[700]}>Sort by</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {SORTS.map((s) => <Chip key={s.value} label={s.label} selected={sort === s.value} onPress={() => setSort(s.value)} />)}
          </View>
        </View>
        <Input label="Location" value={draft.location} onChangeText={(v) => setDraft((d) => ({ ...d, location: v }))} placeholder="City or area" />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
          <Button title="Reset" variant="outline" style={{ flex: 1 }} onPress={() => { setDraft(EMPTY); setFilters(EMPTY); setSheet(false); }} />
          <Button title="Apply" style={{ flex: 1 }} onPress={() => { setFilters(draft); setSheet(false); }} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
