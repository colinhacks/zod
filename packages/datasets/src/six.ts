export interface SixCurrency {
  code: string;
  numeric: string;
  name: string;
  minorUnits: number | null;
  fund: boolean;
}

export interface SixWithdrawn {
  code: string;
  numeric: string | null;
  name: string;
  withdrawn: string;
}

// the name element carries an IsFund attribute on fund codes, so the tag match allows attributes
const field = (entry: string, tag: string): string | undefined =>
  entry.match(new RegExp(`<${tag}(?: [^>]*)?>([^<]*)</${tag}>`))?.[1]?.trim();

function publishedOn(xml: string, root: string): string {
  const date = xml.match(new RegExp(`<${root} Pblshd="(\\d{4}-\\d{2}-\\d{2})"`))?.[1];
  if (!date) throw new Error(`the XML is not a ${root} list with a publication date`);
  return date;
}

const byCode = <T extends { code: string }>(a: T, b: T): number => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0);

export function parseListOne(xml: string): { published: string; currencies: SixCurrency[] } {
  const seen = new Map<string, SixCurrency>();
  for (const [, entry] of xml.matchAll(/<CcyNtry>([\s\S]*?)<\/CcyNtry>/g)) {
    const code = field(entry!, "Ccy");
    // entries without a currency, like Antarctica
    if (!code) continue;
    const minor = field(entry!, "CcyMnrUnts");
    const currency: SixCurrency = {
      code,
      numeric: field(entry!, "CcyNbr") ?? "",
      name: field(entry!, "CcyNm") ?? "",
      minorUnits: minor && /^\d+$/.test(minor) ? Number(minor) : null,
      fund: /<CcyNm IsFund="true"/.test(entry!),
    };
    const previous = seen.get(code);
    if (previous && JSON.stringify(previous) !== JSON.stringify(currency))
      throw new Error(`${code} is listed with two different records`);
    seen.set(code, currency);
  }
  return { published: publishedOn(xml, "ISO_4217"), currencies: [...seen.values()].sort(byCode) };
}

// one code can be withdrawn from several countries on different dates; the latest date is kept
export function parseListThree(xml: string): { published: string; withdrawn: SixWithdrawn[] } {
  const seen = new Map<string, SixWithdrawn>();
  for (const [, entry] of xml.matchAll(/<HstrcCcyNtry>([\s\S]*?)<\/HstrcCcyNtry>/g)) {
    const code = field(entry!, "Ccy");
    const withdrawn = field(entry!, "WthdrwlDt");
    if (!code || !withdrawn) continue;
    const previous = seen.get(code);
    if (previous && previous.withdrawn >= withdrawn) continue;
    seen.set(code, { code, numeric: field(entry!, "CcyNbr") ?? null, name: field(entry!, "CcyNm") ?? "", withdrawn });
  }
  return { published: publishedOn(xml, "ISO_4217"), withdrawn: [...seen.values()].sort(byCode) };
}
