/** Every write the app can make. Each helper throws ApiError - screens show errorMessage(e). */
import { apiFetch } from "./api";
import type { ConditionOption, NeedRequestStatus, ListingStatus } from "./types";

export interface ListingPayload {
  categorySlug?: string;
  brand: string;
  product: string;
  model?: string;
  part: string;
  condition: ConditionOption;
  price: number;
  description: string;
  location?: string;
}

export async function uploadImage(filename: string, contentType = "image/jpeg"): Promise<string | null> {
  try {
    const r = await apiFetch<{ storagePath: string }>("/uploads/listing-image", { method: "POST", body: { filename, contentType } });
    return r.storagePath ?? null;
  } catch {
    return null; // photo storage isn't set up yet - the listing is still created without it
  }
}

export async function createListing(p: ListingPayload, imagePaths: string[]): Promise<{ id: string }> {
  let categoryId: string | undefined;
  try {
    const cats = await apiFetch<{ id: string; slug: string }[]>("/catalog/categories", { authenticated: false });
    categoryId = cats.find((c) => c.slug === p.categorySlug)?.id;
  } catch {
    /* optional */
  }
  return apiFetch<{ id: string }>("/listings", {
    method: "POST",
    body: {
      categoryId, brandName: p.brand, productName: p.product, modelLabel: p.model || undefined, partName: p.part,
      condition: p.condition, price: p.price, description: p.description, location: p.location || undefined,
      imagePaths: imagePaths.length ? imagePaths : undefined,
    },
  });
}
export const updateListing = (id: string, p: ListingPayload) =>
  apiFetch(`/listings/${id}`, {
    method: "PATCH",
    body: { brandName: p.brand, productName: p.product, modelLabel: p.model || "", partName: p.part, condition: p.condition, price: p.price, description: p.description, location: p.location || "" },
  });
export const setListingStatus = (id: string, status: ListingStatus) => apiFetch(`/listings/${id}/status`, { method: "PATCH", body: { status } });
export const deleteListing = (id: string) => apiFetch(`/listings/${id}`, { method: "DELETE" });

export async function createNeedRequest(p: { categorySlug?: string; brand: string; product: string; model?: string; part: string; description?: string; location?: string }) {
  let categoryId: string | undefined;
  try {
    const cats = await apiFetch<{ id: string; slug: string }[]>("/catalog/categories", { authenticated: false });
    categoryId = cats.find((c) => c.slug === p.categorySlug)?.id;
  } catch {
    /* optional */
  }
  return apiFetch("/need-requests", {
    method: "POST",
    body: { categoryId, brandName: p.brand, productName: p.product, modelLabel: p.model || undefined, partName: p.part, description: p.description || undefined, location: p.location || undefined },
  });
}
export const setNeedStatus = (id: string, status: NeedRequestStatus) => apiFetch(`/need-requests/${id}/status`, { method: "PATCH", body: { status } });
export const deleteNeedRequest = (id: string) => apiFetch(`/need-requests/${id}`, { method: "DELETE" });

export const toggleSaved = (listingId: string, save: boolean) => apiFetch(`/saved/${listingId}`, { method: save ? "POST" : "DELETE" });

export const sendMessage = (conversationId: string, body: string) => apiFetch(`/conversations/${conversationId}/messages`, { method: "POST", body: { body } });
/** Starts (or reopens) a chat with a listing's seller by sending the first message. */
export const contactSeller = (listingId: string, message: string, contactInfo?: string) =>
  apiFetch<{ conversationId: string }>(`/listings/${listingId}/contact`, { method: "POST", body: { message, contactInfo: contactInfo || undefined } });
export const blockUser = (userId: string) => apiFetch(`/blocks/${userId}`, { method: "POST" });
export const unblockUser = (userId: string) => apiFetch(`/blocks/${userId}`, { method: "DELETE" });
export const reportItem = (targetType: string, targetId: string, reason: string, details?: string) =>
  apiFetch("/reports", { method: "POST", body: { targetType, targetId, reason, details: details || undefined } });
export const createReview = (listingId: string, rating: number, comment: string) =>
  apiFetch(`/listings/${listingId}/reviews`, { method: "POST", body: { rating, comment } });

export const updateProfile = (b: { displayName: string; location?: string; phone?: string; bio?: string; avatarUrl?: string }) =>
  apiFetch("/profile/me", { method: "PATCH", body: { displayName: b.displayName, location: b.location || undefined, phone: b.phone || undefined, bio: b.bio ?? "", ...(b.avatarUrl !== undefined ? { avatarUrl: b.avatarUrl } : {}) } });
export const changePassword = (currentPassword: string, newPassword: string) => apiFetch("/auth/change-password", { method: "PATCH", body: { currentPassword, newPassword } });
export const forgotPassword = (email: string) => apiFetch<{ message?: string }>("/auth/forgot-password", { method: "POST", authenticated: false, body: { email } });
export const resetPassword = (token: string, newPassword: string) => apiFetch("/auth/reset-password", { method: "POST", authenticated: false, body: { token, newPassword } });
export const deleteAccount = (password: string) => apiFetch("/profile/me", { method: "DELETE", body: { password } });
export const sendSupportMessage = (b: { name: string; email: string; topic: string; message: string }) =>
  apiFetch("/support/contact", { method: "POST", authenticated: false, body: { ...b, website: "" } });
export const registerPushToken = (token: string, platform: string) => apiFetch("/profile/me/push-token", { method: "POST", body: { token, platform } });
