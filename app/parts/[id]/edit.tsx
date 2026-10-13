import React from "react";
import { Alert } from "@/components/ui/Dialog";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EmptyState, ErrorState, Loading, Screen } from "@/components/ui";
import { ListingForm, type ListingFormValues } from "@/components/listing-form/ListingForm";
import { useAuth } from "@/context/Auth";
import { useQuery } from "@/lib/hooks";
import { getListingDetail } from "@/lib/data";
import { updateListing } from "@/lib/actions";
import { CATEGORIES } from "@/lib/categories";

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const q = useQuery(() => getListingDetail(String(id)), [id]);

  if (!ready || q.loading) return <Loading />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;
  const l = q.data;
  if (!user || !l || l.sellerId !== user.id) {
    return <Screen><EmptyState icon="lock-closed-outline" title="Listing not available" message="You can only edit your own listings." actionLabel="Go back" onAction={() => router.back()} /></Screen>;
  }

  const initial: Partial<ListingFormValues> = {
    category: CATEGORIES.find((c) => c.slug === (l as unknown as { categorySlug?: string }).categorySlug)?.slug ?? "other",
    brand: l.brand, product: l.product, model: l.model ?? "", part: l.part, condition: l.condition,
    price: String(l.price), description: l.description, location: l.location ?? "",
  };

  return (
    <ListingForm
      mode="edit"
      initial={initial}
      existingPhotos={l.images}
      onSubmit={async (v) => {
        await updateListing(l.id, { categorySlug: v.category, brand: v.brand, product: v.product, model: v.model, part: v.part, condition: v.condition as never, price: Number(v.price), description: v.description, location: v.location });
        Alert.alert("Saved", "Your listing has been updated.");
        router.back();
      }}
    />
  );
}
