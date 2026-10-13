/**
 * Core domain types for Piqnex.
 *
 * These mirror the backend database schema (piqnex-backend/prisma/schema.prisma).
 * Keeping them hand-written (instead of only relying on generated types) makes
 * the app easier to read for someone learning the codebase - you can see the
 * whole data model in one file.
 */

export type ConditionOption =
  | "New"
  | "Like New"
  | "Used - Working"
  | "Used - Good"
  | "Used - Fair"
  | "For Parts";

export const CONDITION_OPTIONS: ConditionOption[] = [
  "New",
  "Like New",
  "Used - Working",
  "Used - Good",
  "Used - Fair",
  "For Parts",
];

export type ListingStatus = "active" | "sold" | "removed";
export type NeedRequestStatus = "open" | "matched" | "closed";

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
}

export interface Product {
  id: string;
  brand_id: string;
  category_id: string;
  name: string; // e.g. "WF-1000XM4"
  slug: string;
}


export interface Part {
  id: string;
  model_id: string;
  name: string; // e.g. "Right Earbud", "65W Charger"
  slug: string;
}

export interface Profile {
  id: string; // matches auth.users.id
  display_name: string;
  location: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  category_id: string;
  brand_id: string;
  product_id: string;
  model_id: string | null;
  part_id: string | null;
  // Denormalized text fields so listings still display sensibly even for
  // long-tail products/parts that aren't in the structured catalog yet.
  brand_name: string;
  product_name: string;
  model_label: string | null;
  part_name: string;
  condition: ConditionOption;
  price: number;
  currency: string;
  description: string;
  location: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
}


export interface NeedRequest {
  id: string;
  requester_id: string;
  category_id: string | null;
  brand_name: string;
  product_name: string;
  model_label: string | null;
  part_name: string;
  description: string | null;
  location: string | null;
  status: NeedRequestStatus;
  created_at: string;
}


/** Shape of the search/filter form shared by /need and /browse. */
export interface PartSearchQuery {
  category?: string;
  brand?: string;
  product?: string;
  model?: string;
  part?: string;
  condition?: ConditionOption;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
}
