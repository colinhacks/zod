import type { CodeMapping } from "./cldr.js";
import { header, records, scalar, tuple } from "./emit.js";
import type { IanaRegistry } from "./iana.js";

// exceptionally reserved in ISO 3166-1 and carried by the IANA registry, but assigned to no country
export const RESERVED: readonly string[] = ["AC", "CP", "CQ", "DG", "EA", "EU", "EZ", "IC", "TA", "UN"];

export interface Country {
  code: string;
  alpha3: string;
  numeric: string;
  name: string;
}

export interface CountryDataset {
  published: string;
  codes: string[];
  countries: Country[];
  reserved: string[];
}

export function buildCountries(registry: IanaRegistry, mappings: Map<string, CodeMapping>): CountryDataset {
  const regions = registry.records.filter(
    (r) =>
      r.type === "region" &&
      !r.deprecated &&
      /^[A-Z]{2}$/.test(r.subtag) &&
      !/^Private use/.test(r.descriptions[0] ?? "")
  );
  const reserved = regions
    .map((r) => r.subtag)
    .filter((code) => RESERVED.includes(code))
    .sort();
  const missing = RESERVED.filter((code) => !reserved.includes(code));
  if (missing.length) throw new Error(`reserved codes missing from the registry: ${missing.join(" ")}`);
  const countries = regions
    .filter((r) => !RESERVED.includes(r.subtag))
    .map((r): Country => {
      const mapping = mappings.get(r.subtag);
      if (!mapping) throw new Error(`CLDR has no alpha-3 or numeric code for ${r.subtag}`);
      return { code: r.subtag, alpha3: mapping.alpha3, numeric: mapping.numeric, name: r.descriptions[0] ?? "" };
    })
    .sort((a, b) => (a.code < b.code ? -1 : 1));
  if (countries.length < 240 || countries.length > 260) throw new Error(`parsed ${countries.length} country codes`);
  return { published: registry.fileDate, codes: countries.map((c) => c.code), countries, reserved };
}

export function renderCountries(dataset: CountryDataset): string {
  return (
    header("the IANA language subtag registry and CLDR code mappings") +
    scalar("published", dataset.published) +
    "export interface Country {\n  code: CountryCode;\n  alpha3: string;\n  numeric: string;\n  name: string;\n}\n\n" +
    tuple("codes", dataset.codes) +
    "export type CountryCode = (typeof codes)[number];\n\n" +
    records("countries", "Country", dataset.countries) +
    tuple("reserved", dataset.reserved)
  );
}
