import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCodeMappings } from "./cldr.js";
import { buildCountries, renderCountries } from "./country.js";
import { buildCurrencies, renderCurrencies } from "./currency.js";
import { readCodes } from "./emit.js";
import { fetchText } from "./fetch.js";
import { parseRegistry } from "./iana.js";
import { IANA_ONLY, buildLanguages, renderLanguages } from "./language.js";
import { parseListOne, parseListThree } from "./six.js";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const pkg = join(root, "packages", "codes");

const SIX = "https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists";
const IANA = "https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry";
const CLDR =
  "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-core/supplemental/codeMappings.json";
// read as a cross-check only and never copied, since the Debian files are LGPL
const DEBIAN = "https://salsa.debian.org/iso-codes-team/iso-codes/-/raw/main/data";

const debianCodes = (json: string, table: string, field: string): string[] =>
  (JSON.parse(json)[table] as Record<string, string>[])
    .map((row) => row[field])
    .filter((code): code is string => !!code);

function crossCheck(
  label: string,
  ours: readonly string[],
  theirs: readonly string[],
  tolerated: readonly string[]
): void {
  const missing = theirs.filter((code) => !ours.includes(code));
  const extra = ours.filter((code) => !theirs.includes(code) && !tolerated.includes(code));
  if (missing.length || extra.length) {
    throw new Error(
      `${label} disagrees with Debian iso-codes: missing ${missing.join(" ") || "none"}, extra ${extra.join(" ") || "none"}`
    );
  }
}

function format(file: string): string {
  execFileSync("nub", ["exec", "--node", "biome", "format", "--write", file], { cwd: root, stdio: "pipe" });
  return readFileSync(file, "utf8");
}

function bump(version: string, part: "minor" | "patch"): string {
  const [major, minor, patch] = version.split(".").map(Number) as [number, number, number];
  return part === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}

interface Outcome {
  name: string;
  published: string;
  changed: boolean;
  fresh: boolean;
  added: string[];
  removed: string[];
}

// the publication date alone is not a change, so a source republished with the same data leaves the module and the version alone
const withoutDate = (source: string) => source.replace(/^export const published = .*\n/m, "");

function write(name: string, published: string, source: string, codes: readonly string[]): Outcome {
  const target = join(pkg, "src", `${name}.ts`);
  const previous = existsSync(target) ? readFileSync(target, "utf8") : undefined;
  const before = previous ? (readCodes(previous) ?? []) : codes;
  const added = codes.filter((code) => !before.includes(code));
  const removed = before.filter((code) => !codes.includes(code));
  writeFileSync(target, source);
  const formatted = format(target);
  if (previous !== undefined && withoutDate(formatted) === withoutDate(previous)) {
    writeFileSync(target, previous);
    return { name, published, changed: false, fresh: false, added, removed };
  }
  return { name, published, changed: true, fresh: previous === undefined, added, removed };
}

// one bump for the package: minor when a code set moved, patch for any other change, nothing on the first generation
function bumpManifest(outcomes: readonly Outcome[]): string | undefined {
  if (outcomes.some((o) => o.fresh)) return "new";
  if (!outcomes.some((o) => o.changed)) return undefined;
  const manifestPath = join(pkg, "package.json");
  const manifest = readFileSync(manifestPath, "utf8");
  const current = (JSON.parse(manifest) as { version: string }).version;
  const next = bump(current, outcomes.some((o) => o.added.length || o.removed.length) ? "minor" : "patch");
  writeFileSync(manifestPath, manifest.replace(`"version": "${current}"`, `"version": "${next}"`));
  return `${current} → ${next}`;
}

// zod carries the active currency codes as a regex, so the list reaches z.currencyCode() in the same change
function rewriteZodRegex(codes: readonly string[]): boolean {
  const target = join(root, "packages", "zod", "src", "v4", "core", "regexes.ts");
  const line = /^export const currencyCode: RegExp =\s+\/\^\(\?:[A-Z|]+\)\$\/;$/m;
  const source = readFileSync(target, "utf8");
  if (!line.test(source)) throw new Error(`no currencyCode regex in ${target}`);
  const next = source.replace(line, `export const currencyCode: RegExp =\n  /^(?:${codes.join("|")})$/;`);
  if (next === source) return false;
  writeFileSync(target, next);
  return true;
}

const [listOne, listThree, registryText, mappingsJson, debian4217, debian3166, debian6392] = await Promise.all([
  fetchText(`${SIX}/list-one.xml`),
  fetchText(`${SIX}/list-three.xml`),
  fetchText(IANA),
  fetchText(CLDR),
  fetchText(`${DEBIAN}/iso_4217.json`),
  fetchText(`${DEBIAN}/iso_3166-1.json`),
  fetchText(`${DEBIAN}/iso_639-2.json`),
]);

const registry = parseRegistry(registryText);
const currency = buildCurrencies(parseListOne(listOne), parseListThree(listThree));
const country = buildCountries(registry, parseCodeMappings(JSON.parse(mappingsJson)));
const language = buildLanguages(registry);
crossCheck("ISO 4217", currency.codes, debianCodes(debian4217, "4217", "alpha_3"), []);
crossCheck("ISO 3166-1", country.codes, debianCodes(debian3166, "3166-1", "alpha_2"), []);
crossCheck("ISO 639-1", language.codes, debianCodes(debian6392, "639-2", "alpha_2"), IANA_ONLY);

const outcomes = [
  write("currencies", currency.published, renderCurrencies(currency), currency.codes),
  write("countries", country.published, renderCountries(country), country.codes),
  write("languages", language.published, renderLanguages(language), language.codes),
];
const version = bumpManifest(outcomes);
const zodChanged = rewriteZodRegex(currency.codes);

const lines = outcomes.map((o) => {
  const delta = `added ${o.added.join(" ") || "none"}, removed ${o.removed.join(" ") || "none"}`;
  return o.changed
    ? `- \`${o.name}\` (source published ${o.published}): ${delta}`
    : `- \`${o.name}\`: unchanged (source published ${o.published})`;
});
const summary = `${version ? `\`@zod/codes\` ${version}\n\n` : ""}${lines.join("\n")}\n\nGenerated by \`nub run update:datasets\`. ${zodChanged ? "`z.currencyCode()` follows the currency list." : "The zod regex is unchanged."}\n`;
console.log(summary);
if (process.env.DATASETS_SUMMARY) writeFileSync(process.env.DATASETS_SUMMARY, summary);
if (process.env.GITHUB_OUTPUT) {
  const title = `Refresh the code lists: ${
    outcomes
      .filter((o) => o.changed)
      .map((o) => o.name)
      .join(", ") || "no change"
  }`;
  appendFileSync(process.env.GITHUB_OUTPUT, `title=${title}\n`);
}
