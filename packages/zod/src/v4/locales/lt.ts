import type {$ZodStringFormats} from "../core/checks.js";
import type * as errors from "../core/errors.js";
import * as util from "../core/util.js";

export const parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "skaičius";
    }
    case "bigint": {
      return "sveikasis skaičius";
    }
    case "string": {
      return "eilutė";
    }
    case "boolean": {
      return "loginė reikšmė"
    }
    case "undefined": {
      return "neapibrėžta reikšmė"
    }
    case "function": {
      return "funkcija"
    }
    case "symbol": {
      return "simbolis"
    }
    case "object": {
      if (Array.isArray(data)) {
        return "masyvas";
      }
      if (data === null) {
        return "nulinė reikšmė";
      }

      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  return t;
};

type SizeableComparisonType = 'smaller' | 'bigger';

const error: () => errors.$ZodErrorMap = () => {
  const Sizable: Record<string, {
    unit: { one: string, many: string },
    verb: Record<SizeableComparisonType, { inclusive: string, notInclusive: string }>
  }> = {
    string: {
      unit: {
        one: 'simbolis',
        many: 'simbolių',
      },
      verb: {
        smaller: {
          inclusive: 'turi būti ne ilgesnė kaip',
          notInclusive: 'turi būti trumpesnė kaip'
        },
        bigger: {
          inclusive: 'turi būti ne trumpesnė kaip',
          notInclusive: 'turi būti ilgesnė kaip'
        }
      }
    },
    file: {
      unit: {
        one: 'baitas',
        many: 'baitų'
      },
      verb: {
        smaller: {
          inclusive: 'turi būti ne didesnis kaip',
          notInclusive: 'turi būti mažesnis kaip'
        },
        bigger: {
          inclusive: 'turi būti ne mažesnis kaip',
          notInclusive: 'turi būti didesnis kaip'
        }
      }
    },
    array: {
      unit: {
        one: 'elementas',
        many: 'elementų',
      },
      verb: {
        smaller: {
          inclusive: 'turi turėti ne daugiau kaip',
          notInclusive: 'turi turėti mažiau kaip'
        },
        bigger: {
          inclusive: 'turi turėti ne mažiau kaip',
          notInclusive: 'turi turėti daugiau kaip'
        }
      }
    },
    set: {
      unit: {
        one: "elementas",
        many: "elementų",
      },
      verb: {
        smaller: {
          inclusive: 'turi turėti ne daugiau kaip',
          notInclusive: 'turi turėti mažiau kaip'
        },
        bigger: {
          inclusive: 'turi turėti ne mažiau kaip',
          notInclusive: 'turi turėti daugiau kaip'
        }
      }
    },
  };

  function getSizing(origin: string, single: boolean, inclusive: boolean, targetShouldBe: SizeableComparisonType): {
    unit: string,
    verb: string
  } | null {
    const result = Sizable[origin] ?? null;
    if (result === null) return result;

    return {
      unit: result.unit[single ? 'one' : 'many'],
      verb: result.verb[targetShouldBe][inclusive ? 'inclusive' : 'notInclusive'],
    };
  }

  const Nouns: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "įvestis",
    email: "el. pašto adresas",
    url: "URL",
    emoji: "jaustukas",
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
    datetime: "ISO data ir laikas",
    date: "ISO data",
    time: "ISO laikas",
    duration: "ISO trukmė",
    ipv4: "IPv4 adresas",
    ipv6: "IPv6 adresas",
    cidrv4: "IPv4 tinklo prefiksas (CIDR)",
    cidrv6: "IPv6 tinklo prefiksas (CIDR)",
    base64: "base64 užkoduota eilutė",
    base64url: "base64url užkoduota eilutė",
    json_string: "JSON eilutė",
    e164: "E.164 numeris",
    jwt: "JWT",
    template_literal: "įvestis",
  };

  return (issue) => {
    switch (issue.code) {
      case "invalid_type":
        return `Gautas tipas ${parsedType(issue.input)}, o tikėtasi - ${issue.expected}`;
      case "invalid_value":
        if (issue.values.length === 1) return `Privalo būti ${util.stringifyPrimitive(issue.values[0])}`;
        return `Privalo būti vienas iš ${util.joinValues(issue.values, "|")} pasirinkimų`;
      case "too_big": {
        const sizing = getSizing(
          issue.origin,
          Number(issue.maximum) === 1,
          issue.inclusive ?? false,
          'smaller'
        );
        if (sizing?.verb)
          return `${issue.origin ?? "reikšmė"} ${sizing.verb} ${issue.maximum.toString()} ${sizing.unit ?? "elementų"}`;
        const adj = issue.inclusive ? "ne didesnis kaip" : "mažesnis kaip";
        return `${issue.origin ?? "value"} turi būti ${adj} ${issue.maximum.toString()} ${sizing?.unit}`;
      }
      case "too_small": {
        const sizing = getSizing(
          issue.origin,
          Number(issue.minimum) === 1,
          issue.inclusive ?? false,
          'bigger',
        );
        if (sizing?.verb)
          return `${issue.origin} ${sizing.verb} ${issue.minimum.toString()} ${sizing.unit ?? "elementų"}`;
        const adj = issue.inclusive ? "ne mažesnis kaip" : "didesnis kaip";
        return `${issue.origin} turi būti ${adj} ${issue.minimum.toString()} ${sizing?.unit}`;
      }
      case "invalid_format": {
        const _issue = issue as errors.$ZodStringFormatIssues;
        if (_issue.format === "starts_with") {
          return `Eilutė privalo prasidėti "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with") return `Eilutė privalo pasibaigti "${_issue.suffix}"`;
        if (_issue.format === "includes") return `Eilutė privalo įtraukti "${_issue.includes}"`;
        if (_issue.format === "regex") return `Eilutė privalo atitikti ${_issue.pattern}`;
        return `Neteisingas ${Nouns[_issue.format] ?? issue.format}`;
      }
      case "not_multiple_of":
        return `Skaičius privalo būti ${issue.divisor} kartotinis.`;
      case "unrecognized_keys":
        return `Neatpažint${issue.keys.length > 1 ? "i" : "as"} rakt${issue.keys.length > 1 ? "ai" : "as"}: ${util.joinValues(issue.keys, ", ")}`;
      case "invalid_key":
        return `Rastas klaidingas raktas`;
      case "invalid_union":
        return "Klaidinga įvestis";
      case "invalid_element":
        return `${issue.origin} turi klaidingą įvestį`;
      default:
        return `Klaidinga įvestis`;
    }
  };
};

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error(),
  };
}
