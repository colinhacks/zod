import { header, records, scalar, tuple } from "./emit.js";
import type { IanaRegistry } from "./iana.js";

// kept by the IANA registry as a macrolanguage although ISO 639-1 withdrew it in 2000; the Debian cross-check tolerates it
export const IANA_ONLY: readonly string[] = ["sh"];

export interface Language {
  code: string;
  name: string;
}

export interface LanguageDataset {
  published: string;
  codes: string[];
  languages: Language[];
}

export function buildLanguages(registry: IanaRegistry): LanguageDataset {
  const languages = registry.records
    .filter((r) => r.type === "language" && !r.deprecated && /^[a-z]{2}$/.test(r.subtag))
    .map((r): Language => ({ code: r.subtag, name: r.descriptions[0] ?? "" }))
    .sort((a, b) => (a.code < b.code ? -1 : 1));
  if (languages.length < 170 || languages.length > 200) throw new Error(`parsed ${languages.length} language codes`);
  return { published: registry.fileDate, codes: languages.map((l) => l.code), languages };
}

export function renderLanguages(dataset: LanguageDataset): string {
  return (
    header("the IANA language subtag registry") +
    scalar("published", dataset.published) +
    "export interface Language {\n  code: LanguageCode;\n  name: string;\n}\n\n" +
    tuple("codes", dataset.codes) +
    "export type LanguageCode = (typeof codes)[number];\n\n" +
    records("languages", "Language", dataset.languages)
  );
}
