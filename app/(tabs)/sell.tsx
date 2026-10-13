import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Loading, SignInPrompt, Text } from "@/components/ui";
import { ListingForm, type ListingFormValues } from "@/components/listing-form/ListingForm";
import { useAuth } from "@/context/Auth";
import { colors, fonts, radius } from "@/theme";
import { Icon, Photo } from "@/components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { createListing, uploadImage } from "@/lib/actions";
import { getOpenNeedRequestMatches, type MyNeedRequest } from "@/lib/data";

interface Done { id: string; photosSkipped: boolean; matches: MyNeedRequest[] }

export default function SellScreen() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [done, setDone] = useState<Done | null>(null);
  const [formKey, setFormKey] = useState(0);

  if (!ready) return <Loading />;
  if (!user) return <SignInPrompt icon="pricetag-outline" title="Sell a part" message="Log in or create an account to list a part for sale." />;

  const publish = async (v: ListingFormValues, photos: string[]) => {
    const paths: string[] = [];
    for (const uri of photos) {
      const name = uri.split("/").pop() || `photo-${Date.now()}.jpg`;
      const p = await uploadImage(name);
      if (p) paths.push(p);
    }
    const { id } = await createListing(
      { categorySlug: v.category, brand: v.brand, product: v.product, model: v.model, part: v.part, condition: v.condition as never, price: Number(v.price), description: v.description, location: v.location },
      paths,
    );
    const matches = await getOpenNeedRequestMatches({ brand: v.brand, product: v.product, model: v.model, part: v.part });
    setDone({ id, photosSkipped: photos.length > 0 && paths.length === 0, matches });
  };

  if (done) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.paper }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} showsVerticalScrollIndicator={false}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.clay[600] }} />
          <View style={{ alignItems: "center", gap: 10, paddingTop: 20 }}>
            <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.moss[100], alignItems: "center", justifyContent: "center" }}>
              <Icon name="checkmark" size={40} color={colors.moss[700]} />
            </View>
            <Text center style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 }}>Your part is live</Text>
            <Text color={colors.ink[500]} center>
              {done.photosSkipped ? "Your listing is live. Photo upload isn't available yet." : "Buyers can now find and message you."}
            </Text>
          </View>
          {done.matches.length > 0 ? (
            <View style={{ backgroundColor: colors.moss[50], borderRadius: 18, padding: 14, gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="checkmark" size={18} color={colors.moss[700]} />
                <Text variant="label" color={colors.moss[700]} style={{ fontFamily: fonts.bold }}>
                  {done.matches.length} {done.matches.length === 1 ? "person is" : "people are"} looking for exactly this
                </Text>
              </View>
              {done.matches.map((m) => (
                <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: radius.md, padding: 10 }}>
                  <Photo uri={null} letter={m.part} style={{ width: 40, height: 40, borderRadius: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text variant="label" style={{ fontFamily: fonts.bold }} numberOfLines={1}>{m.part}</Text>
                    <Text variant="small" color={colors.ink[500]} numberOfLines={1}>
                      {m.brand} {m.product}{m.model ? ` ${m.model}` : ""}{m.location ? ` · ${m.location}` : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
          <View style={{ gap: 10 }}>
            <Button title="View listing" onPress={() => router.push(`/parts/${done.id}`)} />
            <Button title="Post another" variant="outline" onPress={() => { setDone(null); setFormKey((k) => k + 1); }} />
            <Button title="My listings" variant="ghost" onPress={() => router.push("/my-listings")} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <ListingForm key={formKey} mode="create" edges={["top", "bottom"]} onSubmit={publish} />;
}
