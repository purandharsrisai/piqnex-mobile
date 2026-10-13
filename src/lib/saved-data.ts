import { apiFetch } from "./api";
import { toCard, type ListingCardData } from "./data";

export type SavedCard = ListingCardData & { status: string };

/** Saved listings with their status (the shared getSavedListings drops it). */
export async function getSavedWithStatus(): Promise<SavedCard[]> {
  const rows = await apiFetch<(Parameters<typeof toCard>[0])[]>("/saved");
  return rows.map((r) => ({ ...toCard(r), status: r.status }));
}
