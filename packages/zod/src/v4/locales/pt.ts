import type { $ZodStringFormats } from "../core/checks.js";
import type * as errors from "../core/errors.js";
import type { $ZodInvalidTypeExpected } from "../core/errors.js";
import * as util from "../core/util.js";

const error: () => errors.$ZodErrorMap = () => {
  const Sizable: Record<string, { unit: string }> = {
    string: { unit: "caracteres" },
    file: { unit: "bytes" },
    array: { unit: "elementos" },
    set: { unit: "elementos" },
    map: { unit: "entradas" },
  };

  function getSizing(origin: string): { unit: string } | null {
    return Sizable[origin] ?? null;
  }

  const FormatDictionary: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "a entrada",
    email: "o endereço de e-mail",
    url: "o URL",
    emoji: "o emoji",
    uuid: "o UUID",
    uuidv4: "o UUIDv4",
    uuidv6: "o UUIDv6",
    nanoid: "o nanoid",
    guid: "o GUID",
    cuid: "o cuid",
    cuid2: "o cuid2",
    ulid: "o ULID",
    xid: "o XID",
    ksuid: "o KSUID",
    datetime: "a data e hora ISO",
    date: "a data ISO",
    time: "a hora ISO",
    duration: "a duração ISO",
    ipv4: "o endereço IPv4",
    ipv6: "o endereço IPv6",
    mac: "o endereço MAC",
    cidrv4: "o intervalo de endereços IPv4",
    cidrv6: "o intervalo de endereços IPv6",
    base64: "o texto codificado em base64",
    base64url: "o texto codificado em base64url",
    json_string: "o texto JSON",
    e164: "o número E.164",
    jwt: "o JWT",
    template_literal: "a entrada",
  };

  type Articles = { definite: string; indefinite: string };

  const Gender: { [k in "masculine" | "feminine"]: Articles } = {
    masculine: { definite: "o", indefinite: "um" },
    feminine: { definite: "a", indefinite: "uma" },
  };

  const TypeDictionary: {
    [k in errors.$ZodInvalidTypeExpected | (string & {})]?: { name: string; articles: Articles };
  } = {
    string: { name: "texto", articles: Gender.masculine },
    number: { name: "número", articles: Gender.masculine },
    int: { name: "número inteiro", articles: Gender.masculine },
    boolean: { name: "valor booleano", articles: Gender.masculine },
    bigint: { name: "número bigint", articles: Gender.masculine },
    symbol: { name: "símbolo", articles: Gender.masculine },
    undefined: { name: 'valor "undefined"', articles: Gender.masculine },
    null: { name: 'valor "nulo"', articles: Gender.masculine },
    never: { name: 'valor "never"', articles: Gender.masculine },
    void: { name: 'valor "void"', articles: Gender.masculine },
    date: { name: "data", articles: Gender.feminine },
    array: { name: "vetor", articles: Gender.masculine },
    object: { name: "objeto", articles: Gender.masculine },
    tuple: { name: "tuplo", articles: Gender.masculine },
    record: { name: "registo", articles: Gender.masculine },
    map: { name: "mapa", articles: Gender.masculine },
    set: { name: "conjunto", articles: Gender.masculine },
    file: { name: "ficheiro", articles: Gender.masculine },
    nonoptional: { name: "valor não opcional", articles: Gender.masculine },
    nan: { name: 'valor "NaN"', articles: Gender.masculine }, // Compatibility: "nan" -> "NaN" for display
    function: { name: "função", articles: Gender.feminine },
  };

  function translateOriginWithArticle(
    type: $ZodInvalidTypeExpected | (string & {}),
    articleType: "definite" | "indefinite"
  ): string {
    const translatedValue = TypeDictionary[type] ?? { name: `valor "${type}"`, articles: Gender.masculine };
    return `${translatedValue.articles[articleType]} ${translatedValue.name}`;
  }

  return (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        const expected = translateOriginWithArticle(issue.expected, "indefinite");
        const receivedType = util.parsedType(issue.input);
        const received = translateOriginWithArticle(receivedType, "indefinite");
        return `Entrada inválida: esperava ${expected}, recebeu ${received}`;
      }

      case "invalid_value":
        if (issue.values.length === 1) return `Entrada inválida: esperava ${util.stringifyPrimitive(issue.values[0])}`;
        return `Opção inválida: esperava uma das seguintes opções: ${util.joinValues(issue.values, "|")}`;
      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing)
          return `Demasiado grande: esperava que ${translateOriginWithArticle(issue.origin, "definite")} tivesse ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "elementos"}`;
        return `Demasiado grande: esperava que ${translateOriginWithArticle(issue.origin, "definite")} fosse ${adj} ${issue.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          return `Demasiado pequeno: esperava que ${translateOriginWithArticle(issue.origin, "definite")} tivesse ${adj} ${issue.minimum.toString()} ${sizing.unit ?? "elementos"}`;
        }

        return `Demasiado pequeno: esperava que ${translateOriginWithArticle(issue.origin, "definite")} fosse ${adj} ${issue.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue as errors.$ZodStringFormatIssues;
        if (_issue.format === "starts_with") return `Texto inválido: deve começar por "${_issue.prefix}"`;
        if (_issue.format === "ends_with") return `Texto inválido: deve terminar em "${_issue.suffix}"`;
        if (_issue.format === "includes") return `Texto inválido: deve incluir "${_issue.includes}"`;
        if (_issue.format === "regex") return `Texto inválido: deve corresponder ao padrão ${_issue.pattern}`;
        return `Formato d${FormatDictionary[_issue.format] ?? issue.format} inválido`;
      }
      case "not_multiple_of":
        return `Número inválido: deve ser múltiplo de ${issue.divisor}`;
      case "unrecognized_keys": {
        const plural = issue.keys.length > 1 ? "s" : "";
        return `Chave${plural} inválida${plural}: ${util.joinValues(issue.keys, ", ")}`;
      }
      case "invalid_key":
        return `Entrada inválida n${translateOriginWithArticle(issue.origin, "definite")}`;
      case "invalid_union":
        if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
          const opts = issue.options.map((o) => `'${o}'`).join(" | ");
          return `Valor de discriminação inválido. Esperava ${opts}`;
        }
        return "Entrada inválida";
      case "invalid_element":
        return `Entrada inválida n${translateOriginWithArticle(issue.origin, "definite")}`;
      default:
        return `Entrada inválida`;
    }
  };
};

export default function (): { localeError: errors.$ZodErrorMap } {
  return {
    localeError: error(),
  };
}
