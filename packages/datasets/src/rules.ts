// the decisions a weekly run makes, kept free of I/O so the tests reach them

export function assertBand(label: string, count: number, low: number, high: number): void {
  if (count < low || count > high) throw new Error(`parsed ${count} ${label}, outside ${low}-${high}`);
}

// Debian lags the maintenance agencies by months, so a disagreement is reported in the PR, never fatal
export function crossCheck(
  label: string,
  ours: readonly string[],
  theirs: readonly string[],
  tolerated: readonly string[]
): string | undefined {
  const missing = theirs.filter((code) => !ours.includes(code));
  const extra = ours.filter((code) => !theirs.includes(code) && !tolerated.includes(code));
  if (!missing.length && !extra.length) return undefined;
  return `${label} disagrees with Debian iso-codes: missing ${missing.join(" ") || "none"}, extra ${extra.join(" ") || "none"}`;
}

// the publication date alone is not a change
export const withoutDate = (source: string): string => source.replace(/^export const published = .*\n/m, "");

export type Part = "major" | "minor" | "patch";

export function bump(version: string, part: Part): string {
  const [major, minor, patch] = version.split(".").map(Number) as [number, number, number];
  if (part === "major") return `${major + 1}.0.0`;
  return part === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}

export interface Delta {
  changed: boolean;
  added: readonly string[];
  removed: readonly string[];
}

// a removed code narrows a literal union, so it is a major; an added one is a minor; any other change a patch
export function bumpPart(deltas: readonly Delta[]): Part | undefined {
  if (!deltas.some((d) => d.changed)) return undefined;
  if (deltas.some((d) => d.removed.length)) return "major";
  return deltas.some((d) => d.added.length) ? "minor" : "patch";
}

const REGEX_LINE = /^export const currencyCode: RegExp =\s+\/\^\(\?:[A-Z|]+\)\$\/;$/m;

// zod carries the active currency codes as a regex literal, so the list reaches z.currencyCode() in the same change
export function rewriteRegex(source: string, codes: readonly string[]): string {
  if (!REGEX_LINE.test(source)) throw new Error("no currencyCode regex line to rewrite");
  return source.replace(REGEX_LINE, `export const currencyCode: RegExp =\n  /^(?:${codes.join("|")})$/;`);
}
