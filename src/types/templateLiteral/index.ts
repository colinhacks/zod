import { ZodAny } from "../any";
import { ZodBigInt } from "../bigint";
import { ZodBoolean } from "../boolean";
import { ZodBranded } from "../branded";
import { ZodEnum } from "../enum";
import {
  ZodIssueCode,
  ZodTemplateLiteralUnsupportedCheckError,
  ZodTemplateLiteralUnsupportedTypeError,
} from "../error";
import {
  RawCreateParams,
  ZodFirstPartyTypeKind,
  ZodType,
  ZodTypeDef,
} from "../index";
import { ZodLazy } from "../lazy";
import { ZodLiteral } from "../literal";
import { ZodNaN } from "../nan";
import { ZodNativeEnum } from "../nativeEnum";
import { ZodNever } from "../never";
import { ZodNull } from "../null";
import { ZodNullable } from "../nullable";
import { ZodNumber } from "../number";
import { ZodOptional } from "../optional";
import { ZodPipeline } from "../pipeline";
import {
  cuid2Regex,
  cuidRegex,
  datetimeRegex,
  emailRegex,
  ipv4Regex,
  ipv6Regex,
  ulidRegex,
  uuidRegex,
  ZodString,
  ZodStringCheck,
} from "../string";
import { ZodUndefined } from "../undefined";
import { ZodUnion } from "../union";
import { processCreateParams, util, ZodParsedType } from "../utils";
import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
} from "../utils/parseUtil";

type TemplateLiteralPrimitive = string | number | boolean | null | undefined;
type TemplateLiteralInterpolatedPosition = ZodType<
  TemplateLiteralPrimitive | bigint
>;
type appendToTemplateLiteral<
  Template extends string,
  Suffix extends TemplateLiteralPrimitive | ZodType
> = Suffix extends TemplateLiteralPrimitive
  ? `${Template}${Suffix}`
  : Suffix extends ZodOptional<infer UnderlyingType>
  ? Template | appendToTemplateLiteral<Template, UnderlyingType>
  : Suffix extends ZodBranded<infer UnderlyingType, any>
  ? appendToTemplateLiteral<Template, UnderlyingType>
  : Suffix extends ZodType<infer Output, any, any>
  ? Output extends TemplateLiteralPrimitive | bigint
    ? `${Template}${Output}`
    : never
  : never;

export interface ZodTemplateLiteralDef extends ZodTypeDef {
  coerce: boolean;
  parts: readonly (
    | TemplateLiteralPrimitive
    | TemplateLiteralInterpolatedPosition
  )[];
  regexString: string;
  typeName: ZodFirstPartyTypeKind.ZodTemplateLiteral;
}

export class ZodTemplateLiteral<Template extends string = ""> extends ZodType<
  Template,
  ZodTemplateLiteralDef
