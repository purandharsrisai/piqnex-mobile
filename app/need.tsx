import React, { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Button, Icon, Input, Photo, Screen, SelectField, Text } from "@/components/ui";
import { useAuth } from "@/context/Auth";
import { colors, fonts } from "@/theme";
import { formatPrice } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import { needRequestSchema } from "@/lib/validations";
import { getNeedMatches, type ListingCardData } from "@/lib/data";
import { createNeedRequest } from "@/lib/actions";
import { errorMessage } from "@/lib/api";

type F = { category: string; brand: string; product: string; model: string; part: string; description: string; location: string };
const EMPTY: F = { category: "", brand: "", product: "", model: "", part: "", description: "", location: "" };

export default function NeedScreen() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [f, setF] = useState<F>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof F, string>>>({});
  const [matches, setMatches] = useState<ListingCardData[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const [details, setDetails] = useState(false);
  const reqId = useRef(0);

  const set = (k: keyof F) => (v: string) => { setF((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); };

  const ready = !!(f.brand.trim() && f.product.trim() && f.part.trim());

  const runSearch = async () => {
    const id = ++reqId.current;
    setSearching(true);
    try {
      const m = await getNeedMatches({ brand: f.brand.trim(), product: f.product.trim(), model: f.model.trim() || null, part: f.part.trim() });
      if (id === reqId.current) { setMatches(m); setSearchError(null); }
    } catch (e) {
      if (id === reqId.current) setSearchError(errorMessage(e, "Couldn't search for matches right now."));
    } finally {
      if (id === reqId.current) setSearching(false);
    }
  };

  useEffect(() => {
    if (!ready) { reqId.current++; setMatches(null); setSearchError(null); setSearching(false); return; }
    const t = setTimeout(runSearch, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.brand, f.product, f.model, f.part, ready]);

  const findMatches = () => {
    if (!ready) {
      setErrors((p) => ({
        ...p,
        brand: f.brand.trim() ? undefined : "Brand is required",
        product: f.product.trim() ? undefined : "Product is required",
        part: f.part.trim() ? undefined : "Part is required",
      }));
      return;
    }
    runSearch();
  };

  const post = () => {
    const parsed = needRequestSchema.safeParse(f);
    if (!parsed.success) {
      const next: Partial<Record<keyof F, string>> = {};
      for (const i of parsed.error.issues) { const k = i.path[0] as keyof F; if (!next[k]) next[k] = i.message; }
      setErrors(next);
      return;
    }
    requireAuth(async () => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        await createNeedRequest({ categorySlug: f.category, brand: f.brand.trim(), product: f.product.trim(), model: f.model.trim(), part: f.part.trim(), description: f.description.trim(), location: f.location.trim() });
        setPosted(true);
      } catch (e) {
        setSubmitError(errorMessage(e));
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (posted) {
    return (
      <Screen contentStyle={{ justifyContent: "center", gap: 14, paddingHorizontal: 20 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.moss[100], alignItems: "center", justifyContent: "center" }}>
            <Icon name="checkmark" size={40} color={colors.moss[700]} />
          </View>
          <Text center style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 }}>Request posted</Text>
          <Text color={colors.ink[500]} center>We'll let you know as soon as someone lists a matching part.</Text>
        </View>
        <Button title="View my requests" onPress={() => router.replace("/my-requests")} />
        <Button title="Post another" variant="outline" onPress={() => { setF(EMPTY); setPosted(false); setMatches(null); }} />
      </Screen>
    );
  }

  const postBlock = (primary: boolean) => (
    <View style={{ gap: 12 }}>
      <Pressable onPress={() => setDetails((d) => !d)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" }}>
        <Text variant="label" color={colors.clay[700]} style={{ fontFamily: fonts.bold }}>Add details (optional)</Text>
        <Icon name={details ? "chevron-up" : "chevron-down"} size={16} color={colors.clay[700]} />
      </Pressable>
      {details ? (
        <View style={{ gap: 12 }}>
          <Input label="Model (optional)" value={f.model} onChangeText={set("model")} error={errors.model} />
          <Input label="Description" placeholder="Anything that helps a seller identify it" multiline value={f.description} onChangeText={set("description")} error={errors.description} />
          <Input label="Location" icon="location-outline" placeholder="City or area" value={f.location} onChangeText={set("location")} error={errors.location} />
        </View>
      ) : null}
      {submitError ? <Text color={colors.danger}>{submitError}</Text> : null}
      <Button title={primary ? "Post my request" : "Still not right? Post a request"} variant={primary ? "primary" : "outline"} onPress={post} loading={submitting} />
    </View>
  );

  return (
    <Screen keyboard edges={["top", "bottom"]} contentStyle={{ gap: 16, paddingHorizontal: 20, paddingBottom: 32 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} hitSlop={12} accessibilityLabel="Back" style={{ width: 40, height: 40, marginLeft: -8, alignItems: "center", justifyContent: "center" }}>
        <Icon name="chevron-back" size={26} color={colors.ink[900]} />
      </Pressable>
      <Text style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 }}>What are you looking for?</Text>
      <SelectField label="Category" value={f.category} options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))} onChange={set("category")} placeholder="Choose a category" error={errors.category} />
      <View style={{ gap: 6 }}>
        <Text variant="label" color={colors.ink[700]}>Brand · Product</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}><Input placeholder="Brand" value={f.brand} onChangeText={set("brand")} error={errors.brand} autoCapitalize="words" /></View>
          <View style={{ flex: 1 }}><Input placeholder="Product" value={f.product} onChangeText={set("product")} error={errors.product} /></View>
        </View>
      </View>
      <Input label="Part" placeholder="e.g. Magnetic charging cable" value={f.part} onChangeText={set("part")} error={errors.part} />
      <Button title="Find matches" onPress={findMatches} loading={searching} />

      {searchError ? <Text color={colors.danger}>{searchError}</Text> : null}

      {matches && matches.length > 0 && !searchError ? (
        <>
          <View style={{ backgroundColor: colors.moss[50], borderRadius: 18, padding: 14, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name="checkmark" size={18} color={colors.moss[700]} />
              <Text variant="label" color={colors.moss[700]} style={{ fontFamily: fonts.bold }}>
                {matches.length} exact {matches.length === 1 ? "match" : "matches"}
              </Text>
            </View>
            {matches.map((m) => (
              <Pressable key={m.id} onPress={() => router.push(`/parts/${m.id}`)} accessibilityRole="button" accessibilityLabel={`View ${m.part}`} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Photo uri={m.imageUrl} letter={m.part} style={{ width: 40, height: 40, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 14.5 }} numberOfLines={1}>{m.part}</Text>
                  <Text variant="small" color={colors.ink[500]} numberOfLines={1}>{m.brand} {m.product}{m.location ? ` · ${m.location}` : ""}</Text>
                </View>
                <Text style={{ fontFamily: fonts.bold, fontSize: 16 }}>{formatPrice(m.price)}</Text>
              </Pressable>
            ))}
          </View>
          {postBlock(false)}
        </>
      ) : null}

      {matches && matches.length === 0 && !searchError ? (
        <>
          <View style={{ backgroundColor: colors.ink[50], borderRadius: 18, padding: 14, gap: 4 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 15 }}>No exact matches yet</Text>
            <Text variant="small" color={colors.ink[500]}>Post a request and we'll tell you as soon as someone lists this part.</Text>
          </View>
          {postBlock(true)}
        </>
      ) : null}
    </Screen>
  );
}
