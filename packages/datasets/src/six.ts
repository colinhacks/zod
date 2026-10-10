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

const CODE = /^[A-Z]{3}$/;
const NUMERIC = /^\d{3}$/;

// the name element carries an IsFund attribute on fund codes, so the tag match allows attributes
const field = (entry: string, tag: string): string | undefined =>
  entry.match(new RegExp(`<${tag}(?: [^>]*)?>([^<]*)</${tag}>`))?.[1]?.trim();

function publishedOn(xml: string, root: string): string {
  const date = xml.match(new RegExp(`<${root} Pblshd="(\\d{4}-\\d{2}-\\d{2})"`))?.[1];
  if (!date) throw new Error(`the XML is not a ${root} list with a publication date`);
  return date;
}

const byCode = <T extends { code: string }>(a: T, b: T): number => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0);

// withdrawal dates come as YYYY-MM or "YYYY to YYYY", so the latest is the one whose last year is greatest
const withdrawnKey = (date: string): string => `${date.match(/\d{4}/g)?.at(-1) ?? ""} ${date}`;

export function parseListOne(xml: string): { published: string; currencies: SixCurrency[] } {
  const seen = new Map<string, SixCurrency>();
  for (const [, entry] of xml.matchAll(/<CcyNtry>([\s\S]*?)<\/CcyNtry>/g)) {
    const code = field(entry!, "Ccy");
    // entries without a currency, like Antarctica
    if (!code) continue;
    const numeric = field(entry!, "CcyNbr") ?? "";
    // the codes feed a regex and a literal union, so a malformed one is a broken or poisoned list
    if (!CODE.test(code) || !NUMERIC.test(numeric)) throw new Error(`malformed currency entry: ${code} ${numeric}`);
    const minor = field(entry!, "CcyMnrUnts");
    // list three already spells the flag in German, so any other spelling is a changed export rather than a non-fund
    const fund = entry!.match(/<CcyNm IsFund="([^"]*)"/)?.[1];
    if (fund !== undefined && !/^(?:true|WAHR)$/.test(fund))
      throw new Error(`unknown IsFund value for ${code}: ${fund}`);
    const currency: SixCurrency = {
      code,
      numeric,
      name: field(entry!, "CcyNm") ?? "",
      minorUnits: minor && /^\d+$/.test(minor) ? Number(minor) : null,
      fund: fund !== undefined,
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
    const numeric = field(entry!, "CcyNbr") ?? null;
    if (!CODE.test(code) || (numeric !== null && !NUMERIC.test(numeric)))
      throw new Error(`malformed withdrawn entry: ${code} ${numeric}`);
    const previous = seen.get(code);
    if (previous && withdrawnKey(previous.withdrawn) >= withdrawnKey(withdrawn)) continue;
    seen.set(code, { code, numeric, name: field(entry!, "CcyNm") ?? "", withdrawn });
  }
  return { published: publishedOn(xml, "ISO_4217"), withdrawn: [...seen.values()].sort(byCode) };
}
