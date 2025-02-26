import type { $ZodConfig } from "../base.js";
import type * as errors from "../errors.js";
import * as util from "../util.js";

const Sizable: Record<string, { dim: string; unit: string }> = {
  string: { dim: "length", unit: "characters" },
  file: { dim: "size", unit: "bytes" },
  array: { dim: "length", unit: "items" },
  set: { dim: "length", unit: "items" },
};

function getSizing(origin: string): { dim: string; unit: string } | null {
  return Sizable[origin] ?? null;
}

const Nouns: {
  [k in
    | errors.$ZodStringFormats
    // | errors.$ZodIssue
    | (string & {})]?: string;
} = {
  regex: "string",
  email: "email",
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
  iso_datetime: "ISO datetime",
  iso_date: "ISO date",
  iso_time: "ISO time",
  duration: "duration",
  ip: "IP address",
  ipv4: "IPv4 address",
  ipv6: "IPv6 address",
  base64: "base64-encoded string",
  json_string: "JSON string",
  e164: "E.164 number",
  jwt: "JWT",
};

const error: errors.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return `Invalid input: expected ${issue.expected}`;
    // return `Invalid input: expected ${issue.expected}, received ${util.getParsedType(issue.input)}`;
    case "invalid_value":
      if (issue.values.length === 1) return `Invalid input: expected ${util.stringifyPrimitive(issue.values[0])}`;
      return `Invalid option: expected one of ${util.joinValues(issue.values, "|")}`;
    case "too_big": {
      const adj = issue.inclusive ? "<=" : "<";
      const sizing = getSizing(issue.origin);
      if (sizing)
        return `Too big: expected ${issue.origin ?? "value"} ${sizing.dim} to be ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
      return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}1`;
    }
    case "too_small": {
      const adj = issue.inclusive ? ">=" : ">";
      const sizing = getSizing(issue.origin);
      if (sizing) {
        return `Too small: expected ${issue.origin} ${sizing.dim} to be ${adj}${issue.minimum.toString()} ${sizing.unit}`;
      }

      return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
    }
    case "not_multiple_of":
      return `Invalid number: must be a multiple of ${issue.divisor}`;
    case "invalid_format": {
      const _issue = issue as errors.$ZodStringFormatIssues;
      if (_issue.format === "starts_with") return `Invalid string: must start with "${issue}"`;
      if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
      if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
      if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
      return `Invalid ${Nouns[_issue.format] ?? issue.format}`;
    }
    case "invalid_date":
      return "Invalid Date";
    case "unrecognized_keys":
      return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${util.joinValues(issue.keys, ", ")}`;
    case "invalid_union":
      return "Invalid input";
    case "invalid_key":
      return `Invalid key in ${issue.origin}`;
    case "invalid_element":
      return `Invalid value in ${issue.origin}`;
    default:
      return `Invalid input`;
  }
};

export { error };

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error,
  };
}
