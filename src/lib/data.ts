/**
 * Data-access layer: every read the screens need, mapped from backend shapes
 * to simple app shapes. Mirrors piqnex-frontend/src/lib/{listings,messages,
 * need-requests,profile-data,reviews}.ts. Writes live in lib/actions.ts.
 */
import { apiFetch, publicImageUrl } from "./api";
import type { ConditionOption, ListingStatus, NeedRequestStatus, PartSearchQuery } from "./types";
import type { MatchableFields } from "./matching";

// ---- shapes -----------------------------------------------------------------
export interface ListingCardData {
  id: string;
  imageUrl: string | null;
  brand: string;
  product: string;
  model: string | null;
  part: string;
  condition: ConditionOption;
  price: number;
  location: string | null;
}

interface RawImage { storagePath: string; sortOrder: number }
interface RawListing {
  id: string;
  sellerId: string;
  brandName: string;
  productName: string;
  modelLabel: string | null;
  partName: string;
  condition: ConditionOption;
  price: number | string;
  currency: string;
  description: string;
  location: string | null;
  status: string;
  createdAt: string;
  images: RawImage[];
  seller?: { id: string; displayName: string; location: string | null } | null;
}

const firstImage = (images?: RawImage[]) =>
  [...(images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => publicImageUrl(i.storagePath)).find(Boolean) ?? null;

export function toCard(row: RawListing): ListingCardData {
  return {
    id: row.id,
    imageUrl: firstImage(row.images),
    brand: row.brandName,
    product: row.productName,
    model: row.modelLabel,
    part: row.partName,
    condition: row.condition,
    price: Number(row.price),
    location: row.location,
  };
}

// ---- listings ---------------------------------------------------------------
export async function getHomepageListings(limit: number): Promise<ListingCardData[]> {
  const data = await apiFetch<RawListing[]>("/listings/featured", { authenticated: false, query: { limit } });
  return data.map(toCard);
}

export const PAGE_SIZE = 12;

export async function searchListings(query: PartSearchQuery): Promise<{ listings: ListingCardData[]; total: number }> {
  const freeText = [query.brand, query.product, query.model, query.part, query.q].filter((v): v is string => Boolean(v && v.trim())).join(" ").trim();
  const r = await apiFetch<{ items: RawListing[]; total: number }>("/listings", {
    authenticated: false,
    query: {
      category: query.category,
      condition: query.condition,
      location: query.location,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      q: freeText || undefined,
      sort: query.sort,
      page: query.page ?? 1,
    },
  });
  return { listings: r.items.map(toCard), total: r.total };
}

export async function getNeedMatches(q: MatchableFields): Promise<ListingCardData[]> {
  const data = await apiFetch<RawListing[]>("/listings/match", {
    authenticated: false,
    query: { brandName: q.brand, productName: q.product, modelLabel: q.model ?? undefined, partName: q.part },
  });
  return data.map(toCard);
}

export interface ListingDetail {
  id: string;
  sellerId: string;
  brand: string;
  product: string;
  model: string | null;
  part: string;
  condition: ConditionOption;
  price: number;
  currency: string;
  description: string;
  location: string | null;
  status: string;
  createdAt: string;
  images: string[];
  seller: { displayName: string; location: string | null } | null;
}

export async function getListingDetail(id: string): Promise<ListingDetail | null> {
  try {
    const row = await apiFetch<RawListing>(`/listings/${id}`, { authenticated: false });
    const images = [...(row.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => publicImageUrl(i.storagePath)).filter((u): u is string => !!u);
    return {
      id: row.id,
      sellerId: row.sellerId,
      brand: row.brandName,
      product: row.productName,
      model: row.modelLabel,
      part: row.partName,
      condition: row.condition,
      price: Number(row.price),
      currency: row.currency,
      description: row.description,
      location: row.location,
      status: row.status,
      createdAt: row.createdAt,
      images,
      seller: row.seller ? { displayName: row.seller.displayName, location: row.seller.location } : null,
    };
  } catch {
    return null;
  }
}

export const getSavedIds = () => apiFetch<string[]>("/saved/ids").catch(() => [] as string[]);
export async function getSavedListings(): Promise<ListingCardData[]> {
  return (await apiFetch<RawListing[]>("/saved")).map(toCard);
}

// ---- profile ----------------------------------------------------------------
export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  location: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface MyListing {
  id: string;
  brand: string;
  product: string;
  model: string | null;
  part: string;
  condition: ConditionOption;
  price: number;
  status: ListingStatus;
  imageUrl: string | null;
  createdAt: string;
}
export async function getMyListings(): Promise<MyListing[]> {
  const rows = await apiFetch<(RawListing & { status: ListingStatus })[]>("/profile/me/listings");
  return rows.map((r) => ({
    id: r.id, brand: r.brandName, product: r.productName, model: r.modelLabel, part: r.partName,
    condition: r.condition, price: Number(r.price), status: r.status, imageUrl: firstImage(r.images), createdAt: r.createdAt,
  }));
}

export interface MyNeedRequest {
  id: string;
  brand: string;
  product: string;
  model: string | null;
  part: string;
  description: string | null;
  location: string | null;
  status: NeedRequestStatus;
  createdAt: string;
}
interface RawNeed {
  id: string; brandName: string; productName: string; modelLabel: string | null; partName: string;
  description?: string | null; location?: string | null; status: NeedRequestStatus; createdAt: string;
}
const toNeed = (r: RawNeed): MyNeedRequest => ({
  id: r.id, brand: r.brandName, product: r.productName, model: r.modelLabel, part: r.partName,
  description: r.description ?? null, location: r.location ?? null, status: r.status, createdAt: r.createdAt,
});
export async function getMyNeedRequests(): Promise<MyNeedRequest[]> {
  return (await apiFetch<RawNeed[]>("/profile/me/need-requests")).map(toNeed);
}
export async function getOpenNeedRequestMatches(f: MatchableFields): Promise<MyNeedRequest[]> {
  try {
    const rows = await apiFetch<RawNeed[]>("/need-requests/match", {
      authenticated: false,
      query: { brandName: f.brand, productName: f.product, modelLabel: f.model ?? undefined, partName: f.part },
    });
    return rows.map(toNeed);
  } catch {
    return [];
  }
}

// ---- sellers & reviews ------------------------------------------------------
export interface SellerProfileData {
  seller: { id: string; displayName: string; location: string | null; createdAt: string };
  rating: { average: number | null; count: number };
  soldCount: number;
  reviews: { id: string; rating: number; comment: string; createdAt: string; reviewer: { id: string; displayName: string }; listing: { id: string; partName: string } }[];
  listings: ListingCardData[];
}
export async function getSellerProfile(id: string): Promise<SellerProfileData | null> {
  try {
    const raw = await apiFetch<Omit<SellerProfileData, "listings"> & { listings: RawListing[] }>(`/sellers/${id}`, { authenticated: false });
    return { ...raw, listings: raw.listings.map(toCard) };
  } catch {
    return null;
  }
}
export async function getSellerRating(id: string): Promise<{ average: number | null; count: number }> {
  try {
    return await apiFetch(`/sellers/${id}/rating`, { authenticated: false });
  } catch {
    return { average: null, count: 0 };
  }
}
export async function getReviewEligibility(listingId: string): Promise<{ canReview: boolean; hasReviewed: boolean }> {
  try {
    return await apiFetch(`/listings/${listingId}/review-eligibility`);
  } catch {
    return { canReview: false, hasReviewed: false };
  }
}

// ---- messages ---------------------------------------------------------------
export interface ChatUser { id: string; displayName: string; avatarUrl: string | null }
export interface ConversationSummary {
  id: string;
  listing: { id: string; partName: string; productName: string; brandName: string; price: number; currency: string; status: string; imageUrl: string | null };
  role: "buying" | "selling";
  other: ChatUser;
  lastMessage: { id: string; senderId: string; body: string; createdAt: string } | null;
  lastMessageAt: string;
  unread: number;
}
export interface ChatMessage { id: string; senderId: string; body: string; createdAt: string }
export interface ConversationThread {
  id: string;
  listing: { id: string; partName: string; productName: string; brandName: string; modelLabel: string | null; condition: string; location: string | null; sellerId: string; price: string; currency: string; status: string; imageUrl: string | null };
  other: ChatUser;
  me: string;
  myReadAt: string | null;
  otherReadAt: string | null;
  messages: ChatMessage[];
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const rows = await apiFetch<any[]>("/conversations");
  return rows.map(({ listing: { images, price, ...listing }, ...row }) => ({
    ...row,
    listing: { ...listing, price: Number(price), imageUrl: firstImage(images) },
  }));
}
export async function getThread(id: string): Promise<ConversationThread | null> {
  try {
    const t = await apiFetch<any>(`/conversations/${id}`);
    const { images, ...listing } = t.listing;
    return { ...t, listing: { ...listing, imageUrl: firstImage(images) } };
  } catch {
    return null;
  }
}
export async function getUnreadCount(): Promise<number> {
  try {
    return (await apiFetch<{ count: number }>("/conversations/unread-count")).count;
  } catch {
    return 0;
  }
}
