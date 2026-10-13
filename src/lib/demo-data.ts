/**
 * Demo mode: lets you click through the whole app filled with sample data,
 * without the backend running. Turn it on with EXPO_PUBLIC_DEMO=true in
 * .env.local (remove it to use the real API again). Nothing here touches a
 * database - api-client.ts routes every call to demoRequest() instead, and the
 * data lives in memory (changes you make reset when the dev server
 * restarts). Delete this file, app/api/demo-photo and the DEMO_MODE branches
 * in api-client.ts / actions/auth.ts / middleware.ts before production.
 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO === "true";

type Json = Record<string, unknown>;

export class DemoHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
const fail = (status: number, message: string): never => {
  throw new DemoHttpError(status, message);
};

const id = (prefix: number, n: number) => `00000000-0000-4000-9${prefix}00-${String(n).padStart(12, "0")}`;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rand = rng(7);
const pick = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)] as T;
const now = Date.now();
const ago = (hours: number) => new Date(now - hours * 3600_000).toISOString();

const FIRST = ["Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Karthik", "Meera", "Arjun", "Divya", "Rahul", "Kavya"];
const LAST = ["Sharma", "Reddy", "Patel", "Iyer", "Nair", "Gupta", "Singh", "Rao", "Mehta", "Das"];
const CITIES = ["Hyderabad", "Bengaluru", "Mumbai", "Chennai", "Pune", "Delhi", "Kolkata", "Kochi"];
const BIOS = ["Repairs gadgets as a hobby and sells spare parts.", "Collector of vintage audio gear.", "Laptop technician with 8 years of experience.", null, null];

const CATEGORY_LIST = [
  ["electronics", "Electronics"], ["laptops", "Laptops"], ["gaming", "Gaming"], ["wearables", "Wearables"], ["cameras", "Cameras"],
  ["appliances", "Appliances"], ["furniture", "Furniture"], ["automotive", "Automotive"], ["other", "Other"],
] as const;
// brand, product, model, part, category slug
const PARTS: [string, string, string, string, string][] = [
  ["Dell", "XPS 13", "9310", "Battery", "laptops"], ["Dell", "Inspiron 15", "3511", "Keyboard", "laptops"], ["HP", "Pavilion", "15-eg", "Screen panel", "laptops"],
  ["Lenovo", "ThinkPad", "T480", "Charger", "laptops"], ["Apple", "iPhone 12", "A2403", "Screen assembly", "electronics"], ["Apple", "iPhone 11", "A2221", "Battery", "electronics"],
  ["Samsung", "Galaxy S21", "SM-G991B", "Back glass", "electronics"], ["OnePlus", "OnePlus 9", "LE2111", "Charging port", "electronics"],
  ["Sony", "WH-1000XM4", "", "Left ear cushion", "electronics"], ["Bose", "QuietComfort 35", "II", "Headband cushion", "electronics"],
  ["Sony PlayStation", "PS5", "CFI-1000", "DualSense thumbstick", "gaming"], ["Microsoft Xbox", "Series X", "", "Power supply", "gaming"],
  ["Nintendo", "Switch", "HAC-001", "Joy-Con rail", "gaming"], ["Apple", "Watch Series 6", "", "Strap clasp", "wearables"], ["Fitbit", "Charge 5", "", "Charging cable", "wearables"],
  ["Canon", "EOS 200D", "", "Lens cap", "cameras"], ["Nikon", "D3500", "", "Battery grip", "cameras"], ["GoPro", "Hero 9", "", "Battery", "cameras"],
  ["LG", "Front-load washer", "FHM1207", "Door gasket", "appliances"], ["Philips", "Air fryer", "HD9252", "Basket", "appliances"],
  ["IKEA", "Markus chair", "", "Gas lift", "furniture"], ["Maruti", "Swift", "2018", "Side mirror", "automotive"], ["Honda", "City", "2016", "Wiper blade set", "automotive"],
];
const CONDITIONS = ["New", "Like New", "Used - Working", "Used - Good", "Used - Fair", "For Parts"] as const;

interface DemoUser { id: string; email: string; displayName: string; location: string | null; phone: string | null; avatarUrl: string | null; bio: string | null; isAdmin: boolean; createdAt: string }
interface DemoListing {
  id: string; sellerId: string; categorySlug: string; brandName: string; productName: string; modelLabel: string | null; partName: string;
  condition: string; price: number; currency: string; description: string; location: string | null; status: string; createdAt: string;
  images: { storagePath: string; sortOrder: number }[];
}
interface DemoNeed {
  id: string; requesterId: string; categoryId: string | null; brandName: string; productName: string; modelLabel: string | null; partName: string;
  description: string | null; location: string | null; status: string; createdAt: string;
}
interface DemoMessage { id: string; senderId: string; body: string; createdAt: string }
interface DemoConversation { id: string; listingId: string; buyerId: string; sellerId: string; messages: DemoMessage[]; readUpTo: Record<string, number> }
interface DemoReview { id: string; listingId: string; reviewerId: string; sellerId: string; rating: number; comment: string; createdAt: string }

function photos(part: string, sub: string, count: number, hue: number) {
  return Array.from({ length: count }, (_, k) => ({
    storagePath: `/api/demo-photo?t=${encodeURIComponent(part)}&s=${encodeURIComponent(sub)}&n=${k + 1}&h=${hue}`,
    sortOrder: k,
  }));
}

function build() {
  const users: DemoUser[] = [
    { id: id(1, 1), email: "purandhar.pasam@codeprism.in", displayName: "Purandhar Pasam", location: "Hyderabad", phone: "9876543210", avatarUrl: null, bio: "Selling and finding spare parts on Piqnex.", isAdmin: true, createdAt: ago(24 * 150) },
  ];
  for (let i = 0; i < 14; i++) {
    const first = FIRST[i % FIRST.length] as string;
    const last = pick(LAST);
    users.push({
      id: id(1, i + 2), email: `${first}.${last}${i}@example.com`.toLowerCase(), displayName: `${first} ${last}`, location: pick(CITIES),
      phone: `9${Math.floor(100000000 + rand() * 899999999)}`, avatarUrl: null, bio: pick(BIOS), isAdmin: false, createdAt: ago(24 * (20 + i * 9)),
    });
  }
  const me = users[0] as DemoUser;
  const others = users.slice(1);

  const listings: DemoListing[] = Array.from({ length: 44 }, (_, i) => {
    const [brand, product, model, part, categorySlug] = PARTS[i % PARTS.length] as (typeof PARTS)[number];
    const seller = i % 7 === 0 ? me : pick(others);
    const status = i % 13 === 5 ? "removed" : i % 6 === 4 ? "sold" : "active";
    const photoCount = i % 8 === 7 ? 0 : (i % 4) + 1;
    const condition = pick(CONDITIONS);
    return {
      id: id(2, i + 1), sellerId: seller.id, categorySlug, brandName: brand, productName: product, modelLabel: model || null, partName: part,
      condition, price: Math.round((300 + rand() * 9000) / 50) * 50, currency: "INR",
      description: `${part} for the ${brand} ${product}${model ? ` (${model})` : ""}. Condition: ${condition}.\n\nTested and working when removed. Happy to share more photos on request. Pickup in ${seller.location ?? "my city"} or I can ship by courier.`,
      location: seller.location, status, createdAt: ago(i * 9 + 2), images: photos(part, `${brand} ${product}`, photoCount, (i * 47) % 360),
    };
  });

  const needRequests: DemoNeed[] = Array.from({ length: 10 }, (_, i) => {
    const [brand, product, model, part] = PARTS[(i * 3) % PARTS.length] as (typeof PARTS)[number];
    const requester = i % 3 === 0 ? me : pick(others);
    return {
      id: id(3, i + 1), requesterId: requester.id, categoryId: null, brandName: brand, productName: product, modelLabel: model || null, partName: part,
      description: "Looking for a working piece, preferably original.", location: requester.location, status: i % 5 === 4 ? "matched" : "open", createdAt: ago(i * 14 + 3),
    };
  });

  const reviews: DemoReview[] = [];
  listings.filter((l) => l.status === "sold").forEach((l, i) => {
    const reviewer = others.find((u) => u.id !== l.sellerId) as DemoUser;
    reviews.push({ id: id(4, i + 1), listingId: l.id, reviewerId: reviewer.id, sellerId: l.sellerId, rating: 3 + (i % 3), comment: ["Great seller, exactly as described.", "Quick reply and smooth deal.", "Part worked perfectly. Thank you!"][i % 3] as string, createdAt: ago(i * 30 + 5) });
  });

  // A few conversations for the signed-in demo user.
  const mine = listings.filter((l) => l.sellerId === me.id && l.status === "active");
  const theirs = listings.filter((l) => l.sellerId !== me.id && l.status === "active");
  const conversations: DemoConversation[] = [];
  const mk = (n: number, listing: DemoListing, buyerId: string, lines: [boolean, string][]) => {
    conversations.push({
      id: id(5, n), listingId: listing.id, buyerId, sellerId: listing.sellerId,
      messages: lines.map(([fromBuyer, body], k) => ({ id: id(6, n * 10 + k), senderId: fromBuyer ? buyerId : listing.sellerId, body, createdAt: ago(lines.length - k + n * 3) })),
      readUpTo: {},
    });
  };
  if (theirs[0]) mk(1, theirs[0], me.id, [[true, "Hi, is this still available?"], [false, "Yes it is! Can pick up this week."], [true, "Great, can you do a little less on the price?"], [false, "I can do 5% off if you take it today."]]);
  if (theirs[1]) mk(2, theirs[1], me.id, [[true, "Does it come with the original box?"], [false, "No box, but all accessories are included."]]);
  const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  if (mine[0]) mk(3, mine[0], (others[2] as DemoUser).id, [[true, "Hello! Is the price negotiable?"], [true, `Offer: ${rupees(Math.round((mine[0].price * 0.9) / 10) * 10)} (listed at ${rupees(mine[0].price)})`]]);
  if (mine[1]) mk(4, mine[1], (others[4] as DemoUser).id, [[true, "Could you share a photo of the connector?"], [false, "Sure, here it is."], [false, "Photo: /api/demo-photo?t=Connector&s=Close-up&n=1&h=200"], [true, "Thanks!"]]);
  if (theirs[1]) theirs[1].status = "sold"; // shows the "no longer available" notice in conversation 2
  const saved = new Set<string>(theirs.slice(2, 8).map((l) => l.id));

  return { users, me, listings, needRequests, reviews, conversations, saved, blocked: new Set<string>(), seq: 1000 };
}
type Store = ReturnType<typeof build>;
function store(): Store {
  const g = globalThis as unknown as { __piqnexSiteDemo?: Store };
  return (g.__piqnexSiteDemo ??= build());
}

// ---------------------------------------------------------------------------
// Response shaping (mirrors piqnex-backend)
// ---------------------------------------------------------------------------
const PAGE = 12;
const userOf = (s: Store, userId: string) => s.users.find((u) => u.id === userId);
const withSeller = (s: Store, l: DemoListing) => {
  const u = userOf(s, l.sellerId);
  return { ...l, seller: u ? { id: u.id, displayName: u.displayName, location: u.location } : null };
};
const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
const rating = (s: Store, sellerId: string) => {
  const rs = s.reviews.filter((r) => r.sellerId === sellerId);
  return { average: rs.length ? Math.round((rs.reduce((a, r) => a + r.rating, 0) / rs.length) * 10) / 10 : null, count: rs.length };
};
const nextId = (s: Store, prefix: number) => id(prefix, ++s.seq);
const chatUser = (u: DemoUser | undefined) => ({ id: u?.id ?? "", displayName: u?.displayName ?? "Deleted user", avatarUrl: u?.avatarUrl ?? null });

function summary(s: Store, c: DemoConversation) {
  const l = s.listings.find((x) => x.id === c.listingId) as DemoListing;
  const otherId = c.buyerId === s.me.id ? c.sellerId : c.buyerId;
  const last = c.messages[c.messages.length - 1] ?? null;
  const readUpTo = c.readUpTo[s.me.id] ?? 0;
  return {
    id: c.id,
    listing: { id: l.id, partName: l.partName, productName: l.productName, brandName: l.brandName, price: String(l.price), currency: l.currency, status: l.status, images: l.images.slice(0, 1) },
    role: c.buyerId === s.me.id ? "buying" : "selling",
    other: chatUser(userOf(s, otherId)),
    lastMessage: last, lastMessageAt: last?.createdAt ?? ago(1),
    unread: c.messages.slice(readUpTo).filter((m) => m.senderId !== s.me.id).length,
  };
}

/** Stand-in for fetch() in demo mode. `signedIn` comes from the demo cookie. */
export function demoRequest(method: string, path: string, query: Record<string, unknown>, body: unknown, signedIn: boolean): unknown {
  const s = store();
  const b = (body ?? {}) as Json;
  let m: RegExpMatchArray | null;

  const publicRoute =
    path.startsWith("/auth/") || path.startsWith("/catalog/") || path.startsWith("/sellers/") || path === "/support/contact" ||
    path === "/need-requests/match" || (method === "GET" && (path === "/listings" || path.startsWith("/listings/")) && !path.endsWith("/review-eligibility"));
  if (!publicRoute && !signedIn) fail(401, "Unauthorized");

  // ---- auth ---------------------------------------------------------------
  if (path === "/auth/login" || path === "/auth/signup") {
    const email = String(b.email ?? s.me.email);
    if (path === "/auth/login" && (![s.me.email.toLowerCase(), "demo@piqnex.test"].includes(email.trim().toLowerCase()) || b.password !== "password123")) fail(401, "Invalid email or password");
    if (path === "/auth/signup" && b.displayName) { s.me.displayName = String(b.displayName); s.me.email = email; }
    return { accessToken: "demo-token", user: { id: s.me.id, email: s.me.email, displayName: s.me.displayName, isAdmin: false } };
  }
  if (path === "/auth/providers") return { google: false };
  if (path === "/auth/forgot-password") return { message: "If that email exists, we've sent a reset link." };
  if (path === "/auth/reset-password" || path === "/auth/change-password" || path === "/auth/logout") return {};
  if (path === "/support/contact") return { ok: true };
  if (path === "/uploads/listing-image") return { storagePath: `/api/demo-photo?t=${encodeURIComponent(String(b.filename ?? "Photo").replace(/\.[a-z0-9]+$/i, ""))}&s=Your%20upload&n=1&h=${Math.floor(rand() * 360)}` };
  if (path === "/catalog/categories") return CATEGORY_LIST.map(([slug, name], i) => ({ id: id(7, i + 1), slug, name, icon: null, sort_order: i, sortOrder: i }));

  // ---- profile ------------------------------------------------------------
  if (path === "/profile/me") {
    if (method === "PATCH") {
      if (b.displayName) s.me.displayName = String(b.displayName);
      if ("location" in b) s.me.location = (b.location as string) || null;
      if ("phone" in b) s.me.phone = (b.phone as string) || null;
      if ("bio" in b) s.me.bio = (b.bio as string) || null;
      if ("avatarUrl" in b) s.me.avatarUrl = (b.avatarUrl as string) || null;
      return s.me;
    }
    if (method === "DELETE") return {};
    return s.me;
  }
  if (path === "/profile/me/listings") return s.listings.filter((l) => l.sellerId === s.me.id).sort((a, c) => +new Date(c.createdAt) - +new Date(a.createdAt));
  if (path === "/profile/me/need-requests") return s.needRequests.filter((n) => n.requesterId === s.me.id);

  // ---- listings -----------------------------------------------------------
  if (path === "/listings/featured") return s.listings.filter((l) => l.status === "active").slice(0, Number(query.limit) || 8).map((l) => withSeller(s, l));
  if (path === "/listings/match") {
    return s.listings.filter((l) => l.status === "active" && norm(l.brandName) === norm(query.brandName) && norm(l.productName) === norm(query.productName) && norm(l.partName) === norm(query.partName)
      && (!query.modelLabel || norm(l.modelLabel) === norm(query.modelLabel))).map((l) => withSeller(s, l));
  }
  if (path === "/listings" && method === "GET") {
    const q = norm(query.q);
    let rows = s.listings.filter((l) => l.status === "active");
    if (query.category) rows = rows.filter((l) => l.categorySlug === query.category);
    if (query.condition) rows = rows.filter((l) => l.condition === query.condition);
    if (query.location) rows = rows.filter((l) => norm(l.location).includes(norm(query.location)));
    if (query.minPrice) rows = rows.filter((l) => l.price >= Number(query.minPrice));
    if (query.maxPrice) rows = rows.filter((l) => l.price <= Number(query.maxPrice));
    if (q) rows = rows.filter((l) => [l.brandName, l.productName, l.modelLabel, l.partName, l.description].some((f) => norm(f).includes(q)) || q.split(/\s+/).every((w) => [l.brandName, l.productName, l.modelLabel, l.partName].some((f) => norm(f).includes(w))));
    rows = [...rows].sort((a, c) => (query.sort === "price_asc" ? a.price - c.price : query.sort === "price_desc" ? c.price - a.price : +new Date(c.createdAt) - +new Date(a.createdAt)));
    const page = Math.max(1, Number(query.page) || 1);
    return { items: rows.slice((page - 1) * PAGE, page * PAGE).map((l) => withSeller(s, l)), total: rows.length, page, pageSize: PAGE };
  }
  if (path === "/listings" && method === "POST") {
    const l: DemoListing = {
      id: nextId(s, 2), sellerId: s.me.id, categorySlug: "other", brandName: String(b.brandName), productName: String(b.productName), modelLabel: (b.modelLabel as string) || null,
      partName: String(b.partName), condition: String(b.condition), price: Number(b.price), currency: "INR", description: String(b.description ?? ""), location: (b.location as string) || s.me.location,
      status: "active", createdAt: new Date().toISOString(),
      images: ((b.imagePaths as string[]) ?? []).map((storagePath, sortOrder) => ({ storagePath, sortOrder })),
    };
    s.listings.unshift(l);
    return { id: l.id };
  }
  if ((m = path.match(/^\/listings\/([^/]+)\/(status|contact|reviews|review-eligibility)$/))) {
    const l = s.listings.find((x) => x.id === m![1]);
    if (!l) return fail(404, "Listing not found");
    if (m[2] === "status") { l.status = String(b.status); return l; }
    if (m[2] === "contact") {
      let c = s.conversations.find((x) => x.listingId === l.id && x.buyerId === s.me.id);
      if (!c) {
        c = { id: nextId(s, 5), listingId: l.id, buyerId: s.me.id, sellerId: l.sellerId, messages: [], readUpTo: {} };
        s.conversations.push(c);
      }
      c.messages.push({ id: nextId(s, 6), senderId: s.me.id, body: String(b.message ?? ""), createdAt: new Date().toISOString() });
      c.readUpTo[s.me.id] = c.messages.length;
      return { conversationId: c.id };
    }
    if (m[2] === "review-eligibility") return { canReview: l.sellerId !== s.me.id && !s.reviews.some((r) => r.listingId === l.id && r.reviewerId === s.me.id), hasReviewed: s.reviews.some((r) => r.listingId === l.id && r.reviewerId === s.me.id) };
    s.reviews.push({ id: nextId(s, 4), listingId: l.id, reviewerId: s.me.id, sellerId: l.sellerId, rating: Number(b.rating), comment: String(b.comment ?? ""), createdAt: new Date().toISOString() });
    return {};
  }
  if ((m = path.match(/^\/listings\/([^/]+)$/))) {
    const idx = s.listings.findIndex((x) => x.id === m![1]);
    const l = s.listings[idx];
    if (!l) return fail(404, "Listing not found");
    if (method === "DELETE") { s.listings.splice(idx, 1); return {}; }
    if (method === "PATCH") {
      if (b.brandName) l.brandName = String(b.brandName);
      if (b.productName) l.productName = String(b.productName);
      if ("modelLabel" in b) l.modelLabel = (b.modelLabel as string) || null;
      if (b.partName) l.partName = String(b.partName);
      if (b.condition) l.condition = String(b.condition);
      if (b.price !== undefined) l.price = Number(b.price);
      if (b.description !== undefined) l.description = String(b.description);
      if ("location" in b) l.location = (b.location as string) || null;
      return l;
    }
    return withSeller(s, l);
  }

  // ---- sellers & reviews --------------------------------------------------
  if ((m = path.match(/^\/sellers\/([^/]+)\/rating$/))) return rating(s, m[1] as string);
  if ((m = path.match(/^\/sellers\/([^/]+)$/))) {
    const u = userOf(s, m[1] as string);
    if (!u) return fail(404, "Seller not found");
    const mine = s.listings.filter((l) => l.sellerId === u.id);
    return {
      seller: { id: u.id, displayName: u.displayName, location: u.location, createdAt: u.createdAt },
      rating: rating(s, u.id), soldCount: mine.filter((l) => l.status === "sold").length,
      reviews: s.reviews.filter((r) => r.sellerId === u.id).map((r) => ({
        id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt,
        reviewer: { id: r.reviewerId, displayName: userOf(s, r.reviewerId)?.displayName ?? "A user" },
        listing: { id: r.listingId, partName: s.listings.find((l) => l.id === r.listingId)?.partName ?? "Part" },
      })),
      listings: mine.filter((l) => l.status === "active"),
    };
  }

  // ---- saved --------------------------------------------------------------
  if (path === "/saved/ids") return [...s.saved];
  if (path === "/saved") return s.listings.filter((l) => s.saved.has(l.id) && l.status !== "removed").map((l) => withSeller(s, l));
  if ((m = path.match(/^\/saved\/([^/]+)$/))) { if (method === "POST") s.saved.add(m[1] as string); else s.saved.delete(m[1] as string); return {}; }

  // ---- need requests ------------------------------------------------------
  if (path === "/need-requests/match") {
    return s.needRequests.filter((n) => n.status === "open" && norm(n.brandName) === norm(query.brandName) && norm(n.productName) === norm(query.productName) && norm(n.partName) === norm(query.partName)
      && (!query.modelLabel || norm(n.modelLabel) === norm(query.modelLabel)));
  }
  if (path === "/need-requests" && method === "POST") {
    const n: DemoNeed = { id: nextId(s, 3), requesterId: s.me.id, categoryId: (b.categoryId as string) || null, brandName: String(b.brandName), productName: String(b.productName), modelLabel: (b.modelLabel as string) || null, partName: String(b.partName), description: (b.description as string) || null, location: (b.location as string) || null, status: "open", createdAt: new Date().toISOString() };
    s.needRequests.unshift(n);
    return n;
  }
  if ((m = path.match(/^\/need-requests\/([^/]+)(\/status)?$/))) {
    const idx = s.needRequests.findIndex((x) => x.id === m![1]);
    if (idx < 0) return fail(404, "Request not found");
    if (method === "DELETE") { s.needRequests.splice(idx, 1); return {}; }
    (s.needRequests[idx] as DemoNeed).status = String(b.status);
    return s.needRequests[idx];
  }

  // ---- messages -----------------------------------------------------------
  if (path === "/conversations/unread-count") return { count: s.conversations.reduce((n, c) => n + summary(s, c).unread, 0) };
  if (path === "/conversations") return s.conversations.filter((c) => c.buyerId === s.me.id || c.sellerId === s.me.id).map((c) => summary(s, c)).sort((a, c) => +new Date(c.lastMessageAt) - +new Date(a.lastMessageAt));
  if ((m = path.match(/^\/conversations\/([^/]+)\/messages$/))) {
    const c = s.conversations.find((x) => x.id === m![1]);
    if (!c) return fail(404, "Conversation not found");
    c.messages.push({ id: nextId(s, 6), senderId: s.me.id, body: String(b.body ?? ""), createdAt: new Date().toISOString() });
    c.readUpTo[s.me.id] = c.messages.length;
    return {};
  }
  if ((m = path.match(/^\/conversations\/([^/]+)$/))) {
    const c = s.conversations.find((x) => x.id === m![1]);
    if (!c) return fail(404, "Conversation not found");
    const l = s.listings.find((x) => x.id === c.listingId) as DemoListing;
    const prevRead = c.readUpTo[s.me.id] ?? 0;
    const myReadAt = prevRead > 0 ? (c.messages[prevRead - 1] as DemoMessage).createdAt : null;
    const theirs = c.messages.filter((x) => x.senderId !== s.me.id);
    const otherReadAt = theirs.length ? (theirs[theirs.length - 1] as DemoMessage).createdAt : null;
    c.readUpTo[s.me.id] = c.messages.length;
    const otherId = c.buyerId === s.me.id ? c.sellerId : c.buyerId;
    return { myReadAt, otherReadAt, id: c.id, listing: { id: l.id, partName: l.partName, productName: l.productName, brandName: l.brandName, price: String(l.price), currency: l.currency, status: l.status, sellerId: l.sellerId, modelLabel: l.modelLabel, condition: l.condition, location: l.location, images: l.images.slice(0, 1) }, other: chatUser(userOf(s, otherId)), me: s.me.id, messages: c.messages };
  }
  if ((m = path.match(/^\/blocks\/([^/]+)$/))) { s.blocked.add(m[1] as string); return {}; }
  if (path === "/reports") return {};

  return fail(404, `Demo mode has no sample data for ${method} ${path}`);
}
