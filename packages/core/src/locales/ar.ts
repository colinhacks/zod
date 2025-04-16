import type { $ZodStringFormats } from "../checks.js";
import type * as errors from "../errors.js";
import * as util from "../util.js";

const Sizable: Record<string, { unit: string; verb: string }> = {
  string: { unit: "حرف", verb: "أن يحوي" },
  file: { unit: "بايت", verb: "أن يحوي" },
  array: { unit: "عنصر", verb: "أن يحوي" },
  set: { unit: "عنصر", verb: "أن يحوي" },
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
      return `مدخلات غير مقبولة: يفترض إدخال ${issue.expected}، ولكن ما تم إدخاله ${parsedType(issue.input)}`;
    case "invalid_value":
      if (issue.values.length === 1) return `مدخلات غير مقبولة: يفترض إدخال ${util.stringifyPrimitive(issue.values[0])}`;
      return `اختيار غير مقبول: يتوقع انتقاء أحد هذه الخيارات: ${util.joinValues(issue.values, "|")}`;
    case "too_big": {
      const adj = issue.inclusive ? "<=" : "<";
      const sizing = getSizing(issue.origin);
      if (sizing)
        return ` أكبر من اللازم: يفترض أن تكون ${issue.origin ?? "القيمة"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "عنصرًا"}`;
      return `أكبر من اللازم: يفترض أن تكون ${issue.origin ?? "القيمة"} ${adj}${issue.maximum.toString()}`;
    }
    case "too_small": {
      const adj = issue.inclusive ? ">=" : ">";
      const sizing = getSizing(issue.origin);
      if (sizing) {
        return `أصغر من اللازم: يفترض لـ ${issue.origin} أن يكون ${adj}${issue.minimum.toString()} ${sizing.unit}`;
      }

      return `أصغر من اللازم: يفترض لـ ${issue.origin} أن يكون ${adj}${issue.minimum.toString()}`;
    }
    case "invalid_format": {
      const _issue = issue as errors.$ZodStringFormatIssues;
      if (_issue.format === "starts_with") return `نَص خطأ: يجب أن يبدأ بـ "${issue}"`;
      if (_issue.format === "ends_with") return `نَص خطأ: يجب أن ينتهي بـ "${_issue.suffix}"`;
      if (_issue.format === "includes") return `نَص خطأ: يجب أن يتضمَّن "${_issue.includes}"`;
      if (_issue.format === "regex") return `نَص خطأ: يجب أن يطابق النمط ${_issue.pattern}`;
      return `Invalid ${Nouns[_issue.format] ?? issue.format}`;
    }
    case "not_multiple_of":
      return `رقم غير مقبول: يجب أن يكون من مضاعفات ${issue.divisor}`;
    case "unrecognized_keys":
      return `معرف${issue.keys.length > 1 ? "ات" : ""} غريب${issue.keys.length > 1 ? "ة" : ""}: ${util.joinValues(issue.keys, "، ")}`;
    case "invalid_key":
      return `معرف غير مقبول في ${issue.origin}`;
    case "invalid_union":
      return "مدخل غير مقبول";
    case "invalid_element":
      return `مدخل غير مقبول في ${issue.origin}`;
    default:
      return `مدخل غير مقبول`;
  }
};

export { error };

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error,
  };
}