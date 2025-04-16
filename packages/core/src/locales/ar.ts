import type { $ZodStringFormats } from "../checks.js";
import type * as errors from "../errors.js";
import * as util from "../util.js";

const Sizable: Record<string, { unit: string; verb: string }> = {
  string: { unit: "حرف", verb: "أن يحتوي على" },
  file: { unit: "بايت", verb: "أن يحتوي على" },
  array: { unit: "عنصر", verb: "أن يحتوي على" },
  set: { unit: "عنصر", verb: "أن يحتوي على" },
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
      return `نوع غير صالح: كان من المتوقع ${issue.expected}، تم استلام ${parsedType(issue.input)}`;
    case "invalid_value":
      if (issue.values.length === 1)
        return `القيمة غير صالحة. القيمة المتوقعة ${util.stringifyPrimitive(issue.values[0])}`;
      return `خيار غير صالح: كان من المتوقع أن تكون أحد القيم ${util.joinValues(issue.values, "|")}`;
    case "too_big": {
      const adj = issue.inclusive ? "<=" : "<";
      const sizing = getSizing(issue.origin);
      if (sizing)
        return `كبير جدًا: من المتوقع أن يحتوي ${issue.origin ?? "value"} على ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
      return `كبير جدًا: من المتوقع أن يكون ${issue.origin ?? "value"} ${adj}${issue.maximum.toString()}`;
    }
    case "too_small": {
      const adj = issue.inclusive ? ">=" : ">";
      const sizing = getSizing(issue.origin);
      if (sizing) {
        return `صغير جدًا: من المتوقع أن يحتوي ${issue.origin} على ${adj}${issue.minimum.toString()} ${sizing.unit}`;
      }

      return `صغير جدًا: من المتوقع أن يكون ${issue.origin} ${adj}${issue.minimum.toString()}`;
    }
    case "invalid_format": {
      const _issue = issue as errors.$ZodStringFormatIssues;
      if (_issue.format === "starts_with") return `تنسيق غير صالح: يجب أن يبدأ بـ "${issue}"`;
      if (_issue.format === "ends_with") return `تنسيق غير صالح: يجب أن ينتهي بـ "${_issue.suffix}"`;
      if (_issue.format === "includes") return `تنسيق غير صالح: يجب أن يتضمن "${_issue.includes}"`;
      if (_issue.format === "regex") return `تنسيق غير صالح: يجب أن يطابق النمط ${_issue.pattern}`;
      return `${Nouns[_issue.format] ?? issue.format} غير صالح`;
    }
    case "not_multiple_of":
      return `رقم غير صالح: يجب أن يكون من مضاعفات ${issue.divisor}`;
    case "unrecognized_keys":
      return `${issue.keys.length > 1 ? "مفاتيح غير معروفة" : "مفتاح غير معروف"}: ${util.joinValues(issue.keys, "، ")}`;
    case "invalid_key":
      return `مفتاح غير صالح في ${issue.origin}`;
    case "invalid_union":
      return "إدخال غير صالح";
    case "invalid_element":
      return `قيمة غير صالحة في ${issue.origin}`;
    default:
      return "إدخال غير صالح";
  }
};

export { error };

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error,
  };
}
