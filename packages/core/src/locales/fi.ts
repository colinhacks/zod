import type { $ZodStringFormats } from "../checks.js";
import type * as errors from "../errors.js";
import * as util from "../util.js";

const Sizable: Record<string, { unit: string; verb: string }> = {
  string: { unit: "merkkiä", verb: "olla" },
  file: { unit: "tavua", verb: "olla" },
  array: { unit: "kohdetta", verb: "olla" },
  set: { unit: "kohdetta", verb: "olla" },
};

function getSizing(origin: string): { unit: string; verb: string } | null {
  return Sizable[origin] ?? null;
}

export const parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "epäluku" : "numero";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "taulukko";
      }
      if (data === null) {
        return "tyhjä";
      }

      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  return t;
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
  e164: "E.164-numero",
  jwt: "JWT",
  template_literal: "syöte",
};

const error: errors.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return `Virheellinen syöte: pitäisi olla ${issue.expected}, mutta oli ${parsedType(issue.input)}`;
    // return `Invalid input: expected ${issue.expected}, received ${util.getParsedType(issue.input)}`;
    case "invalid_value":
      if (issue.values.length === 1)
        return `Virheellinen syöte: pitäisi olla ${util.stringifyPrimitive(issue.values[0])}`;
      return `Virheellinen valinta: pitäisi olla yksi seuraavista: ${util.joinValues(issue.values, "|")}`;
    case "too_big": {
      const adj = issue.inclusive ? "<=" : "<";
      const sizing = getSizing(issue.origin);
      if (sizing) return `Liian suuri: ${issue.origin} pitäisi olla ${adj}${issue.maximum.toString()} ${sizing.unit}`;
      return `Liian suuri: ${issue.origin ?? "arvon"} pitäisi olla ${adj}${issue.maximum.toString()}`;
    }
    case "too_small": {
      const adj = issue.inclusive ? ">=" : ">";
      const sizing = getSizing(issue.origin);
      if (sizing) {
        return `Liian pieni: ${issue.origin} pitäisi olla ${adj}${issue.minimum.toString()} ${sizing.unit}`;
      }
      return `Liian pieni: ${issue.origin ?? "arvon"} pitäisi olla ${adj}${issue.minimum.toString()}`;
    }
    case "invalid_format": {
      const _issue = issue as errors.$ZodStringFormatIssues;
      if (_issue.format === "starts_with") return `Virheellinen merkkijono: alussa täytyy olla "${issue}"`;
      if (_issue.format === "ends_with") return `Virheellinen merkkijono: lopussa täytyy olla "${_issue.suffix}"`;
      if (_issue.format === "includes") return `Virheellinen merkkijono: täytyy sisältää "${_issue.includes}"`;
      if (_issue.format === "regex") return `Virheellinen merkkijono: täytyy vastata kaavaa ${_issue.pattern}`;
      return `Virheellinen ${Nouns[_issue.format] ?? issue.format}`;
    }
    case "not_multiple_of":
      return `Virheellinen numero: täytyy olla luvun ${issue.divisor} monikerta`;
    case "unrecognized_keys":
      return `${issue.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${util.joinValues(issue.keys, ", ")}`;
    case "invalid_key":
      return `Virheellinen avain kohteessa ${issue.origin}`;
    case "invalid_union":
      return "Virheellinen yhdiste";
    case "invalid_element":
      return `Virheellinen arvo kohteessa ${issue.origin}`;
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
