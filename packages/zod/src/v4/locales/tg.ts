import type { $ZodStringFormats } from "../core/checks.js";
import type * as errors from "../core/errors.js";
import * as util from "../core/util.js";

const error: () => errors.$ZodErrorMap = () => {
  // singular units after numerals in Tajik
  const Sizable: Record<string, { unit: string; verb: string }> = {
    string: { unit: "аломат", verb: "дошта бошад" },
    file: { unit: "байт", verb: "дошта бошад" },
    array: { unit: "унсур", verb: "дошта бошад" },
    set: { unit: "унсур", verb: "дошта бошад" },
    map: { unit: "сабт", verb: "дошта бошад" },
  };

  function getSizing(origin: string): { unit: string; verb: string } | null {
    return Sizable[origin] ?? null;
  }

  const FormatDictionary: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "вуруд",
    email: "суроғаи email",
    url: "URL",
    emoji: "эмоҷи",
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
    datetime: "санаву вақти ISO",
    date: "санаи ISO",
    time: "вақти ISO",
    duration: "давомнокии ISO",
    ipv4: "суроғаи IPv4",
    ipv6: "суроғаи IPv6",
    mac: "суроғаи MAC",
    cidrv4: "маҳдудаи IPv4",
    cidrv6: "маҳдудаи IPv6",
    base64: "сатри дар формати base64",
    base64url: "сатри дар формати base64url",
    json_string: "сатри JSON",
    e164: "рақами E.164",
    credit_card: "рақами корти кредитӣ",
    iban: "IBAN",
    jwt: "JWT",
    template_literal: "вуруд",
  };

  const TypeDictionary: {
    [k in errors.$ZodInvalidTypeExpected | (string & {})]?: string;
  } = {
    nan: "NaN",
    number: "рақам",
    string: "сатр",
    array: "массив",
    object: "объект",
    date: "сана",
  };

  return (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue.expected] ?? issue.expected;
        const receivedType = util.parsedType(issue.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        return `Вуруди нодуруст: ${expected} интизор мерафт, ${received} гирифта шуд`;
      }

      case "invalid_value":
        if (issue.values.length === 1)
          return `Вуруди нодуруст: ${util.stringifyPrimitive(issue.values[0])} интизор мерафт`;
        return `Интихоби нодуруст: яке аз ${util.joinValues(issue.values, "|")} интизор мерафт`;

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing)
          return `Хеле калон: ${issue.origin ?? "қимат"} бояд ${adj}${issue.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
        return `Хеле калон: ${issue.origin ?? "қимат"} бояд ${adj}${issue.maximum.toString()} бошад`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing)
          return `Хеле хурд: ${issue.origin} бояд ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
        return `Хеле хурд: ${issue.origin} бояд ${adj}${issue.minimum.toString()} бошад`;
      }

      case "invalid_format": {
        const _issue = issue as errors.$ZodStringFormatIssues;
        if (_issue.format === "starts_with") return `Сатри нодуруст: бояд бо "${_issue.prefix}" оғоз шавад`;
        if (_issue.format === "ends_with") return `Сатри нодуруст: бояд бо "${_issue.suffix}" анҷом ёбад`;
        if (_issue.format === "includes") return `Сатри нодуруст: бояд "${_issue.includes}"-ро дар бар гирад`;
        if (_issue.format === "regex") return `Сатри нодуруст: бояд ба намунаи ${_issue.pattern} мувофиқат кунад`;
        return `${FormatDictionary[_issue.format] ?? issue.format}-и нодуруст`;
      }

      case "not_multiple_of":
        return `Рақами нодуруст: бояд ба ${issue.divisor} бе бақия тақсим шавад`;

      case "unrecognized_keys":
        return `Калид${issue.keys.length > 1 ? "ҳои" : "и"} номаълум: ${util.joinValues(issue.keys, ", ")}`;

      case "invalid_key":
        return `Калиди нодуруст дар ${issue.origin}`;

      case "invalid_union":
        if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
          const opts = issue.options.map((o) => `'${o}'`).join(" | ");
          return `Қимати нодурусти дискриминатор: ${opts} интизор мерафт`;
        }
        return "Вуруди нодуруст";

      case "invalid_element":
        return `Қимати нодуруст дар ${issue.origin}`;

      default:
        return `Вуруди нодуруст`;
    }
  };
};

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error(),
  };
}