> {
  interpolated<I extends TemplateLiteralInterpolatedPosition>(
    type: Exclude<I, ZodNever | ZodNaN | ZodPipeline<any, any> | ZodLazy<any>>
  ): ZodTemplateLiteral<appendToTemplateLiteral<Template, I>> {
    return this._addPart(type) as any;
  }

  literal<L extends TemplateLiteralPrimitive>(
    literal: L
  ): ZodTemplateLiteral<appendToTemplateLiteral<Template, L>> {
    return this._addPart(literal) as any;
  }

  _parse(input: ParseInput): ParseReturnType<Template> {
    if (this._def.coerce) {
      input.data = String(input.data);
    }

    const parsedType = this._getType(input);

    if (parsedType !== ZodParsedType.string) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    if (!new RegExp(this._def.regexString).test(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_string,
        message: `does not match template literal with pattern /${this._def.regexString}/`,
        path: ctx.path,
        validation: "regex",
      });
      return INVALID;
    }

    return { status: "valid", value: input.data };
  }

  protected _addPart(
    part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
  ): ZodTemplateLiteral {
    const parts = [...this._def.parts, part];

    return new ZodTemplateLiteral({
      ...this._def,
      parts,
      regexString: this._appendToRegexString(this._def.regexString, part),
    });
  }

  protected _appendToRegexString(
    regexString: string,
    part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
  ): string {
    return `^${this._unwrapRegExp(
      regexString
    )}${this._transformPartToRegexString(part)}$`;
  }

  protected _transformPartToRegexString(
    part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
  ): string {
    if (!(part instanceof ZodType)) {
      return this._escapeRegExp(part);
    }

    if (part instanceof ZodLiteral) {
      return this._escapeRegExp(part._def.value);
    }

    if (part instanceof ZodString) {
      return this._transformZodStringPartToRegexString(part);
    }

    if (part instanceof ZodEnum || part instanceof ZodNativeEnum) {
      const values =
        part instanceof ZodEnum
          ? part._def.values
          : util.getValidEnumValues(part._def.values);

      return `(${values.map(this._escapeRegExp).join("|")})`;
    }

    if (part instanceof ZodUnion) {
      return `(${(part._def.options as any[])
        .map((option) => this._transformPartToRegexString(option))
        .join("|")})`;
    }

    if (part instanceof ZodNumber) {
      return this._transformZodNumberPartToRegexString(part);
    }

    if (part instanceof ZodOptional) {
      return `(${this._transformPartToRegexString(part.unwrap())})?`;
    }

    if (part instanceof ZodTemplateLiteral) {
      return this._unwrapRegExp(part._def.regexString);
    }

    if (part instanceof ZodBigInt) {
      // FIXME: include/exclude '-' based on min/max values after https://github.com/colinhacks/zod/pull/1711 is merged.
      return "\\-?\\d+";
    }

    if (part instanceof ZodBoolean) {
      return "(true|false)";
    }

    if (part instanceof ZodNullable) {
      do {
        part = part.unwrap();
      } while (part instanceof ZodNullable);

      return `(${this._transformPartToRegexString(part)}|null)${
        part instanceof ZodOptional ? "?" : ""
      }`;
    }

    if (part instanceof ZodBranded) {
      return this._transformPartToRegexString(part.unwrap());
    }

    if (part instanceof ZodAny) {
      return ".*";
    }

    if (part instanceof ZodNull) {
      return "null";
    }

    if (part instanceof ZodUndefined) {
      return "undefined";
    }

    throw new ZodTemplateLiteralUnsupportedTypeError();
  }

  // FIXME: we don't support transformations, so `.trim()` is not supported.
  protected _transformZodStringPartToRegexString(part: ZodString): string {
    let maxLength = Infinity,
      minLength = 0,
      endsWith = "",
      startsWith = "";

    for (const ch of part._def.checks) {
      const regex = this._resolveRegexForStringCheck(ch);

      if (regex) {
        return this._unwrapRegExp(regex);
      }

      if (ch.kind === "endsWith") {
        endsWith = ch.value;
      } else if (ch.kind === "length") {
        minLength = maxLength = ch.value;
      } else if (ch.kind === "max") {
        maxLength = Math.max(0, Math.min(maxLength, ch.value));
      } else if (ch.kind === "min") {
        minLength = Math.max(minLength, ch.value);
      } else if (ch.kind === "startsWith") {
        startsWith = ch.value;
      } else {
        throw new ZodTemplateLiteralUnsupportedCheckError(
          ZodFirstPartyTypeKind.ZodString,
          ch.kind
        );
      }
    }

    const constrainedMinLength = Math.max(
      0,
      minLength - startsWith.length - endsWith.length
    );
    const constrainedMaxLength = Number.isFinite(maxLength)
      ? Math.max(0, maxLength - startsWith.length - endsWith.length)
      : Infinity;

    if (
      constrainedMaxLength === 0 ||
      constrainedMinLength > constrainedMaxLength
    ) {
      return `${startsWith}${endsWith}`;
    }

    return `${startsWith}.${this._resolveRegexWildcardLength(
      constrainedMinLength,
      constrainedMaxLength
    )}${endsWith}`;
  }

  protected _resolveRegexForStringCheck(check: ZodStringCheck): RegExp | null {
    return {
      [check.kind]: null,
      cuid: cuidRegex,
      cuid2: cuid2Regex,
      datetime: check.kind === "datetime" ? datetimeRegex(check) : null,
      email: emailRegex,
      ip:
        check.kind === "ip"
          ? {
              any: new RegExp(
                `^(${this._unwrapRegExp(
                  ipv4Regex.source
                )})|(${this._unwrapRegExp(ipv6Regex.source)})$`
              ),
              v4: ipv4Regex,
              v6: ipv6Regex,
            }[check.version || "any"]
          : null,
      regex: check.kind === "regex" ? check.regex : null,
      ulid: ulidRegex,
      uuid: uuidRegex,
    }[check.kind];
  }

  protected _resolveRegexWildcardLength(
    minLength: number,
    maxLength: number
  ): string {
    if (minLength === maxLength) {
      return minLength === 1 ? "" : `{${minLength}}`;
    }

    if (maxLength !== Infinity) {
      return `{${minLength},${maxLength}}`;
    }

    if (minLength === 0) {
      return "*";
    }

    if (minLength === 1) {
      return "+";
    }

    return `{${minLength},}`;
  }

  // FIXME: we do not support exponent notation (e.g. 2e5) since it conflicts with `.int()`.
  protected _transformZodNumberPartToRegexString(part: ZodNumber): string {
    let canBeNegative = true,
      canBePositive = true,
      min = -Infinity,
      max = Infinity,
      canBeZero = true,
      isFinite = false,
      isInt = false,
      acc = "";

    for (const ch of part._def.checks) {
      if (ch.kind === "finite") {
        isFinite = true;
      } else if (ch.kind === "int") {
        isInt = true;
      } else if (ch.kind === "max") {
        max = Math.min(max, ch.value);

        if (ch.value <= 0) {
          canBePositive = false;

          if (ch.value === 0 && !ch.inclusive) {
            canBeZero = false;
          }
        }
      } else if (ch.kind === "min") {
        min = Math.max(min, ch.value);

        if (ch.value >= 0) {
          canBeNegative = false;

          if (ch.value === 0 && !ch.inclusive) {
            canBeZero = false;
          }
        }
      } else {
        throw new ZodTemplateLiteralUnsupportedCheckError(
          ZodFirstPartyTypeKind.ZodNumber,
          ch.kind
        );
      }
    }

    if (Number.isFinite(min) && Number.isFinite(max)) {
      isFinite = true;
    }

    if (canBeNegative) {
      acc = `${acc}\\-`;

      if (canBePositive) {
        acc = `${acc}?`;
      }
    } else if (!canBePositive) {
      return "0+";
    }

    if (!isFinite) {
      acc = `${acc}(Infinity|(`;
    }

    if (!canBeZero) {
      if (!isInt) {
        acc = `${acc}((\\d*[1-9]\\d*(\\.\\d+)?)|(\\d+\\.\\d*[1-9]\\d*))`;
      } else {
        acc = `${acc}\\d*[1-9]\\d*`;
      }
    } else if (isInt) {
      acc = `${acc}\\d+`;
    } else {
      acc = `${acc}\\d+(\\.\\d+)?`;
    }

    if (!isFinite) {
      acc = `${acc}))`;
    }

    return acc;
  }

  protected _unwrapRegExp(regex: RegExp | string): string {
    const flags = typeof regex === "string" ? "" : regex.flags;
    const source = typeof regex === "string" ? regex : regex.source;

    if (flags.includes("i")) {
      return this._unwrapRegExp(this._makeRegexStringCaseInsensitive(source));
    }

    return source.replace(/(^\^)|(\$$)/g, "");
  }

  protected _makeRegexStringCaseInsensitive(regexString: string): string {
    const isAlphabetic = (char: string) => char.match(/[a-z]/i) != null;

    let caseInsensitive = "";
    let inCharacterSet = false;
    for (let i = 0; i < regexString.length; i++) {
      const char = regexString.charAt(i);
      const nextChar = regexString.charAt(i + 1);

      if (char === "\\") {
        caseInsensitive += `${char}${nextChar}`;
        i++;
        continue;
      }

      if (char === "[") {
        inCharacterSet = true;
      } else if (inCharacterSet && char === "]") {
        inCharacterSet = false;
      }

      if (!isAlphabetic(char)) {
        caseInsensitive += char;
        continue;
      }

      if (!inCharacterSet) {
        caseInsensitive += `[${char.toLowerCase()}${char.toUpperCase()}]`;
        continue;
      }

      const charAfterNext = regexString.charAt(i + 2);

      if (nextChar !== "-" || !isAlphabetic(charAfterNext)) {
        caseInsensitive += `${char.toLowerCase()}${char.toUpperCase()}`;
        continue;
      }

      caseInsensitive += `${char.toLowerCase()}-${charAfterNext.toLowerCase()}${char.toUpperCase()}-${charAfterNext.toUpperCase()}`;
      i += 2;
    }

    return caseInsensitive;
  }

  protected _escapeRegExp(str: unknown): string {
    if (typeof str !== "string") {
      str = `${str}`;
    }

    return (str as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  static create = (
    params?: RawCreateParams & { coerce?: true }
  ): ZodTemplateLiteral => {
    return new ZodTemplateLiteral({
      ...processCreateParams(params),
      coerce: params?.coerce ?? false,
      parts: [],
      regexString: "^$",
      typeName: ZodFirstPartyTypeKind.ZodTemplateLiteral,
    });
  };
}
