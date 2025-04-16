import type { $ZodStringFormats } from "../checks.js";
import type * as errors from "../errors.js";
import * as util from "../util.js";

const Sizable: Record<string, { unit: string; verb: string }> = {
  string: { unit: "karakter", verb: "olmalı" },
  file: { unit: "bayt", verb: "olmalı" },
  array: { unit: "öğe", verb: "olmalı" },
  set: { unit: "öğe", verb: "olmalı" },
};

function getSizing(origin: string): { unit: string; verb: string } | null {
  return Sizable[origin] ?? null;
}

export const parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "number";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
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
  regex: "input",
  email: "email address",
  url: "URL",
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
  datetime: "ISO datetime",
  date: "ISO date",
  time: "ISO time",
  duration: "ISO duration",
  ipv4: "IPv4 address",
  ipv6: "IPv6 address",
  cidrv4: "IPv4 range",
  cidrv6: "IPv6 range",
  base64: "base64-encoded string",
  base64url: "base64url-encoded string",
  json_string: "JSON string",
  e164: "E.164 number",
  jwt: "JWT",
  template_literal: "input",
};

const error: errors.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return `Geçersiz değer: beklenen ${issue.expected}, alınan ${parsedType(issue.input)}`;
    case "invalid_value":
      if (issue.values.length === 1)
        return `Geçersiz değer: beklenen ${util.stringifyPrimitive(issue.values[0])}`;
      return `Geçersiz seçenek: aşağıdakilerden biri olmalı: ${util.joinValues(issue.values, "|")}`;
    case "too_big": {
      const adj = issue.inclusive ? "<=" : "<";
      const sizing = getSizing(issue.origin);
      if (sizing) return `Çok büyük: beklenen ${issue.origin ?? "değer"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "öğe"}`;
      return `Çok büyük: beklenen ${issue.origin ?? "değer"} ${adj}${issue.maximum.toString()}`;
    }
    case "too_small": {
      const adj = issue.inclusive ? ">=" : ">";
      const sizing = getSizing(issue.origin);
      if (sizing) return `Çok küçük: beklenen ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
      return `Çok küçük: beklenen ${issue.origin} ${adj}${issue.minimum.toString()}`;
    }
    case "invalid_format": {
      const _issue = issue as errors.$ZodStringFormatIssues;
      if (_issue.format === "starts_with") return `Geçersiz metin: "${issue}" ile başlamalı`;
      if (_issue.format === "ends_with") return `Geçersiz metin: "${_issue.suffix}" ile bitmeli`;
      if (_issue.format === "includes") return `Geçersiz metin: "${_issue.includes}" içermeli`;
      if (_issue.format === "regex") return `Geçersiz metin: ${_issue.pattern} desenine uymalı`;
      return `Geçersiz ${Nouns[_issue.format] ?? issue.format}`;
    }
    case "not_multiple_of":
      return `Geçersiz sayı: ${issue.divisor} ile tam bölünebilmeli`;
    case "unrecognized_keys":
      return `Tanınmayan anahtar${issue.keys.length > 1 ? "lar" : ""}: ${util.joinValues(issue.keys, ", ")}`;
    case "invalid_key":
      return `${issue.origin} içinde geçersiz anahtar`;
    case "invalid_union":
      return "Geçersiz değer";
    case "invalid_element":
      return `${issue.origin} içinde geçersiz değer`;
    default:
      return `Geçersiz değer`;
  }
};

export { error };

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error,
  };
}
