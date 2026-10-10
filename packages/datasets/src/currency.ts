import { header, records, scalar, tuple } from "./emit.js";
import type { SixCurrency, SixWithdrawn } from "./six.js";

export interface CurrencyDataset {
  published: string;
  codes: string[];
  currencies: SixCurrency[];
  withdrawn: SixWithdrawn[];
}

export function buildCurrencies(
  active: { published: string; currencies: SixCurrency[] },
  historic: { published: string; withdrawn: SixWithdrawn[] }
): CurrencyDataset {
  const codes = active.currencies.map((c) => c.code);
  return {
    // a withdrawal alone republishes list three, so the later of the two dates is the one the data reflects
    published: active.published > historic.published ? active.published : historic.published,
    codes,
    currencies: active.currencies,
    withdrawn: historic.withdrawn.filter((w) => !codes.includes(w.code)),
  };
}

export function renderCurrencies(dataset: CurrencyDataset): string {
  return (
    header("the SIX Group ISO 4217 lists") +
    scalar("published", dataset.published) +
    "export interface Currency {\n  code: CurrencyCode;\n  numeric: string;\n  name: string;\n  minorUnits: number | null;\n  fund: boolean;\n}\n\n" +
    "export interface WithdrawnCurrency {\n  code: string;\n  numeric: string | null;\n  name: string;\n  withdrawn: string;\n}\n\n" +
    tuple("codes", dataset.codes) +
    "export type CurrencyCode = (typeof codes)[number];\n\n" +
    records("currencies", "Currency", dataset.currencies) +
    records("withdrawn", "WithdrawnCurrency", dataset.withdrawn)
  );
}
