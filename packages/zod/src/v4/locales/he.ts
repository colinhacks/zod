import type { $ZodStringFormats } from "../core/checks.js";
import type * as errors from "../core/errors.js";
import * as util from "../core/util.js";

const error: () => errors.$ZodErrorMap = () => {
  // Hebrew display names for types/origins
  const TypeNames: Record<string, string> = {
    string: "מחרוזת",
    number: "מספר",
    boolean: "בוליאני",
    bigint: "BigInt",
    date: "תאריך",
    array: "מערך",
    object: "אובייקט",
    null: "null",
    undefined: "לא הוגדר",
    symbol: "סימבול",
    function: "פונקציה",
    map: "Map",
    set: "קבוצה",
    file: "קובץ",
    promise: "Promise",
    NaN: "NaN",
    unknown: "לא ידוע",
    value: "ערך",
  };

  const translateType = (t: string | undefined | null): string => {
    if (!t) return TypeNames.unknown;
    return TypeNames[t] ?? t;
  };

  // Units for size-related messages (string/array/set/file)
  const Sizable: Record<string, { unit: string; verb: string; originLabel: string }> = {
    string: { unit: "אותיות", verb: "לכלול", originLabel: TypeNames.string },
    file: { unit: "בייטים", verb: "לכלול", originLabel: TypeNames.file },
    array: { unit: "פריטים", verb: "לכלול", originLabel: TypeNames.array },
    set: { unit: "פריטים", verb: "לכלול", originLabel: TypeNames.set },
    number: { unit: "", verb: "להיות", originLabel: TypeNames.number }, // number is not really "sizable", but we still relabel the origin
  };

  const getSizing = (origin: string | undefined | null): { unit: string; verb: string; originLabel: string } | null => {
    if (!origin) return null;
    return Sizable[origin] ?? null;
  };

  const parsedType = (data: any): string => {
    const t = typeof data;
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) return "array";
        if (data === null) return "null";
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
        return "object";
      }
      default:
        return t;
    }
  };

  const Nouns: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "קלט",
    email: "כתובת אימייל",
    url: "כתובת רשת",
    emoji: "אימוג'י",
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
    datetime: "תאריך וזמן ISO",
    date: "תאריך ISO",
    time: "זמן ISO",
    duration: "משך זמן ISO",
    ipv4: "כתובת IPv4",
    ipv6: "כתובת IPv6",
    cidrv4: "טווח IPv4",
    cidrv6: "טווח IPv6",
    base64: "מחרוזת בבסיס 64",
    base64url: "מחרוזת בבסיס 64 לכתובות רשת",
    json_string: "מחרוזת JSON",
    e164: "מספר E.164",
    jwt: "JWT",
    template_literal: "קלט",
  };

  const renderOriginLabel = (origin?: string | null): string => {
    if (!origin) return TypeNames.value;
    return translateType(origin);
  };

  return (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        const expected = translateType(issue.expected as string);
        const received = translateType(parsedType(issue.input));
        return `קלט לא תקין: צריך ${expected}, התקבל ${received}`;
      }

      case "invalid_value":
        if (issue.values.length === 1) {
          return `קלט לא תקין: צריך ${util.stringifyPrimitive(issue.values[0])}`;
        }
        return `קלט לא תקין: צריך אחת מהאפשרויות ${util.joinValues(issue.values, " | ")}`;

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        const originLabel = renderOriginLabel(issue.origin);
        if (sizing && sizing.unit) {
          return `גדול מדי: ${originLabel} צריך להיות ${adj}${issue.maximum.toString()} ${sizing.unit}`;
        }
        return `גדול מדי: ${originLabel} צריך להיות ${adj}${issue.maximum.toString()}`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        const originLabel = renderOriginLabel(issue.origin);
        if (sizing && sizing.unit) {
          return `קטן מדי: ${originLabel} צריך להיות ${adj}${issue.minimum.toString()} ${sizing.unit}`;
        }
        return `קטן מדי: ${originLabel} צריך להיות ${adj}${issue.minimum.toString()}`;
      }

      case "invalid_format": {
        const _issue = issue as errors.$ZodStringFormatIssues;
        if (_issue.format === "starts_with") return `מחרוזת לא תקינה: חייבת להתחיל ב"${_issue.prefix}"`;
        if (_issue.format === "ends_with") return `מחרוזת לא תקינה: חייבת להסתיים ב"${_issue.suffix}"`;
        if (_issue.format === "includes") return `מחרוזת לא תקינה: חייבת לכלול "${_issue.includes}"`;
        if (_issue.format === "regex") return `מחרוזת לא תקינה: חייבת להתאים לתבנית ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? _issue.format} לא תקין`;
      }

      case "not_multiple_of":
        return `מספר לא תקין: חייב להיות מכפלה של ${issue.divisor}`;

      case "unrecognized_keys":
        return `מפתח${issue.keys.length > 1 ? "ות" : ""} לא מזוה${issue.keys.length > 1 ? "ים" : "ה"}: ${util.joinValues(issue.keys, ", ")}`;

      case "invalid_key": {
        const originLabel = renderOriginLabel(issue.origin);
        return `מפתח לא תקין ב${originLabel}`;
      }

      case "invalid_union":
        return "קלט לא תקין";

      case "invalid_element": {
        const originLabel = renderOriginLabel(issue.origin);
        return `ערך לא תקין ב${originLabel}`;
      }

      default:
        return `קלט לא תקין`;
    }
  };
};

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error(),
  };
}
