import type { $ZodStringFormats } from "../core/checks.js";
import type * as errors from "../core/errors.js";
import * as util from "../core/util.js";

const error: () => errors.$ZodErrorMap = () => {
  // Hebrew labels + grammatical gender
  const TypeNames: Record<string, { label: string; gender: "m" | "f" }> = {
    string: { label: "מחרוזת", gender: "f" },
    number: { label: "מספר", gender: "m" },
    boolean: { label: "ערך בוליאני", gender: "m" },
    bigint: { label: "BigInt", gender: "m" },
    date: { label: "תאריך", gender: "m" },
    array: { label: "מערך", gender: "m" },
    object: { label: "אובייקט", gender: "m" },
    null: { label: "ערך ריק (null)", gender: "m" },
    undefined: { label: "ערך לא מוגדר", gender: "m" },
    symbol: { label: "סימבול", gender: "m" },
    function: { label: "פונקציה", gender: "f" },
    map: { label: "מפה (Map)", gender: "f" },
    set: { label: "קבוצה", gender: "f" },
    file: { label: "קובץ", gender: "m" },
    promise: { label: "Promise", gender: "m" },
    NaN: { label: "NaN", gender: "m" },
    unknown: { label: "ערך לא ידוע", gender: "m" },
    value: { label: "ערך", gender: "m" },
  };

  // Sizing units for size-related messages + localized origin labels
  const Sizable: Record<
    string,
    { unit: string; verb: string }
  > = {
    string: { unit: "אותיות", verb: "לכלול" },
    file: { unit: "בייטים", verb: "לכלול" },
    array: { unit: "פריטים", verb: "לכלול" },
    set: { unit: "פריטים", verb: "לכלול" },
    number: { unit: "", verb: "להיות" }, // no unit, but we still localize the origin
  };

  // Helpers — labels, articles, and verbs
  const typeEntry = (t?: string | null) => (t ? TypeNames[t] : undefined);

  const typeLabel = (t?: string | null): string => {
    const e = typeEntry(t);
    if (e) return e.label;
    // fallback: show raw string if unknown
    return t ?? TypeNames.unknown.label;
  };

  const withDefinite = (t?: string | null): string => `ה${typeLabel(t)}`;

  const verbFor = (t?: string | null): string => {
    const e = typeEntry(t);
    const gender = e?.gender ?? "m";
    return gender === "f" ? "צריכה להיות" : "צריך להיות";
  };

  const getSizing = (
    origin?: string | null
  ): { unit: string; verb: string } | null => {
    if (!origin) return null;
    return Sizable[origin] ?? null;
  };

  // Robust type parser for "received" — returns a key we understand or a constructor name
  const parsedType = (data: any): string => {
    const t = typeof data;
    switch (t) {
      case "number":
        return Number.isNaN(data) ? "NaN" : "number";
      case "object": {
        if (Array.isArray(data)) return "array";
        if (data === null) return "null";
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name; // keep as-is (e.g., "Date")
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

  return (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        // Expected type: show with ה׳ הידיעה and gendered verb
        const expectedKey = issue.expected as string | undefined;
        const expected = withDefinite(expectedKey);
        const expectedVerb = verbFor(expectedKey);
        // Received: show localized label if known, otherwise constructor/raw
        const receivedKey = parsedType(issue.input);
        const received =
          TypeNames[receivedKey]?.label ?? receivedKey;
        return `קלט לא תקין: ${expected} ${expectedVerb}, התקבל ${received}`;
      }

      case "invalid_value": {
        if (issue.values.length === 1) {
          return `קלט לא תקין: צריך ${util.stringifyPrimitive(issue.values[0])}`;
        }
        return `קלט לא תקין: צריך אחת מהאפשרויות ${util.joinValues(issue.values, " | ")}`;
      }

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        const subject = withDefinite(issue.origin ?? "value");
        const be = verbFor(issue.origin ?? "value");
        if (sizing && sizing.unit) {
          return `גדול מדי: ${subject} ${be} ${adj}${issue.maximum.toString()} ${sizing.unit}`;
        }
        return `גדול מדי: ${subject} ${be} ${adj}${issue.maximum.toString()}`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        const subject = withDefinite(issue.origin ?? "value");
        const be = verbFor(issue.origin ?? "value");
        if (sizing && sizing.unit) {
          return `קטן מדי: ${subject} ${be} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
        }
        return `קטן מדי: ${subject} ${be} ${adj}${issue.minimum.toString()}`;
      }

      case "invalid_format": {
        const _issue = issue as errors.$ZodStringFormatIssues;
        // These apply to strings — use feminine grammar + ה׳ הידיעה
        if (_issue.format === "starts_with") return `המחרוזת חייבת להתחיל ב"${_issue.prefix}"`;
        if (_issue.format === "ends_with") return `המחרוזת חייבת להסתיים ב"${_issue.suffix}"`;
        if (_issue.format === "includes") return `המחרוזת חייבת לכלול "${_issue.includes}"`;
        if (_issue.format === "regex") return `המחרוזת חייבת להתאים לתבנית ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? _issue.format} לא תקין`;
      }

      case "not_multiple_of":
        return `מספר לא תקין: חייב להיות מכפלה של ${issue.divisor}`;

      case "unrecognized_keys":
        return `מפתח${issue.keys.length > 1 ? "ות" : ""} לא מזוה${issue.keys.length > 1 ? "ים" : "ה"}: ${util.joinValues(issue.keys, ", ")}`;

      case "invalid_key": {
        const place = withDefinite(issue.origin ?? "object");
        return `מפתח לא תקין ב${place}`;
      }

      case "invalid_union":
        return "קלט לא תקין";

      case "invalid_element": {
        const place = withDefinite(issue.origin ?? "array");
        return `ערך לא תקין ב${place}`;
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
