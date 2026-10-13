/**
 * Matching Engine - MVP version.
 *
 * The long-term vision (see docs/COMPATIBILITY.md) is a real compatibility
 * graph: "this charger is compatible with these 4 laptop models" etc. But
 * for the MVP we deliberately keep this simple and honest: we only ever
 * claim a match when the important fields line up exactly. Guessing at
 * compatibility we can't verify would break the trust the marketplace
 * depends on.
 *
 * A single function is the seam where a smarter algorithm can be dropped in
 * later without touching the pages that call it.
 */

export interface MatchableFields {
  brand: string;
  product: string;
  model?: string | null;
  part: string;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Returns true when two records describe the same brand + product + part,
 * and (when both specify one) the same model. This is intentionally strict:
 * an "exact match" should mean exactly that.
 */
export function isExactMatch(a: MatchableFields, b: MatchableFields): boolean {
  if (normalize(a.brand) !== normalize(b.brand)) return false;
  if (normalize(a.product) !== normalize(b.product)) return false;
  if (normalize(a.part) !== normalize(b.part)) return false;

  const modelA = normalize(a.model);
  const modelB = normalize(b.model);
  if (modelA && modelB && modelA !== modelB) return false;

  return true;
}

/** Filters a list of listings/requests down to exact matches against `query`. */
export function findExactMatches<T extends MatchableFields>(
  query: MatchableFields,
  candidates: T[]
): T[] {
  return candidates.filter((candidate) => isExactMatch(query, candidate));
}
