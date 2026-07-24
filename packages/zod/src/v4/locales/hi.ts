import type { $ZodStringFormats } from "../core/checks.js";
import type * as errors from "../core/errors.js";
import * as util from "../core/util.js";

const error: () => errors.$ZodErrorMap = () => {
  const Sizable: Record<string, { unit: string; verb: string }> = {
    string: { unit: "अक्षर", verb: "रखने के लिए" },
    file: { unit: "बाइट्स", verb: "रखने के लिए" },
    array: { unit: "तत्व", verb: "रखने के लिए" },
    set: { unit: "तत्व", verb: "रखने के लिए" },
    map: { unit: "प्रविष्टियाँ", verb: "रखने के लिए" },
  };

  function getSizing(origin: string): { unit: string; verb: string } | null {
    return Sizable[origin] ?? null;
  }

  const FormatDictionary: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "इनपुट",
    email: "ईमेल पता",
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
    datetime: "ISO तिथि और समय",
    date: "ISO तिथि",
    time: "ISO समय",
    duration: "ISO अवधि",
    ipv4: "IPv4 पता",
    ipv6: "IPv6 पता",
    mac: "MAC पता",
    cidrv4: "IPv4 श्रेणी",
    cidrv6: "IPv6 श्रेणी",
    base64: "Base64-एन्कोडेड स्ट्रिंग",
    base64url: "Base64URL-एन्कोडेड स्ट्रिंग",
    json_string: "JSON स्ट्रिंग",
    e164: "E.164 संख्या",
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
        return `अमान्य विकल्प: अपेक्षित मानों में से एक ${util.joinValues(issue.values, "|")}`;

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing) return `बहुत बड़ा: अपेक्षित था कि ${issue.origin ?? "मान"} में ${adj}${issue.maximum} ${sizing.unit} हों`;
        return `बहुत बड़ा: अपेक्षित था कि ${issue.origin ?? "मान"} ${adj}${issue.maximum} हो`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing) return `बहुत छोटा: अपेक्षित था कि ${issue.origin} में ${adj}${issue.minimum} ${sizing.unit} हों`;
        return `बहुत छोटा: अपेक्षित था कि ${issue.origin} ${adj}${issue.minimum} हो`;
      }

      case "invalid_format": {
        const _issue = issue as errors.$ZodStringFormatIssues;
        if (_issue.format === "starts_with") return `अमान्य स्ट्रिंग: "${_issue.prefix}" से शुरू होना चाहिए`;
        if (_issue.format === "ends_with") return `अमान्य स्ट्रिंग: "${_issue.suffix}" पर समाप्त होना चाहिए`;
        if (_issue.format === "includes") return `अमान्य स्ट्रिंग: इसमें "${_issue.includes}" शामिल होना चाहिए`;
        if (_issue.format === "regex") return `अमान्य स्ट्रिंग: पैटर्न ${_issue.pattern} से मेल खाना चाहिए`;
        return `अमान्य ${FormatDictionary[_issue.format] ?? issue.format}`;
      }

      case "not_multiple_of":
        return `अमान्य संख्या: यह ${issue.divisor} का गुणज होना चाहिए`;

      case "unrecognized_keys":
        return `अपरिचित कुंजी${issue.keys.length > 1 ? "याँ" : ""}: ${util.joinValues(issue.keys, ", ")}`;

      case "invalid_key":
        return `अमान्य कुंजी: ${issue.origin} में`;

      case "invalid_union":
        if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
          const opts = issue.options.map((o) => `'${o}'`).join(" | ");
          return `अमान्य डिस्क्रिमिनेटर मान: अपेक्षित ${opts}`;
        }
        return "अमान्य इनपुट";

      case "invalid_element":
        return `अमान्य मान: ${issue.origin} में`;

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
