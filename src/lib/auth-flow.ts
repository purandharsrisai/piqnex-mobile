import { setItem } from "@/lib/storage";

export const SEEN_WELCOME_KEY = "piqnex_seen_welcome";
export const markWelcomeSeen = () => setItem(SEEN_WELCOME_KEY, "1");

/** Zod issues -> { field: first message } */
export function fieldErrors(issues: { path: (string | number)[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
