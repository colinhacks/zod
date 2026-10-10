import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCodeMappings } from "./cldr.js";
import { buildCountries, renderCountries } from "./country.js";
import { buildCurrencies, renderCurrencies } from "./currency.js";
import { fetchText } from "./fetch.js";
import { parseRegistry } from "./iana.js";
import { IANA_ONLY, buildLanguages, renderLanguages } from "./language.js";
import {
  type ModulePlan,
  assertBand,
  assertRetired,
  bump,
  bumpPart,
  crossCheck,
  planModule,
  rewriteRegex,
} from "./rules.js";
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

// biome formats the module from stdin, so nothing lands on disk before the compare
function format(file: string, source: string): string {
  return execFileSync("nub", ["exec", "--node", "biome", "format", "--stdin-file-path", file], {
    cwd: root,
    input: source,
    stdio: ["pipe", "pipe", "inherit"],
  }).toString();
}

interface FilePlan extends ModulePlan {
  name: string;
  target: string;
  published: string;
  formatted: string;
}

function planFile(name: string, published: string, source: string, codes: readonly string[]): FilePlan {
  const target = join(pkg, "src", `${name}.ts`);
  const previous = existsSync(target) ? readFileSync(target, "utf8") : undefined;
  const formatted = format(target, source);
  return { name, target, published, formatted, ...planModule(previous, formatted, codes) };
}

// one bump for the package, nothing on the first generation
function bumpManifest(plans: readonly FilePlan[]): string | undefined {
  if (plans.some((p) => p.fresh)) return "new";
  const part = bumpPart(plans);
  if (!part) return undefined;
  const manifestPath = join(pkg, "package.json");
  const manifest = readFileSync(manifestPath, "utf8");
  const current = (JSON.parse(manifest) as { version: string }).version;
  const next = bump(current, part);
  const bumped = manifest.replace(`"version": "${current}"`, `"version": "${next}"`);
  if (bumped === manifest) throw new Error(`no "version": "${current}" line in ${manifestPath}`);
  writeFileSync(manifestPath, bumped);
  return `${current} → ${next}`;
}

const [listOne, listThree, registryText, mappingsJson] = await Promise.all([
  fetchText(`${SIX}/list-one.xml`),
  fetchText(`${SIX}/list-three.xml`),
  fetchText(IANA),
  fetchText(CLDR),
]);
// Debian is advisory, so an outage is a warning rather than a failed run
const [debian4217, debian3166, debian6392] = await Promise.all(
  ["iso_4217.json", "iso_3166-1.json", "iso_639-2.json"].map((file) =>
    fetchText(`${DEBIAN}/${file}`).catch((error: unknown) =>
      error instanceof Error ? error : new Error(String(error))
    )
  )
);

const registry = parseRegistry(registryText);
const currency = buildCurrencies(parseListOne(listOne), parseListThree(listThree));
const country = buildCountries(registry, parseCodeMappings(JSON.parse(mappingsJson)));
const language = buildLanguages(registry);
// the lists have held these sizes for decades, so a count outside the band means a source changed shape
assertBand("currency codes", currency.codes.length, 150, 220);
assertBand("country codes", country.codes.length, 240, 260);
assertBand("language codes", language.codes.length, 170, 200);

const warnings = [...country.warnings];
const check = (
  label: string,
  ours: readonly string[],
  debian: string | Error | undefined,
  table: string,
  field: string,
  tolerated: readonly string[]
): void => {
  if (debian instanceof Error) warnings.push(`${label} not cross-checked: ${debian.message}`);
  else if (debian) {
    const warning = crossCheck(label, ours, debianCodes(debian, table, field), tolerated);
    if (warning) warnings.push(warning);
  }
};
check("ISO 4217", currency.codes, debian4217, "4217", "alpha_3", []);
check("ISO 3166-1", country.codes, debian3166, "3166-1", "alpha_2", []);
check("ISO 639-1", language.codes, debian6392, "639-2", "alpha_2", IANA_ONLY);

// every write is planned and checked before the first one, so a failed run leaves the tree as it found it
const plans = [
  planFile("currencies", currency.published, renderCurrencies(currency), currency.codes),
  planFile("countries", country.published, renderCountries(country), country.codes),
  planFile("languages", language.published, renderLanguages(language), language.codes),
] as const;
const deprecated = (type: string): string[] =>
  registry.records.filter((r) => r.type === type && r.deprecated).map((r) => r.subtag);
assertRetired(
  "currency",
  plans[0].removed,
  currency.withdrawn.map((w) => w.code)
);
assertRetired("country", plans[1].removed, deprecated("region"));
assertRetired("language", plans[2].removed, deprecated("language"));
const regexTarget = join(root, "packages", "zod", "src", "v4", "core", "regexes.ts");
const regexSource = readFileSync(regexTarget, "utf8");
const regexNext = rewriteRegex(regexSource, currency.codes);

for (const plan of plans) if (plan.changed) writeFileSync(plan.target, plan.formatted);
const version = bumpManifest(plans);
const zodChanged = regexNext !== regexSource;
if (zodChanged) writeFileSync(regexTarget, regexNext);

const lines = plans.map((p) => {
  const delta = `added ${p.added.join(" ") || "none"}, removed ${p.removed.join(" ") || "none"}`;
  return p.changed
    ? `- \`${p.name}\` (source published ${p.published}): ${delta}`
    : `- \`${p.name}\`: unchanged (source published ${p.published})`;
});
const notes = warnings.length ? `\n${warnings.map((w) => `> ${w}`).join("\n\n")}\n` : "";
const summary = `${version ? `\`@zod/codes\` ${version}\n\n` : ""}${lines.join("\n")}\n${notes}\nGenerated by \`nub run update:datasets\`. ${zodChanged ? "`z.currencyCode()` follows the currency list." : "The zod regex is unchanged."}\n`;
console.log(summary);
if (process.env.DATASETS_SUMMARY) writeFileSync(process.env.DATASETS_SUMMARY, summary);
if (process.env.GITHUB_OUTPUT) {
  // a warning on a run that opens no PR still reaches the run page
  for (const warning of warnings) console.log(`::warning::${warning}`);
  const title = `Refresh the code lists: ${
    plans
      .filter((p) => p.changed)
      .map((p) => p.name)
      .join(", ") || "no change"
  }`;
  appendFileSync(process.env.GITHUB_OUTPUT, `title=${title}\n`);
}
