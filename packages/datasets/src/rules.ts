import { readCodes } from "./emit.js";

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

// a code leaves a list only with a record of its retirement, so a source glitch cannot become a removal
export function assertRetired(label: string, removed: readonly string[], retired: readonly string[]): void {
  const unexplained = removed.filter((code) => !retired.includes(code));
  if (unexplained.length)
    throw new Error(`${label} codes left the source without a retirement record: ${unexplained.join(" ")}`);
}

// the publication date alone is not a change
export const withoutDate = (source: string): string => source.replace(/^export const published = .*\n/m, "");

export interface ModulePlan {
  changed: boolean;
  fresh: boolean;
  added: string[];
  removed: string[];
}

// compares a rendered module against the tracked one; a source republished with the same data is no change, so the date moves only with the data
export function planModule(previous: string | undefined, formatted: string, codes: readonly string[]): ModulePlan {
  const before = previous === undefined ? codes : readCodes(previous);
  if (!before) throw new Error("the tracked module has no codes tuple to compare against");
  return {
    changed: previous === undefined || withoutDate(formatted) !== withoutDate(previous),
    fresh: previous === undefined,
    added: codes.filter((code) => !before.includes(code)),
    removed: before.filter((code) => !codes.includes(code)),
  };
}

export type Part = "minor" | "patch";

export function bump(version: string, part: Part): string {
  const [major, minor, patch] = version.split(".").map(Number) as [number, number, number];
  return part === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}

// a code set that moved is a minor, since a withdrawn code leaving the union is the point of the refresh; any other change is a patch
export function bumpPart(plans: readonly ModulePlan[]): Part | undefined {
  if (!plans.some((p) => p.changed)) return undefined;
  return plans.some((p) => p.added.length || p.removed.length) ? "minor" : "patch";
}

const REGEX_LINE = /^export const currencyCode: RegExp =\s+\/\^\(\?:[A-Z|]+\)\$\/;$/m;

// zod carries the active currency codes as a regex literal, so the list reaches z.currencyCode() in the same change
export function rewriteRegex(source: string, codes: readonly string[]): string {
  if (!REGEX_LINE.test(source)) throw new Error("no currencyCode regex line to rewrite");
  return source.replace(REGEX_LINE, `export const currencyCode: RegExp =\n  /^(?:${codes.join("|")})$/;`);
}
