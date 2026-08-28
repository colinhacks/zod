import type { $ZodStringFormats } from "../core/checks.js";
import type * as errors from "../core/errors.js";
import * as util from "../core/util.js";

const error: () => errors.$ZodErrorMap = () => {
  const Sizable: Record<string, { unit: string; verb: string }> = {
    string: { unit: "अक्षर", verb: "हुनुपर्छ" },
    file: { unit: "बाइट", verb: "हुनुपर्छ" },
    array: { unit: "तत्व", verb: "हुनुपर्छ" },
    set: { unit: "तत्व", verb: "हुनुपर्छ" },
    map: { unit: "प्रविष्टि", verb: "हुनुपर्छ" },
  };

  function getSizing(origin: string): { unit: string; verb: string } | null {
    return Sizable[origin] ?? null;
  }

  const FormatDictionary: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "इनपुट",
    email: "इमेल ठेगाना",
    url: "URL",
    emoji: "इमोजी",
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
    datetime: "ISO मिति र समय",
    date: "ISO मिति",
    time: "ISO समय",
    duration: "ISO अवधि",
    ipv4: "IPv4 ठेगाना",
    ipv6: "IPv6 ठेगाना",
    mac: "MAC ठेगाना",
    cidrv4: "IPv4 दायरा",
    cidrv6: "IPv6 दायरा",
    base64: "base64-इन्कोड गरिएको स्ट्रिङ",
    base64url: "base64url-इन्कोड गरिएको स्ट्रिङ",
    json_string: "JSON स्ट्रिङ",
    e164: "E.164 नम्बर",
    credit_card: "क्रेडिट कार्ड नम्बर",
    jwt: "JWT",
    template_literal: "इनपुट",
  };

  const TypeDictionary: {
    [k in errors.$ZodInvalidTypeExpected | (string & {})]?: string;
  } = {
    nan: "NaN",
  };

  return (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue.expected] ?? issue.expected;
        const receivedType = util.parsedType(issue.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        return `अमान्य इनपुट: अपेक्षित ${expected}, प्राप्त ${received}`;
      }

      case "invalid_value":
        if (issue.values.length === 1) return `अमान्य इनपुट: अपेक्षित ${util.stringifyPrimitive(issue.values[0])}`;
        return `अमान्य विकल्प: अपेक्षित मानहरू मध्ये एक ${util.joinValues(issue.values, "|")}`;

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing)
          return `धेरै ठूलो: ${issue.origin ?? "मान"} मा ${adj}${issue.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
        return `धेरै ठूलो: ${issue.origin ?? "मान"} ${adj}${issue.maximum.toString()} हुनुपर्छ`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing)
          return `धेरै सानो: ${issue.origin} मा ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
        return `धेरै सानो: ${issue.origin} ${adj}${issue.minimum.toString()} हुनुपर्छ`;
      }

      case "invalid_format": {
        const _issue = issue as errors.$ZodStringFormatIssues;
        if (_issue.format === "starts_with") return `अमान्य स्ट्रिङ: "${_issue.prefix}" बाट सुरु हुनुपर्छ`;
        if (_issue.format === "ends_with") return `अमान्य स्ट्रिङ: "${_issue.suffix}" मा समाप्त हुनुपर्छ`;
        if (_issue.format === "includes") return `अमान्य स्ट्रिङ: "${_issue.includes}" समावेश हुनुपर्छ`;
        if (_issue.format === "regex") return `अमान्य स्ट्रिङ: ढाँचा ${_issue.pattern} सँग मेल खानुपर्छ`;
        return `अमान्य ${FormatDictionary[_issue.format] ?? issue.format}`;
      }

      case "not_multiple_of":
        return `अमान्य संख्या: ${issue.divisor} को गुणज हुनुपर्छ`;

      case "unrecognized_keys":
        return `अपरिचित कुञ्जी${issue.keys.length > 1 ? "हरू" : ""}: ${util.joinValues(issue.keys, ", ")}`;

      case "invalid_key":
        return `अमान्य कुञ्जी: ${issue.origin} मा`;

      case "invalid_union":
        if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
          const opts = issue.options.map((o) => `'${o}'`).join(" | ");
          return `अमान्य डिस्क्रिमिनेटर मान: अपेक्षित ${opts}`;
        }
        return "अमान्य इनपुट";

      case "invalid_element":
        return `अमान्य मान: ${issue.origin} मा`;

      default:
        return `अमान्य इनपुट`;
    }
  };
};

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error(),
  };
}
