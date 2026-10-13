import { getConversations, getMyListings, getMyNeedRequests, getNeedMatches } from "./data";
import { previewOf } from "./message-format";
import { formatPrice } from "./utils";
import { getItem, setItem } from "./storage";

export const NOTIF_READ_KEY = "piqnex_notif_read";

export type NotifKind = "message" | "match" | "account";
export type NotifIcon = "chat" | "match" | "listing" | "safety";

export interface NotificationItem {
  id: string;
  kind: NotifKind;
  icon: NotifIcon;
  title: string;
  body: string;
  /** ISO timestamp used for ordering and the TODAY / EARLIER grouping. */
  at: string;
  href: string;
}

const DAY = 86_400_000;

/**
 * There is no notifications backend, so the feed is derived on the client from
 * conversations, need requests and listings. Each source fails independently.
 */
export async function buildNotifications(): Promise<NotificationItem[]> {
  const items: NotificationItem[] = [];
  const now = Date.now();

  const [convos, needs, listings] = await Promise.all([
    getConversations().catch(() => []),
    getMyNeedRequests().catch(() => []),
    getMyListings().catch(() => []),
  ]);

  for (const c of convos) {
    if (c.unread > 0) {
      items.push({
        id: `msg:${c.id}:${c.lastMessage?.id ?? c.lastMessageAt}`,
        kind: "message", icon: "chat",
        title: `${c.other.displayName} sent you a message`,
        body: `“${previewOf(c.lastMessage?.body)}”`,
        at: c.lastMessageAt,
        href: `/chat/${c.id}`,
      });
    }
  }

  await Promise.all(needs.filter((n) => n.status !== "closed").map(async (n) => {
    let matched = n.status === "matched";
    if (!matched) {
      try { matched = (await getNeedMatches({ brand: n.brand, product: n.product, model: n.model, part: n.part })).length > 0; } catch { /* ignore */ }
    }
    if (!matched) return;
    const bp = `${n.brand} ${n.product}`.trim();
    items.push({
      id: `match:${n.id}`,
      kind: "match", icon: "match",
      title: "We found a match!",
      body: `A seller listed a ${n.part} for your ${bp}.`,
      at: n.createdAt,
      href: `/browse?q=${encodeURIComponent(`${bp} ${n.part}`)}`,
    });
  }));

  for (const l of listings) {
    if (l.status === "active" && now - new Date(l.createdAt).getTime() < 7 * DAY) {
      items.push({
        id: `listing:${l.id}`,
        kind: "account", icon: "listing",
        title: "Your listing is live",
        body: `${l.part} · ${formatPrice(l.price)} is now visible to buyers.`,
        at: l.createdAt,
        href: `/parts/${l.id}`,
      });
    }
  }

  items.push({
    id: "safety:reminder",
    kind: "account", icon: "safety",
    title: "Safety reminder",
    body: "Meet in public places and never pay in advance.",
    at: new Date(now - 2 * DAY).toISOString(),
    href: "/safety",
  });

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export async function getReadIds(): Promise<string[]> {
  try {
    const v = JSON.parse((await getItem(NOTIF_READ_KEY)) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function saveReadIds(ids: string[]): Promise<void> {
  await setItem(NOTIF_READ_KEY, JSON.stringify(Array.from(new Set(ids)).slice(-300)));
}
