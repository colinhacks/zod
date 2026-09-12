import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// SIX Group maintains ISO 4217; list one carries the active codes, list three the withdrawn ones
const SOURCE =
  "https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml";
const target = join(__dirname, "..", "packages", "zod", "src", "v4", "core", "regexes.ts");
const line = /^export const currencyCode: RegExp =\s+\/\^\(\?:([A-Z|]+)\)\$\/;$/m;

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`${SOURCE} answered ${response.status}`);
const xml = await response.text();
const published = xml.match(/<ISO_4217 Pblshd="(\d{4}-\d{2}-\d{2})"/)?.[1];
if (!published) throw new Error(`${SOURCE} did not return the ISO 4217 list`);
const codes = [...new Set(Array.from(xml.matchAll(/<Ccy>([A-Z]{3})<\/Ccy>/g), (m) => m[1]!))].sort();
// the list has held 170-180 codes for decades, so a count far outside that means the page changed shape
if (codes.length < 150 || codes.length > 220) throw new Error(`parsed ${codes.length} codes from ${SOURCE}`);

const source = readFileSync(target, "utf8");
const current = source.match(line)?.[1]?.split("|");
if (!current) throw new Error(`no currencyCode regex in ${target}`);
const added = codes.filter((code) => !current.includes(code));
const removed = current.filter((code) => !codes.includes(code));
writeFileSync(target, source.replace(line, `export const currencyCode: RegExp =\n  /^(?:${codes.join("|")})$/;`));

console.log(
  `ISO 4217 list published ${published}: ${codes.length} codes, added ${added.join(" ") || "none"}, removed ${removed.join(" ") || "none"}`
);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `published=${published}\nadded=${added.join(", ")}\nremoved=${removed.join(", ")}\n`
  );
}
