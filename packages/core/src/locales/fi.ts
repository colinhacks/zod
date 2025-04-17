import type { $ZodStringFormats } from "../checks.js";
import type * as errors from "../errors.js";
import type { $ZodTypeDef } from "../schemas.js";
import * as util from "../util.js";

const Sizable: Record<string, { unit: string; subject: string }> = {
  string: { unit: "merkkiä", subject: "merkkijonon" },
  file: { unit: "tavua", subject: "tiedoston" },
  array: { unit: "alkiota", subject: "taulukon" },
  set: { unit: "alkiota", subject: "joukon" },
  number: { unit: "", subject: "luvun" },
  bigint: { unit: "", subject: "suuren kokonaisluvun" },
  int: { unit: "", subject: "kokonaisluvun" },
  date: { unit: "", subject: "päivämäärän" },
};

function getSizing(origin: string): { unit: string; subject: string } | null {
  return Sizable[origin] ?? null;
}

const TypeNames: { [k in $ZodTypeDef["type"] | (string & {})]?: string } = {
  string: "merkkijono",
  number: "luku",
  boolean: "totuusarvo",
  bigint: "suuri kokonaisluku",
  symbol: "symboli",
  null: "tyhjä",
  undefined: "määrittelemätön",
  date: "päivämäärä",
  object: "objekti",
  file: "tiedosto",
  array: "taulukko",
  map: "hajautustaulu",
  set: "joukko",
  nan: "epäluku",
  promise: "lupaus",
};

function getTypeName(type: string): string {
  return TypeNames[type] ?? type;
}

export const parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "epäluku" : "luku";
    }
    case "bigint": {
      return Number.isNaN(data) ? "epäluku" : "suuri kokonaisluku";
    }
    case "boolean": {
      return "totuusarvo";
    }
    case "symbol": {
      return "symboli";
    }
    case "function": {
      return "funktio";
    }
    case "string": {
      return "merkkijono";
    }
    case "undefined": {
      return "määrittelemätön";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "taulukko";
      }
      if (data === null) {
        return "tyhjä";
      }
      if (data instanceof Date) {
        return "päivämäärä";
      }
      if (data instanceof Map) {
        return "hajautustaulu";
      }
      if (data instanceof Set) {
        return "joukko";
      }
      if (data instanceof File) {
        return "tiedosto";
      }
      if (data instanceof Promise) {
        return "lupaus";
      }

      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }

      return "objekti";
    }
    default: {
      return t;
    }
  }
};

const Nouns: {
  [k in $ZodStringFormats | (string & {})]?: string;
} = {
  regex: "syöte",
  email: "sähköpostiosoite",
  url: "URL-osoite",
  emoji: "emoji",
  uuid: "UUID",
  uuidv4: "UUIDv4",
  uuidv6: "UUIDv6",
  nanoid: "nanoid",
  guid: "GUID",
  cuid: "cuid",
  cuid2: "cuid2",
  ulid: "ULID",
  xid: "XID",
  ksuid: "KSUID",
  datetime: "ISO-aikaleima",
  date: "ISO-päivämäärä",
  time: "ISO-aika",
  duration: "ISO-kesto",
  ipv4: "IPv4-osoite",
  ipv6: "IPv6-osoite",
  cidrv4: "IPv4-alue",
  cidrv6: "IPv6-alue",
  base64: "base64-koodattu merkkijono",
  base64url: "base64url-koodattu merkkijono",
  json_string: "JSON-merkkijono",
  e164: "E.164-luku",
  jwt: "JWT",
  template_literal: "syöte",
};

const InOrigin: { [k in string & {}]?: string } = {
  record: "tietueessa",
  map: "hajautustaulussa",
  set: "joukossa",
};

const error: errors.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return `Virheellinen tyyppi: täytyy olla ${getTypeName(issue.expected)}, oli ${parsedType(issue.input)}`;
    case "invalid_value":
      if (issue.values.length === 1)
        return `Virheellinen syöte: täytyy olla ${util.stringifyPrimitive(issue.values[0])}`;
      return `Virheellinen valinta: täytyy olla yksi seuraavista: ${util.joinValues(issue.values, "|")}`;
    case "too_big": {
      const adj = issue.inclusive ? "<=" : "<";
      const sizing = getSizing(issue.origin);
      if (sizing) {
        return `Liian suuri: ${sizing.subject} täytyy olla ${adj}${issue.maximum.toString()} ${sizing.unit}`.trim();
      }
      return `Liian suuri: ${issue.origin ?? "arvon"} täytyy olla ${adj}${issue.maximum.toString()}`;
    }
    case "too_small": {
      const adj = issue.inclusive ? ">=" : ">";
      const sizing = getSizing(issue.origin);
      if (sizing) {
        return `Liian pieni: ${sizing.subject} täytyy olla ${adj}${issue.minimum.toString()} ${sizing.unit}`.trim();
      }
      return `Liian pieni: ${issue.origin ?? "arvon"} täytyy olla ${adj}${issue.minimum.toString()}`;
    }
    case "invalid_format": {
      const _issue = issue as errors.$ZodStringFormatIssues;
      if (_issue.format === "starts_with") return `Virheellinen merkkijono: alussa täytyy olla "${_issue.prefix}"`;
      if (_issue.format === "ends_with") return `Virheellinen merkkijono: lopussa täytyy olla "${_issue.suffix}"`;
      if (_issue.format === "includes") return `Virheellinen merkkijono: täytyy sisältää "${_issue.includes}"`;
      if (_issue.format === "regex") return `Virheellinen merkkijono: täytyy vastata kaavaa ${_issue.pattern}`;
      return `Virheellinen ${Nouns[_issue.format] ?? issue.format}`;
    }
    case "not_multiple_of":
      return `Virheellinen luku: täytyy olla luvun ${issue.divisor} monikerta`;
    case "unrecognized_keys":
      return `${issue.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${util.joinValues(issue.keys, ", ")}`;
    case "invalid_key":
      return `Virheellinen avain ${InOrigin[issue.origin] ?? issue.origin}`;
    case "invalid_union":
      return "Virheellinen yhdiste";
    case "invalid_element":
      return `Virheellinen arvo ${InOrigin[issue.origin] ?? issue.origin}`;
    default:
      return `Virheellinen syöte`;
  }
};

export { error };

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error,
  };
}
