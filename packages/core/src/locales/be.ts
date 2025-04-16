import type { $ZodStringFormats } from "../checks.js";
import type * as errors from "../errors.js";
import * as util from "../util.js";

const Sizable: Record<string, { unit: string; verb: string }> = {
  string: { unit: "сімвалаў", verb: "мець" },
  file: { unit: "байтаў", verb: "мець" },
  array: { unit: "элементаў", verb: "мець" },
  set: { unit: "элементаў", verb: "мець" },
};

function getSizing(origin: string): { unit: string; verb: string } | null {
  return Sizable[origin] ?? null;
}

export const parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "лік";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "масіў";
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
  regex: "увод",
  email: "электронны адрас",
  url: "URL",
  emoji: "эмодзі",
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
  datetime: "ISO дата і час",
  date: "ISO дата",
  time: "ISO час",
  duration: "ISO працягласць",
  ipv4: "IPv4 адрас",
  ipv6: "IPv6 адрас",
  cidrv4: "IPv4 дыяпазон",
  cidrv6: "IPv6 дыяпазон",
  base64: "радок у кадзіроўцы base64",
  base64url: "радок у кадзіроўцы base64url",
  json_string: "JSON радок",
  e164: "нумар E.164",
  jwt: "JWT",
  template_literal: "увод",
};

const error: errors.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return `Няправільны ўвод: чакаўся ${issue.expected}, атрымана ${parsedType(issue.input)}`;
    case "invalid_value":
      if (issue.values.length === 1) return `Няправільны ўвод: чакалася ${util.stringifyPrimitive(issue.values[0])}`;
      return `Няправільны варыянт: чакаўся адзін з ${util.joinValues(issue.values, "|")}`;
    case "too_big": {
      const adj = issue.inclusive ? "<=" : "<";
      const sizing = getSizing(issue.origin);
      if (sizing)
        return `Занадта вялікі: чакалася, што ${issue.origin ?? "значэнне"} будзе мець ${adj}${issue.maximum.toString()} ${sizing.unit ?? "элементаў"}`;
      return `Занадта вялікі: чакалася, што ${issue.origin ?? "значэнне"} будзе ${adj}${issue.maximum.toString()}`;
    }
    case "too_small": {
      const adj = issue.inclusive ? ">=" : ">";
      const sizing = getSizing(issue.origin);
      if (sizing) {
        return `Занадта малы: чакалася, што ${issue.origin} будзе мець ${adj}${issue.minimum.toString()} ${sizing.unit}`;
      }

      return `Занадта малы: чакалася, што ${issue.origin} будзе ${adj}${issue.minimum.toString()}`;
    }
    case "invalid_format": {
      const _issue = issue as errors.$ZodStringFormatIssues;
      if (_issue.format === "starts_with") return `Няправільны радок: павінен пачынацца з "${issue}"`;
      if (_issue.format === "ends_with") return `Няправільны радок: павінен заканчвацца на "${_issue.suffix}"`;
      if (_issue.format === "includes") return `Няправільны радок: павінен уключаць "${_issue.includes}"`;
      if (_issue.format === "regex") return `Няправільны радок: павінен адпавядаць шаблону ${_issue.pattern}`;
      return `Няправільны ${Nouns[_issue.format] ?? issue.format}`;
    }
    case "not_multiple_of":
      return `Няправільны лік: павінен быць кратным ${issue.divisor}`;
    case "unrecognized_keys":
      return `Нераспазнаны ключ${issue.keys.length > 1 ? "ы" : ""}: ${util.joinValues(issue.keys, ", ")}`;
    case "invalid_key":
      return `Няправільны ключ у ${issue.origin}`;
    case "invalid_union":
      return "Няправільны ўвод";
    case "invalid_element":
      return `Няправільнае значэнне ў ${issue.origin}`;
    default:
      return `Няправільны ўвод`;
  }
};

export { error };

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error,
  };
}
