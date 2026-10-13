import React, { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Alert } from "@/components/ui/Dialog";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Button, Icon, Input, Photo, SelectField, Text } from "@/components/ui";
import { colors, fonts, radius } from "@/theme";
import { CATEGORIES } from "@/lib/categories";
import { CONDITION_OPTIONS } from "@/lib/types";
import { listingSchema } from "@/lib/validations";
import { errorMessage } from "@/lib/api";

export interface ListingFormValues {
  category: string;
  brand: string;
  product: string;
  model: string;
  part: string;
  condition: string;
  price: string;
  description: string;
  location: string;
}

export const EMPTY_LISTING_VALUES: ListingFormValues = {
  category: "", brand: "", product: "", model: "", part: "", condition: "", price: "", description: "", location: "",
};

export const MAX_PHOTOS = 6;
type Errors = Partial<Record<keyof ListingFormValues, string>>;

const STEP_FIELDS: (keyof ListingFormValues)[][] = [
  ["category", "brand", "product", "model", "part"],
  ["condition", "price", "description", "location"],
];

async function shrink(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const longest = Math.max(asset.width || 0, asset.height || 0);
  const actions: ImageManipulator.Action[] = [];
  if (longest > 1280) {
    actions.push(asset.width >= asset.height ? { resize: { width: 1280 } } : { resize: { height: 1280 } });
  }
  const r = await ImageManipulator.manipulateAsync(asset.uri, actions, { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
  return r.uri;
}

export function ListingForm({
  mode, initial, existingPhotos = [], onSubmit, submitLabel,
}: {
  mode: "create" | "edit";
  initial?: Partial<ListingFormValues>;
  /** Edit mode: photos already on the listing (shown read-only). */
  existingPhotos?: string[];
  onSubmit: (values: ListingFormValues, photoUris: string[]) => Promise<void>;
  edges?: ("top" | "bottom" | "left" | "right")[];
  submitLabel?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ListingFormValues>({ ...EMPTY_LISTING_VALUES, ...initial });
  const [errors, setErrors] = useState<Errors>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [busyPhoto, setBusyPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = mode === "edit" ? 2 : 3;

  const set = (k: keyof ListingFormValues) => (v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (fields: (keyof ListingFormValues)[]): boolean => {
    const next: Errors = {};
    const parsed = listingSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ListingFormValues;
        if (fields.includes(key) && !next[key]) next[key] = issue.message;
      }
    }
    if (fields.includes("condition") && !values.condition) next.condition = "Please choose a condition";
    if (fields.includes("price") && !values.price.trim()) next.price = "Enter a price";
    setErrors((p) => ({ ...p, ...Object.fromEntries(fields.map((f) => [f, undefined])), ...next }));
    return Object.keys(next).length === 0;
  };

  const addAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setBusyPhoto(true);
    try {
      const out: string[] = [];
      for (const a of assets) out.push(await shrink(a));
      setPhotos((p) => [...p, ...out].slice(0, MAX_PHOTOS));
    } catch {
      Alert.alert("Couldn't add photo", "Something went wrong while preparing your photo. Please try another one.");
    } finally {
      setBusyPhoto(false);
    }
  };

  const pickLibrary = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: remaining, quality: 1 });
      if (!r.canceled) await addAssets(r.assets.slice(0, remaining));
    } catch {
      Alert.alert("Photos unavailable", "Piqnex needs access to your photos. You can allow it in your phone's Settings.");
    }
  };

  const takePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera access needed", "Allow camera access in your phone's Settings to take photos of your part, or choose from your library instead.");
      return;
    }
    try {
      const r = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 });
      if (!r.canceled) await addAssets(r.assets);
    } catch {
      Alert.alert("Camera unavailable", "We couldn't open the camera. Try choosing from your library instead.");
    }
  };

  const addPhoto = () =>
    Alert.alert("Add a photo", undefined, [
      { text: "Take a photo", onPress: takePhoto },
      { text: "Choose from library", onPress: pickLibrary },
      { text: "Cancel", style: "cancel" },
    ]);

  const next = () => { if (validate(STEP_FIELDS[0])) setStep(1); };
  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const submit = async () => {
    // Re-validate everything; jump back to step 1 if its data is invalid.
    const step0Ok = validate(STEP_FIELDS[0]);
    const step1Ok = validate(STEP_FIELDS[1]);
    if (!step0Ok) { setStep(0); return; }
    if (!step1Ok) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(values, photos);
    } catch (e) {
      setSubmitError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "edit" ? "Edit listing" : "List a spare part";
  const TILE = 96;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.paper }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingHorizontal: 20, paddingTop: 6, gap: 10 }}>
        <View style={{ height: 40, alignItems: "center", justifyContent: "center" }}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Back" style={{ position: "absolute", left: -6, width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevron-back" size={26} color={colors.ink[900]} />
          </Pressable>
          <Text variant="bodyMedium" style={{ fontFamily: fonts.semibold }}>{title}</Text>
        </View>
        <View
          accessibilityLabel={`Step ${step + 1} of ${totalSteps}`}
          style={{ height: 4, borderRadius: 2, backgroundColor: colors.ink[100], overflow: "hidden" }}
        >
          <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.clay[600], width: `${((step + 1) / totalSteps) * 100}%` }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <>
            <Text style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 }}>What is it?</Text>
            <SelectField
              label="Category"
              value={values.category}
              options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
              onChange={set("category")}
              placeholder="Choose a category"
              error={errors.category}
            />
            <Input label="Brand" placeholder="e.g. Apple" value={values.brand} onChangeText={set("brand")} error={errors.brand} autoCapitalize="words" />
            <Input label="Product" placeholder="e.g. Watch Series 7" value={values.product} onChangeText={set("product")} error={errors.product} />
            <Input label="Model (optional)" placeholder="e.g. A2474" value={values.model} onChangeText={set("model")} error={errors.model} />
            <Input label="Part" placeholder="e.g. Magnetic charging cable" value={values.part} onChangeText={set("part")} error={errors.part} />
          </>
        )}

        {step === 1 && (
          <>
            {mode === "create" ? (
              <View style={{ gap: 8 }}>
                <Text variant="label" style={{ fontFamily: fonts.bold }}>
                  Photos <Text variant="small" color={colors.ink[500]}>(up to {MAX_PHOTOS})</Text>
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {photos.map((uri, i) => (
                    <View key={uri + i} style={{ width: TILE, height: TILE }}>
                      <Photo uri={uri} style={{ width: TILE, height: TILE, borderRadius: 16 }} />
                      <Pressable
                        onPress={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                        accessibilityLabel={`Remove photo ${i + 1}`}
                        hitSlop={8}
                        style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(15,18,40,0.75)", alignItems: "center", justifyContent: "center" }}
                      >
                        <Icon name="close" size={14} color="#fff" />
                      </Pressable>
                    </View>
                  ))}
                  {photos.length < MAX_PHOTOS ? (
                    <Pressable
                      onPress={addPhoto}
                      disabled={busyPhoto}
                      accessibilityRole="button"
                      accessibilityLabel="Add photo"
                      style={{ width: TILE, height: TILE, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.ink[300], alignItems: "center", justifyContent: "center", gap: 4, opacity: busyPhoto ? 0.5 : 1 }}
                    >
                      <Icon name="camera-outline" size={24} color={colors.ink[500]} />
                      <Text variant="caption" color={colors.ink[400]}>{busyPhoto ? "Adding..." : "Add"}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ) : existingPhotos.length > 0 ? (
              <View style={{ gap: 8 }}>
                <Text variant="label" style={{ fontFamily: fonts.bold }}>Photos</Text>
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  {existingPhotos.map((u, i) => <Photo key={u + i} uri={u} style={{ width: 64, height: 64, borderRadius: 14 }} />)}
                </View>
                <Text variant="small" color={colors.ink[500]}>Photos can't be changed here yet.</Text>
              </View>
            ) : null}

            <View style={{ gap: 8 }}>
              <Text variant="label" style={{ fontFamily: fonts.bold }}>Condition</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {CONDITION_OPTIONS.map((c) => {
                  const sel = values.condition === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => set("condition")(c)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: sel }}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: sel ? colors.ink[900] : colors.ink[50] }}
                    >
                      <Text variant="label" color={sel ? "#fff" : colors.ink[600]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.condition ? <Text variant="small" color={colors.danger}>{errors.condition}</Text> : null}
            </View>

            <View style={{ gap: 6 }}>
              <Text variant="label" style={{ fontFamily: fonts.bold }}>Price (INR)</Text>
              <View style={{ flexDirection: "row", alignItems: "center", minHeight: 50, borderWidth: 1, borderColor: errors.price ? colors.danger : colors.ink[200], borderRadius: 14, paddingHorizontal: 14, gap: 6, backgroundColor: "#fff" }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 15.5 }}>₹</Text>
                <TextInput
                  value={values.price}
                  onChangeText={(t) => set("price")(t.replace(/[^0-9.]/g, ""))}
                  placeholder="2,500"
                  placeholderTextColor={colors.ink[400]}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Price in rupees"
                  style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 15.5, color: colors.ink[900], paddingVertical: 10 }}
                />
              </View>
              {errors.price ? <Text variant="small" color={colors.danger}>{errors.price}</Text> : null}
            </View>

            <Input
              label="Description"
              placeholder="Lost the left earbud, right one works great..."
              multiline
              value={values.description}
              onChangeText={set("description")}
              error={errors.description}
            />
            <Input label="Location (optional)" placeholder="City or area" icon="location-outline" value={values.location} onChangeText={set("location")} error={errors.location} />
            {submitError ? <Text color={colors.danger}>{submitError}</Text> : null}
          </>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.ink[100], backgroundColor: "#fff" }}>
        {step === 0 ? (
          <Button title="Next" onPress={next} />
        ) : (
          <Button title={submitLabel ?? (mode === "edit" ? "Save changes" : "Publish listing")} onPress={submit} loading={submitting} />
        )}
      </View>
    </SafeAreaView>
  );
}
