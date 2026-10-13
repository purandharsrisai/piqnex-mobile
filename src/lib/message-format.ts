/** Special message formats the chat understands (they are stored as plain text). */
export const OFFER_RE = /^Offer: (\S+)(?: \(listed at (\S+)\))?$/;
export const PHOTO_RE = /^Photo: (\S+)$/;

/** Short text for conversation lists, so a photo doesn't show up as a wall of characters. */
export function previewOf(body: string | undefined | null): string {
  if (!body) return "";
  if (PHOTO_RE.test(body)) return "Photo";
  const offer = OFFER_RE.exec(body);
  if (offer) return `Offer: ${offer[1]}`;
  return body;
}
