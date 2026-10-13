import { DEMO_MODE, DemoHttpError, demoRequest } from "./demo-data";
import { getItem, removeItem, setItem } from "./storage";

export { DEMO_MODE };

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
const TOKEN_KEY = "piqnex_token";

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

let token: string | null = null;
let loaded = false;
let onUnauthorized: (() => void) | null = null;

export async function loadToken(): Promise<string | null> {
  if (!loaded) {
    token = await getItem(TOKEN_KEY);
    loaded = true;
  }
  return token;
}
export async function setToken(value: string | null) {
  token = value;
  loaded = true;
  if (value) await setItem(TOKEN_KEY, value);
  else await removeItem(TOKEN_KEY);
}
export const getToken = () => token;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Send the signed-in user's JWT. Default true. */
  authenticated?: boolean;
}

function buildUrl(path: string, query?: ApiFetchOptions["query"]) {
  const params: string[] = [];
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") params.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}${params.length ? `?${params.join("&")}` : ""}`;
}

/** Calls piqnex-backend (or the built-in demo data when EXPO_PUBLIC_DEMO=true). */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, query, authenticated = true } = options;
  await loadToken();

  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 120));
    try {
      return demoRequest(method, path, query ?? {}, body, !!token) as T;
    } catch (e) {
      if (e instanceof DemoHttpError) throw new ApiError(e.status, e.message);
      throw e;
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authenticated && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, "Can't reach Piqnex right now. Check your connection and try again.");
  }
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!res.ok) {
    if (res.status === 401 && authenticated && token) onUnauthorized?.();
    const raw = (data as { message?: string | string[] } | undefined)?.message;
    throw new ApiError(res.status, Array.isArray(raw) ? raw.join(", ") : raw ?? res.statusText, data);
  }
  return data as T;
}

/** Friendly text for an error thrown by apiFetch. */
export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again.") {
  if (e instanceof ApiError && e.status !== 0 && e.status < 500 && e.message) return e.message;
  if (e instanceof ApiError && e.status === 0) return e.message;
  return fallback;
}

/** Turns a stored image path into something an <Image> can load. */
export function publicImageUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  if (/^(https?:|data:|file:|content:)/.test(storagePath) || storagePath.startsWith("/api/demo-photo")) return storagePath;
  if (storagePath.startsWith("/")) return `${API_URL}${storagePath}`;
  return `${API_URL}/uploads/${storagePath}`;
}
