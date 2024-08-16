import * as core from "./core.js";
import * as err from "./errors.js";
import * as parse from "./parse.js";
import * as regexes from "./regexes.js";
import * as symbols from "./symbols.js";
import type * as types from "./types.js";
import * as util from "./util.js";

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

type $RefinementCtx = {
  addIssue: (arg: err.IssueData) => void;
};
type $ZodRawShape = { [k: string]: core.$ZodType };
type $Def<T extends object> = types.PickProps<Omit<T, `_${string}`>>;

export type RawCreateParams =
  | {
      error?: err.ZodErrorMap;
      /** @deprecated The `errorMap` parameter has been renamed to simply `error`.
       *
       * @example ```ts
       * z.string().create({ error: myErrorMap });
       * ```
       */
      errorMap?: err.ZodErrorMap;
      /** @deprecated The `invalid_type_error` parameter has been deprecated and will be removed in a future version. Use the `error` field instead.
       *
       * @example ```ts
       * z.string({
       *   error: { invalid_type: 'Custom error message' }
       * });
       * ```
       */
      invalid_type_error?: string;
      /**
       * @deprecated The `required_error` parameter has been deprecated and will be removed in a future version. Use the `error` field instead.
       * @example ```ts
       * z.string({
       *  error: { required: 'Custom error message' }
       * });
       */
      required_error?: string;
      /** @deprecated Use `error` instead. */
      message?: string;
      description?: string;
    }
  | undefined;

export type ProcessedCreateParams = {
  errorMap?: err.ZodErrorMap;
  description?: string | undefined;
};

export function processCreateParams(
  params: RawCreateParams
): ProcessedCreateParams {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    );
  }
  if (errorMap) return { errorMap: errorMap, description };
  const customMap: err.ZodErrorMap = (iss, ctx) => {
    const { message } = params;

    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

export interface Parse<O> {
  (data: unknown, params?: Partial<parse.ParseParams>): O;
  safe(
    input: parse.ParseInput,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O>;
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodString      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export type IpVersion = "v4" | "v6";
export type JwtAlgorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512";

export type $ZodStringCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string }
  | { kind: "length"; value: number; message?: string }
  | { kind: "email"; message?: string }
  | { kind: "url"; message?: string }
  | { kind: "jwt"; alg: JwtAlgorithm | null; message?: string }
  | { kind: "emoji"; message?: string }
  | { kind: "uuid"; message?: string }
  | { kind: "nanoid"; message?: string }
  | { kind: "guid"; message?: string }
  | { kind: "cuid"; message?: string }
  | { kind: "includes"; value: string; position?: number; message?: string }
  | { kind: "cuid2"; message?: string }
  | { kind: "ulid"; message?: string }
  | { kind: "xid"; message?: string }
  | { kind: "ksuid"; message?: string }
  | { kind: "startsWith"; value: string; message?: string }
  | { kind: "endsWith"; value: string; message?: string }
  | { kind: "regex"; regex: RegExp; message?: string }
  | { kind: "trim"; message?: string }
  | { kind: "toLowerCase"; message?: string }
  | { kind: "toUpperCase"; message?: string }
  | {
      kind: "datetime";
      offset: boolean;
      local: boolean;
      precision: number | null;
      message?: string;
    }
  | {
      kind: "date";
      // withDate: true;
      message?: string;
    }
  | {
      kind: "time";
      precision: number | null;
      message?: string;
    }
  | { kind: "duration"; message?: string }
  | { kind: "ip"; version?: IpVersion; message?: string }
  | { kind: "base64"; message?: string }
  | { kind: "json"; message?: string }
  | { kind: "e164"; message?: string };

function isValidIP(ip: string, version?: IpVersion) {
  if ((version === "v4" || !version) && regexes.ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && regexes.ipv6Regex.test(ip)) {
    return true;
  }

  return false;
}

function isValidJwt(token: string, algorithm: JwtAlgorithm | null = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3) {
      return false;
    }

    const [header] = tokensParts;
    const parsedHeader = JSON.parse(atob(header));

    if (!("typ" in parsedHeader) || parsedHeader.typ !== "JWT") {
      return false;
    }

    if (
      algorithm &&
      (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

interface $ZodStringVirtuals extends core.$ZodVirtuals {
  output: string;
  input: unknown;
}
interface $ZodStringDef extends core.$Def<$ZodString> {}

export class $ZodString<
  T extends Partial<$ZodStringVirtuals> = Partial<$ZodStringVirtuals>,
> extends core.$ZodType<T & $ZodStringVirtuals> {
  override type = "string" as const;
  coerce!: boolean;

  constructor(def: $ZodStringDef) {
    super(def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx?: parse.ParseContext
  ): parse.ParseReturnType<string> {
    if (this.coerce) {
      input = String(input) as string;
    }

    if (typeof input !== "string") {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.string,
          received: parse.getParsedType(input),
        },
      ]);
    }

    if (this.checks.length === 0) {
      return input;
    }

    let issues: err.IssueData[] | undefined;

    for (const check of this.checks) {
      check;
      if (check.kind === "min") {
        if (input.length < check.value) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        if (input.length > check.value) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "length") {
        const tooBig = input.length > check.value;
        const tooSmall = input.length < check.value;
        if (tooBig || tooSmall) {
          if (tooBig) {
            issues = issues || [];
            issues.push({
              input,
              code: err.ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message,
            });
          } else if (tooSmall) {
            issues = issues || [];
            issues.push({
              input,
              code: err.ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message,
            });
          }
        }
      } else if (check.kind === "email") {
        if (!regexes.emailRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "email",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "jwt") {
        if (!isValidJwt(input, check.alg)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "jwt",

            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "emoji") {
        if (!regexes.emojiRegex().test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "emoji",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "uuid") {
        if (!regexes.uuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "uuid",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "nanoid") {
        if (!regexes.nanoidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "nanoid",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "guid") {
        if (!regexes.guidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "guid",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "cuid") {
        if (!regexes.cuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "cuid",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "cuid2",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ulid") {
        if (!regexes.ulidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ulid",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "xid") {
        if (!regexes.xidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "xid",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ksuid") {
        if (!regexes.ksuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ksuid",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "url") {
        try {
          const url = new URL(input);

          if (!regexes.hostnameRegex.test(url.hostname)) {
            throw new Error("hostname is invalid");
          }
        } catch {
          issues = issues || [];
          issues.push({
            input,
            validation: "url",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input);
        if (!testResult) {
          issues = issues || [];
          issues.push({
            input,
            validation: "regex",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "trim") {
        input = input.trim();
      } else if (check.kind === "includes") {
        if (!(input as string).includes(check.value, check.position)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message,
          });
        }
      } else if (check.kind === "toLowerCase") {
        input = input.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input = input.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!(input as string).startsWith(check.value)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message,
          });
        }
      } else if (check.kind === "endsWith") {
        if (!(input as string).endsWith(check.value)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message,
          });
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);

        if (!regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message,
          });
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;

        if (!regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message,
          });
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);

        if (!regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message,
          });
        }
      } else if (check.kind === "duration") {
        if (!regexes.durationRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "duration",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input, check.version)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ip",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "base64",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "json") {
        try {
          JSON.parse(input);
        } catch (err) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_string,
            validation: "json",
            message: check.message,
          });
        }
      } else if (check.kind === "e164") {
        if (!e164Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "e164",
            code: err.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues?.length) {
      return new parse.ZodFailure(issues);
    }

    return input;
  }

  protected _regex(
    regex: RegExp,
    validation: err.StringValidation,
    message?: types.ErrMessage
  ): $ZodEffects<this, this["~output"], core.input<this>> {
    return this.refinement(
      (data) => regex.test(data),
      (input) => ({
        input,
        validation,
        code: err.ZodIssueCode.invalid_string,
        ...util.errToObj(message),
      })
    );
  }

  // _addCheck(check: $ZodStringCheck): $ZodString {
  //   return new $ZodString({
  //     ...this,
  //     checks: [...this.checks, check],
  //   });
  // }

  email(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "email", ...util.errToObj(message) });
  }

  url(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "url", ...util.errToObj(message) });
  }

  jwt(options?: string | { alg?: JwtAlgorithm; message?: string }): $ZodString {
    return this._addCheck({
      kind: "jwt",
      alg: typeof options === "object" ? options.alg ?? null : null,
      ...util.errToObj(options),
    });
  }
  emoji(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "emoji", ...util.errToObj(message) });
  }

  uuid(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "uuid", ...util.errToObj(message) });
  }
  nanoid(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "nanoid", ...util.errToObj(message) });
  }
  guid(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "guid", ...util.errToObj(message) });
  }
  cuid(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "cuid", ...util.errToObj(message) });
  }

  cuid2(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "cuid2", ...util.errToObj(message) });
  }
  ulid(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "ulid", ...util.errToObj(message) });
  }
  base64(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "base64", ...util.errToObj(message) });
  }
  xid(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "xid", ...util.errToObj(message) });
  }
  ksuid(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "ksuid", ...util.errToObj(message) });
  }

  ip(
    options?: string | { version?: "v4" | "v6"; message?: string }
  ): $ZodString {
    return this._addCheck({ kind: "ip", ...util.errToObj(options) });
  }

  e164(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "e164", ...util.errToObj(message) });
  }

  datetime(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
          offset?: boolean;
          local?: boolean;
        }
  ): $ZodString {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options,
      });
    }
    return this._addCheck({
      kind: "datetime",

      precision:
        typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...util.errToObj(options?.message),
    });
  }

  date(message?: string): $ZodString {
    return this._addCheck({ kind: "date", message });
  }

  time(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
        }
  ): $ZodString {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options,
      });
    }
    return this._addCheck({
      kind: "time",
      precision:
        typeof options?.precision === "undefined" ? null : options?.precision,
      ...util.errToObj(options?.message),
    });
  }

  duration(message?: types.ErrMessage): $ZodString {
    return this._addCheck({ kind: "duration", ...util.errToObj(message) });
  }

  regex(regex: RegExp, message?: types.ErrMessage): $ZodString {
    return this._addCheck({
      kind: "regex",
      regex: regex,
      ...util.errToObj(message),
    });
  }

  includes(
    value: string,
    options?: { message?: string; position?: number }
  ): $ZodString {
    return this._addCheck({
      kind: "includes",
      value: value,
      position: options?.position,
      ...util.errToObj(options?.message),
    });
  }

  startsWith(value: string, message?: types.ErrMessage): $ZodString {
    return this._addCheck({
      kind: "startsWith",
      value: value,
      ...util.errToObj(message),
    });
  }

  endsWith(value: string, message?: types.ErrMessage): $ZodString {
    return this._addCheck({
      kind: "endsWith",
      value: value,
      ...util.errToObj(message),
    });
  }

  json(message?: types.ErrMessage): this;
  json<T extends $ZodType>(
    pipeTo: T
  ): $ZodPipeline<$ZodEffects<this, any, core.input<this>>, T>;
  json(input?: types.ErrMessage | $ZodType) {
    if (!(input instanceof core.$ZodType)) {
      return this._addCheck({ kind: "json", ...util.errToObj(input) });
    }
    const schema = this.transform((val, ctx) => {
      try {
        return JSON.parse(val);
      } catch (error: unknown) {
        ctx.addIssue({
          input,
          code: err.ZodIssueCode.invalid_string,
          validation: "json",
          // message: (error as Error).message,
        });
        return symbols.NEVER;
      }
    });
    return input ? schema.pipe(input) : schema;
  }

  min(minLength: number, message?: types.ErrMessage): $ZodString {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...util.errToObj(message),
    });
  }

  max(maxLength: number, message?: types.ErrMessage): $ZodString {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...util.errToObj(message),
    });
  }

  length(len: number, message?: types.ErrMessage): $ZodString {
    return this._addCheck({
      kind: "length",
      value: len,
      ...util.errToObj(message),
    });
  }

  /**
   * @deprecated Use z.string().min(1) instead.
   * @see {@link $ZodString.min}
   */
  nonempty(message?: types.ErrMessage): $ZodString {
    return this.min(1, util.errToObj(message));
  }

  trim(): $ZodString {
    return new $ZodString({
      ...this,
      checks: [...this.checks, { kind: "trim" }],
    });
  }

  toLowerCase(): $ZodString {
    return new $ZodString({
      ...this,
      checks: [...this.checks, { kind: "toLowerCase" }],
    });
  }

  toUpperCase(): $ZodString {
    return new $ZodString({
      ...this,
      checks: [...this.checks, { kind: "toUpperCase" }],
    });
  }

  get isDatetime(): boolean {
    return !!this.checks.find((ch) => ch.kind === "datetime");
  }

  get isDate(): boolean {
    return !!this.checks.find((ch) => ch.kind === "date");
  }

  get isTime(): boolean {
    return !!this.checks.find((ch) => ch.kind === "time");
  }
  get isDuration(): boolean {
    return !!this.checks.find((ch) => ch.kind === "duration");
  }

  get isEmail(): boolean {
    return !!this.checks.find((ch) => ch.kind === "email");
  }

  get isURL(): boolean {
    return !!this.checks.find((ch) => ch.kind === "url");
  }
  get isJwt(): boolean {
    return !!this.checks.find((ch) => ch.kind === "jwt");
  }
  get isEmoji(): boolean {
    return !!this.checks.find((ch) => ch.kind === "emoji");
  }

  get isUUID(): boolean {
    return !!this.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID(): boolean {
    return !!this.checks.find((ch) => ch.kind === "nanoid");
  }
  get isGUID(): boolean {
    return !!this.checks.find((ch) => ch.kind === "guid");
  }
  get isCUID(): boolean {
    return !!this.checks.find((ch) => ch.kind === "cuid");
  }

  get isCUID2(): boolean {
    return !!this.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID(): boolean {
    return !!this.checks.find((ch) => ch.kind === "ulid");
  }
  get isXID(): boolean {
    return !!this.checks.find((ch) => ch.kind === "xid");
  }
  get isKSUID(): boolean {
    return !!this.checks.find((ch) => ch.kind === "ksuid");
  }
  get isIP(): boolean {
    return !!this.checks.find((ch) => ch.kind === "ip");
  }
  get isBase64(): boolean {
    return !!this.checks.find((ch) => ch.kind === "base64");
  }
  get isE164(): boolean {
    return !!this.checks.find((ch) => ch.kind === "e164");
  }

  get minLength(): number | null {
    let min: number | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxLength(): number | null {
    let max: number | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }

  static create(params?: RawCreateParams & { coerce?: true }): $ZodString {
    const base = new $ZodString({
      checks: [],
      typeName: $ZodFirstPartyTypeKind.ZodString,
      coerce: params?.coerce ?? false,
      checks: [],
      ...processCreateParams(params),
    });
    return base;
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export type $ZodNumberCheck =
  | { kind: "min"; value: number; inclusive: boolean; message?: string }
  | { kind: "max"; value: number; inclusive: boolean; message?: string }
  | { kind: "int"; message?: string }
  | { kind: "multipleOf"; value: number; message?: string }
  | { kind: "finite"; message?: string };

// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
}

interface $ZodNumberVirtuals extends core.$ZodVirtuals {
  output: number;
  input: unknown;
}
interface $ZodNumberDef extends core.$Def<$ZodString> {}
export class $ZodNumber<
  T extends Partial<$ZodNumberVirtuals> = {},
> extends core.$ZodType<T & core.$ZodVirtuals> {
  override type = "number" as const;
  coerce!: boolean;
  constructor(_def: $ZodNumberDef) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<number> {
    if (this.coerce) {
      input = Number(input);
    }

    if (
      this.checks.length === 0 &&
      typeof input === "number" &&
      !Number.isNaN(input)
    ) {
      return input;
    }

    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.number) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.number,
          received: typeof input,
        },
      ]);
    }

    let issues: err.IssueData[] | undefined;

    for (const check of this.checks) {
      if (check.kind === "int") {
        if (!parse.isInteger(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message,
          });
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? input < check.value
          : input <= check.value;
        if (tooSmall) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? input > check.value
          : input >= check.value;
        if (tooBig) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input, check.value) !== 0) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message,
          });
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: err.ZodIssueCode.not_finite,
            message: check.message,
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues?.length) {
      return new parse.ZodFailure(issues);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): $ZodNumber {
    return new $ZodNumber({
      checks: [],
      typeName: $ZodFirstPartyTypeKind.ZodNumber,
      coerce: params?.coerce || false,
      checks: [],
      ...processCreateParams(params),
    });
  }

  gte(value: number, message?: types.ErrMessage): $ZodNumber {
    return this.setLimit("min", value, true, util.errToString(message));
  }
  min: (value: number, message?: types.ErrMessage) => $ZodNumber = this.gte;

  gt(value: number, message?: types.ErrMessage): $ZodNumber {
    return this.setLimit("min", value, false, util.errToString(message));
  }

  lte(value: number, message?: types.ErrMessage): $ZodNumber {
    return this.setLimit("max", value, true, util.errToString(message));
  }
  max: (value: number, message?: types.ErrMessage) => $ZodNumber = this.lte;

  lt(value: number, message?: types.ErrMessage): $ZodNumber {
    return this.setLimit("max", value, false, util.errToString(message));
  }

  protected setLimit(
    kind: "min" | "max",
    value: number,
    inclusive: boolean,
    message?: string
  ): $ZodNumber {
    return new $ZodNumber({
      ...this,
      checks: [
        ...this.checks,
        {
          kind,
          value,
          inclusive,
          message: util.errToString(message),
        },
      ],
    });
  }

  _addCheck(check: $ZodNumberCheck): $ZodNumber {
    return new $ZodNumber({
      ...this,
      checks: [...this.checks, check],
    });
  }

  int(message?: types.ErrMessage): $ZodNumber {
    return this._addCheck({
      kind: "int",
      message: util.errToString(message),
    });
  }

  positive(message?: types.ErrMessage): $ZodNumber {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: util.errToString(message),
    });
  }

  negative(message?: types.ErrMessage): $ZodNumber {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: util.errToString(message),
    });
  }

  nonpositive(message?: types.ErrMessage): $ZodNumber {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: util.errToString(message),
    });
  }

  nonnegative(message?: ErroM): $ZodNumber {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: util.errToString(message),
    });
  }

  multipleOf(value: number, message?: types.ErrMessage): $ZodNumber {
    return this._addCheck({
      kind: "multipleOf",
      value: value,
      message: util.errToString(message),
    });
  }
  step: (value: number, message?: types.ErrMessage) => $ZodNumber =
    this.multipleOf;

  finite(message?: types.ErrMessage): $ZodNumber {
    return this._addCheck({
      kind: "finite",
      message: util.errToString(message),
    });
  }

  safe(message?: types.ErrMessage): $ZodNumber {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: util.errToString(message),
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: util.errToString(message),
    });
  }

  get minValue(): number | null {
    let min: number | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxValue(): number | null {
    let max: number | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }

  get isInt(): boolean {
    return !!this.checks.find(
      (ch) =>
        ch.kind === "int" ||
        (ch.kind === "multipleOf" && parse.isInteger(ch.value))
    );
  }

  get isFinite(): boolean {
    let max: number | null = null;
    let min: number | null = null;
    for (const ch of this.checks) {
      if (
        ch.kind === "finite" ||
        ch.kind === "int" ||
        ch.kind === "multipleOf"
      ) {
        return true;
      }
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodBigInt      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export type $ZodBigIntCheck =
  | { kind: "min"; value: bigint; inclusive: boolean; message?: string }
  | { kind: "max"; value: bigint; inclusive: boolean; message?: string }
  | { kind: "multipleOf"; value: bigint; message?: string };

// export type $ZodBigIntDef = core.$Def<$ZodBigInt>;

interface $ZodBigIntVirtuals extends core.$ZodVirtuals {
  output: bigint;
  input: unknown;
}
interface $ZodBigIntDef extends core.$Def<$ZodBigInt> {}
export class $ZodBigInt<
  T extends Partial<$ZodBigIntVirtuals> = {},
> extends core.$ZodType<T & core.$ZodVirtuals> {
  override type = "bigint" as const;
  coerce!: boolean;
  constructor(def: $ZodBigIntDef) {
    super(def);
  }

  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<bigint> {
    if (this.coerce) {
      input = BigInt(input);
    }
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.bigint) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.bigint,
          received: parsedType,
        },
      ]);
    }

    const issues: err.IssueData[] = [];

    for (const check of this.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? input < check.value
          : input <= check.value;
        if (tooSmall) {
          issues.push({
            input,
            code: err.ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? input > check.value
          : input >= check.value;
        if (tooBig) {
          issues.push({
            input,
            code: err.ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message,
          });
        }
      } else if (check.kind === "multipleOf") {
        if (input % check.value !== BigInt(0)) {
          issues.push({
            input,
            code: err.ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message,
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues.length) {
      return new parse.ZodFailure(issues);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): $ZodBigInt {
    return new $ZodBigInt({
      checks: [],
      typeName: $ZodFirstPartyTypeKind.ZodBigInt,
      coerce: params?.coerce ?? false,
      ...processCreateParams(params),
    });
  }

  gte(value: bigint, message?: types.ErrMessage): $ZodBigInt {
    return this.setLimit("min", value, true, util.errToString(message));
  }
  min: (value: bigint, message?: types.ErrMessage) => $ZodBigInt = this.gte;

  gt(value: bigint, message?: types.ErrMessage): $ZodBigInt {
    return this.setLimit("min", value, false, util.errToString(message));
  }

  lte(value: bigint, message?: types.ErrMessage): $ZodBigInt {
    return this.setLimit("max", value, true, util.errToString(message));
  }
  max: (value: bigint, message?: types.ErrMessage) => $ZodBigInt = this.lte;

  lt(value: bigint, message?: types.ErrMessage): $ZodBigInt {
    return this.setLimit("max", value, false, util.errToString(message));
  }

  protected setLimit(
    kind: "min" | "max",
    value: bigint,
    inclusive: boolean,
    message?: string
  ): $ZodBigInt {
    return new $ZodBigInt({
      ...this,
      checks: [
        ...this.checks,
        {
          kind,
          value,
          inclusive,
          message: util.errToString(message),
        },
      ],
    });
  }

  _addCheck(check: $ZodBigIntCheck): $ZodBigInt {
    return new $ZodBigInt({
      ...this,
      checks: [...this.checks, check],
    });
  }

  positive(message?: types.ErrMessage): $ZodBigInt {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: util.errToString(message),
    });
  }

  negative(message?: types.ErrMessage): $ZodBigInt {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: util.errToString(message),
    });
  }

  nonpositive(message?: types.ErrMessage): $ZodBigInt {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: util.errToString(message),
    });
  }

  nonnegative(message?: types.ErrMessage): $ZodBigInt {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: util.errToString(message),
    });
  }

  multipleOf(value: bigint, message?: types.ErrMessage): $ZodBigInt {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: util.errToString(message),
    });
  }

  get minValue(): bigint | null {
    let min: bigint | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxValue(): bigint | null {
    let max: bigint | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                     ///////////
//////////      $ZodBoolean      //////////
//////////                     ///////////
//////////////////////////////////////////
//////////////////////////////////////////
export type $ZodBooleanDef = core.$Def<$ZodBoolean>;

export class $ZodBoolean extends core.$ZodType<boolean, boolean> {
  override typeName: $ZodFirstPartyTypeKind.ZodBoolean;
  coerce: boolean;
  constructor(_def: core.$Def<$ZodBoolean>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<boolean> {
    if (this.coerce) {
      input = Boolean(input);
    }
    const parsedType = parse.getParsedType(input);

    if (parsedType !== parse.ZodParsedType.boolean) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.boolean,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): $ZodBoolean {
    return new $ZodBoolean({
      typeName: $ZodFirstPartyTypeKind.ZodBoolean,
      coerce: params?.coerce || false,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                     ////////
//////////      $ZodDate        ////////
//////////                     ////////
///////////////////////////////////////
///////////////////////////////////////
export type $ZodDateCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string };
export type $ZodDateDef = core.$Def<$ZodDate>;

export class $ZodDate extends core.$ZodType<Date, Date> {
  coerce: boolean;
  override typeName: $ZodFirstPartyTypeKind.ZodDate;
  constructor(_def: core.$Def<$ZodDate>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (this.coerce) {
      input = new Date(input);
    }
    const parsedType = parse.getParsedType(input);

    if (parsedType !== parse.ZodParsedType.date) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.date,
          received: parsedType,
        },
      ]);
    }

    if (Number.isNaN(input.getTime())) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_date,
        },
      ]);
    }

    const issues: err.IssueData[] = [];

    for (const check of this.checks) {
      if (check.kind === "min") {
        if (input.getTime() < check.value) {
          issues.push({
            input,
            code: err.ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date",
          });
        }
      } else if (check.kind === "max") {
        if (input.getTime() > check.value) {
          issues.push({
            input,
            code: err.ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date",
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues.length) {
      return new parse.ZodFailure(issues);
    }

    return new Date(input.getTime());
  }

  _addCheck(check: $ZodDateCheck): $ZodDate {
    return new $ZodDate({
      ...this,
      checks: [...this.checks, check],
    });
  }

  min(minDate: Date, message?: types.ErrMessage): $ZodDate {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: util.errToString(message),
    });
  }

  max(maxDate: Date, message?: types.ErrMessage): $ZodDate {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: util.errToString(message),
    });
  }

  get minDate(): Date | null {
    let min: number | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }

    return min != null ? new Date(min) : null;
  }

  get maxDate(): Date | null {
    let max: number | null = null;
    for (const ch of this.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }

    return max != null ? new Date(max) : null;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): $ZodDate {
    return new $ZodDate({
      checks: [],
      coerce: params?.coerce || false,
      typeName: $ZodFirstPartyTypeKind.ZodDate,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       $ZodSymbol        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export class $ZodSymbol extends core.$ZodType<symbol, symbol> {
  override typeName: $ZodFirstPartyTypeKind.ZodSymbol;
  constructor(_def: core.$Def<$ZodSymbol>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.symbol) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.symbol,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams): $ZodSymbol {
    return new $ZodSymbol({
      typeName: $ZodFirstPartyTypeKind.ZodSymbol,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodUndefined      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////

export class $ZodUndefined extends core.$ZodType<undefined, undefined> {
  override typeName: $ZodFirstPartyTypeKind.ZodUndefined;

  constructor(_def: core.$Def<$ZodUndefined>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.undefined) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.undefined,
          received: parsedType,
        },
      ]);
    }
    return input;
  }
  params?: RawCreateParams;

  static create(params?: RawCreateParams): $ZodUndefined {
    return new $ZodUndefined({
      typeName: $ZodFirstPartyTypeKind.ZodUndefined,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodNull      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export class $ZodNull extends core.$ZodType<null, null> {
  override typeName: $ZodFirstPartyTypeKind.ZodNull;
  constructor(_def: core.$Def<$ZodNull>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.null) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.null,
          received: parsedType,
        },
      ]);
    }
    return input;
  }
  static create(params?: RawCreateParams): $ZodNull {
    return new $ZodNull({
      typeName: $ZodFirstPartyTypeKind.ZodNull,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      $ZodAny      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////
export class $ZodAny extends core.$ZodType<any, any> {
  override typeName: $ZodFirstPartyTypeKind.ZodAny;
  constructor(_def: core.$Def<$ZodAny>) {
    super(_def);
  }
  // to prevent instances of other classes from extending $ZodAny. this causes issues with catchall in $ZodObject.
  _any = true as const;
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    return input;
  }
  static create(params?: RawCreateParams): $ZodAny {
    return new $ZodAny({
      typeName: $ZodFirstPartyTypeKind.ZodAny,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodUnknown      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export class $ZodUnknown extends core.$ZodType<unknown, unknown> {
  override typeName: $ZodFirstPartyTypeKind.ZodUnknown;
  constructor(_def: core.$Def<$ZodUnknown>) {
    super(_def);
  }
  // required
  _unknown = true as const;
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    return input;
  }

  static create(params?: RawCreateParams): $ZodUnknown {
    return new $ZodUnknown({
      typeName: $ZodFirstPartyTypeKind.ZodUnknown,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodNever      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export class $ZodNever extends core.$ZodType<never, never> {
  override typeName: $ZodFirstPartyTypeKind.ZodNever;

  constructor(_def: core.$Def<$ZodNever>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    return new parse.ZodFailure([
      {
        input,
        code: err.ZodIssueCode.invalid_type,
        expected: parse.ZodParsedType.never,
        received: parsedType,
      },
    ]);
  }
  static create(params?: RawCreateParams): $ZodNever {
    return new $ZodNever({
      typeName: $ZodFirstPartyTypeKind.ZodNever,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodVoid      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export class $ZodVoid extends core.$ZodType<void, void> {
  override typeName: $ZodFirstPartyTypeKind.ZodVoid;

  constructor(_def: core.$Def<$ZodVoid>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.undefined) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.void,
          received: parsedType,
        },
      ]);
    }
    return input;
  }

  static create(params?: RawCreateParams): $ZodVoid {
    return new $ZodVoid({
      typeName: $ZodFirstPartyTypeKind.ZodVoid,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodArray      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
// export interface $ZodArrayDef<T extends $ZodType = $ZodType> {
//   type: T;
//   typeName: $ZodFirstPartyTypeKind.ZodArray;
//   exactLength: { value: number; message?: string } | null;
//   minLength: { value: number; message?: string } | null;
//   maxLength: { value: number; message?: string } | null;
//   uniqueness: {
//     identifier?: <U extends T["~output"]>(item: U) => unknown;
//     message?:
//       | string
//       | (<U extends T["~output"]>(duplicateItems: U[]) => string);
//     showDuplicates?: boolean;
//   } | null;
// }

export type ArrayCardinality = "many" | "atleastone";
export type arrayOutputType<
  T extends $ZodType,
  Cardinality extends ArrayCardinality = "many",
> = Cardinality extends "atleastone"
  ? [T["~output"], ...T["~output"][]]
  : T["~output"][];

export class $ZodArray<
  T extends $ZodType = $ZodType,
  Cardinality extends ArrayCardinality = ArrayCardinality,
> extends core.$ZodType<
  arrayOutputType<T, Cardinality>,
  Cardinality extends "atleastone"
    ? [core.input<T>, ...core.input<T>[]]
    : core.input<T>[]
> {
  override typeName: $ZodFirstPartyTypeKind.ZodArray;
  type: T;
  exactLength: { value: number; message?: string } | null;
  minLength: { value: number; message?: string } | null;
  maxLength: { value: number; message?: string } | null;
  uniqueness: {
    identifier?: <U extends T["~output"]>(item: U) => unknown;
    message?:
      | string
      | (<U extends T["~output"]>(duplicateItems: U[]) => string);
    showDuplicates?: boolean;
  } | null;

  constructor(_def: core.$Def<$ZodArray>) {
    super(_def);
  }
  override "~omit": "element";
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);

    if (parsedType !== parse.ZodParsedType.array) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.array,
          received: parsedType,
        },
      ]);
    }

    const issues: err.IssueData[] = [];

    if (this.exactLength !== null) {
      const tooBig = input.length > this.exactLength.value;
      const tooSmall = input.length < this.exactLength.value;
      if (tooBig || tooSmall) {
        issues.push({
          input,
          code: tooBig ? err.ZodIssueCode.too_big : err.ZodIssueCode.too_small,
          minimum: (tooSmall ? this.exactLength.value : undefined) as number,
          maximum: (tooBig ? this.exactLength.value : undefined) as number,
          type: "array",
          inclusive: true,
          exact: true,
          message: this.exactLength.message,
        });
      }
    }

    if (this.minLength !== null) {
      if (input.length < this.minLength.value) {
        issues.push({
          input,
          code: err.ZodIssueCode.too_small,
          minimum: this.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: this.minLength.message,
        });
      }
    }

    if (this.maxLength !== null) {
      if (input.length > this.maxLength.value) {
        issues.push({
          input,
          code: err.ZodIssueCode.too_big,
          maximum: this.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: this.maxLength.message,
        });
      }
    }

    if (this.uniqueness !== null) {
      const { identifier, message, showDuplicates } = this.uniqueness;
      const duplicates = (
        identifier
          ? (input as this["~output"][]).map(identifier)
          : (input as this["~output"][])
      ).filter((item, idx, arr) => arr.indexOf(item) !== idx);
      if (duplicates.length) {
        issues.push({
          input,
          code: err.ZodIssueCode.not_unique,
          duplicates: showDuplicates ? duplicates : undefined,
          message:
            typeof message === "function" ? message(duplicates) : message,
        });
      }
    }

    let hasPromises = false;

    const parseResults = [...(input as any[])].map((item) => {
      const result = this.type["~parse"](item, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(parseResults).then((result) => {
        issues.push(
          ...result.flatMap((r, i) =>
            parse.isAborted(r)
              ? r.issues.map((issue) => ({
                  ...issue,
                  path: [i, ...(issue.path || [])],
                }))
              : []
          )
        );

        if (issues.length > 0) {
          return new parse.ZodFailure(issues);
        }

        return result.map((x) => x as any) as any;
      });
    }

    const results = parseResults as parse.SyncParseReturnType<any>[];
    // we know it's sync because hasPromises is false

    issues.push(
      ...results.flatMap((r, i) =>
        !parse.isAborted(r)
          ? []
          : r.issues.map((issue) => ({
              ...issue,
              path: [i, ...(issue.path || [])],
            }))
      )
    );

    if (issues.length > 0) {
      return new parse.ZodFailure(issues);
    }

    return results.map((x) => x as any) as any;
  }

  get element(): T {
    return this.type;
  }

  min(minLength: number, message?: types.ErrMessage): this {
    return new $ZodArray({
      ...this,
      minLength: { value: minLength, message: util.errToString(message) },
    }) as any;
  }

  max(maxLength: number, message?: types.ErrMessage): this {
    return new $ZodArray({
      ...this,
      maxLength: { value: maxLength, message: util.errToString(message) },
    }) as any;
  }

  length(len: number, message?: types.ErrMessage): this {
    return new $ZodArray({
      ...this,
      exactLength: { value: len, message: util.errToString(message) },
    }) as any;
  }

  nonempty(message?: types.ErrMessage): $ZodArray<T, "atleastone"> {
    return this.min(1, message) as any;
  }

  unique(params: $ZodArray["uniqueness"] = {}): this {
    const message =
      typeof params?.message === "function"
        ? params.message
        : util.errToString(params?.message);

    return new $ZodArray({
      ...this,
      uniqueness: { ...params, message },
    }) as any;
  }

  static create<T extends $ZodType>(
    schema: T,
    params?: RawCreateParams
  ): $ZodArray<T> {
    return new $ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      exactLength: null,
      uniqueness: null,
      typeName: $ZodFirstPartyTypeKind.ZodArray,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

export type $ZodNonEmptyArray<T extends $ZodType> = $ZodArray<T, "atleastone">;

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodObject      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

export type mergeTypes<A, B> = {
  [k in keyof A | keyof B]: k extends keyof B
    ? B[k]
    : k extends keyof A
      ? A[k]
      : never;
};

export type objectOutputType<
  Shape extends $ZodRawShape,
  Catchall extends $ZodType,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
> = types.flatten<types.addQuestionMarks<baseObjectOutputType<Shape>>> &
  CatchallOutput<Catchall> &
  PassthroughType<UnknownKeys>;

export type baseObjectOutputType<Shape extends $ZodRawShape> = {
  [k in keyof Shape]: Shape[k]["~output"];
};

export type objectInputType<
  Shape extends $ZodRawShape,
  Catchall extends $ZodType,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
> = types.flatten<baseObjectInputType<Shape>> &
  CatchallInput<Catchall> &
  PassthroughType<UnknownKeys>;
export type baseObjectInputType<Shape extends $ZodRawShape> =
  types.addQuestionMarks<{
    [k in keyof Shape]: core.input<Shape[k]>;
  }>;

export type CatchallOutput<T extends $ZodType> = core.$ZodType extends T
  ? unknown
  : { [k: string]: T["~output"] };

export type CatchallInput<T extends $ZodType> = core.$ZodType extends T
  ? unknown
  : { [k: string]: core.input<T> };

export type PassthroughType<T extends UnknownKeysParam> =
  T extends "passthrough" ? { [k: string]: unknown } : unknown;

export type deoptional<T extends $ZodType> = T extends $ZodOptional<infer U>
  ? deoptional<U>
  : T extends $ZodNullable<infer U>
    ? $ZodNullable<deoptional<U>>
    : T;

export type SomeZodObject = $ZodObject<
  $ZodRawShape,
  UnknownKeysParam,
  $ZodType
>;

export type noUnrecognized<Obj extends object, Shape extends object> = {
  [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never;
};

// function deepPartialify(schema: $ZodType): any {
//   if (schema instanceof $ZodObject) {
//     const newShape: any = {};

//     for (const key in schema.shape) {
//       const fieldSchema = schema.shape[key];
//       newShape[key] = $ZodOptional.create(deepPartialify(fieldSchema));
//     }
//     const clone = schema["~clone"]();
//     clone.shape = () => newShape;
//     return clone;
//     // return new $ZodObject({
//     //   ...schema._def,
//     //   shape: () => newShape,
//     // }) as any;
//   }
//   if (schema instanceof $ZodArray) {
//     const clone = schema["~clone"]()
//     clone.type= deepPartialify(schema.element);
//     return clone;
//     // return new $ZodArray({
//     //   ...schema._def,
//     //   type: deepPartialify(schema.element),
//     // });
//   }
//   if (schema instanceof $ZodOptional) {
//     return $ZodOptional.create(deepPartialify(schema.unwrap()));
//   }
//   if (schema instanceof $ZodNullable) {
//     return $ZodNullable.create(deepPartialify(schema.unwrap()));
//   }
//   if (schema instanceof $ZodTuple) {
//     return $ZodTuple.create(
//       schema.items.map((item: any) => deepPartialify(item))
//     );
//   }
//   return schema;
// }

export class $ZodObject<
  T extends $ZodRawShape = $ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends $ZodType = $ZodType,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>,
> extends core.$ZodType<Output, Input> {
  override typeName: $ZodFirstPartyTypeKind.ZodObject;
  shape: T;
  catchall: Catchall;
  unknownKeys: UnknownKeys;
  constructor(_def: core.$Def<$ZodObject>) {
    super(_def);
  }
  private _cached = util.makeCache(this, {
    shape() {
      return this.shape;
    },
    keys() {
      return Object.keys(this.shape);
    },
    keyset() {
      return new Set(Object.keys(this.shape));
    },
  });

  "~parse"(
    input: parse.ParseInput,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.object) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const issues: err.IssueData[] = [];
    const extraKeys: string[] = [];

    if (!(this.catchall instanceof $ZodNever && this.unknownKeys === "strip")) {
      for (const key in input) {
        if (!this._cached.keys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }

    const final: any = {};

    const asyncResults: Array<{
      key: string;
      promise: parse.AsyncParseReturnType<unknown>;
    }> = [];

    for (const key of this._cached.keys) {
      const keyValidator = this._cached.shape[key];
      const value = input[key];
      const parseResult = keyValidator["~parse"](value, ctx);
      if (parseResult instanceof Promise) {
        asyncResults.push({ key, promise: parseResult });
      } else if (parse.isAborted(parseResult)) {
        issues.push(
          ...parseResult.issues.map((issue) => ({
            ...issue,
            path: [key, ...(issue.path || [])],
          }))
        );
      } else {
        if (
          key in input ||
          keyValidator instanceof $ZodDefault ||
          keyValidator instanceof $ZodCatch
        ) {
          final[key] = parseResult;
        }
      }
    }

    if (this.catchall instanceof $ZodNever) {
      const unknownKeys = this.unknownKeys;

      if (unknownKeys === "passthrough") {
        for (const extraKey of extraKeys) {
          if (extraKey === "__proto__") continue;
          final[extraKey] = input[extraKey];
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          issues.push({
            input,
            code: err.ZodIssueCode.unrecognized_keys,
            keys: extraKeys,
          });
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(
          `Internal $ZodObject error: invalid unknownKeys value.`
        );
      }
    } else {
      // run catchall validation
      const catchall = this.catchall;

      for (const key of extraKeys) {
        const value = input[key];
        const parseResult = catchall["~parse"](value, ctx);
        if (parseResult instanceof Promise) {
          asyncResults.push({ key, promise: parseResult });
        } else if (parse.isAborted(parseResult)) {
          issues.push(
            ...parseResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        } else {
          if (
            key in input ||
            catchall instanceof $ZodDefault ||
            catchall instanceof $ZodCatch
          ) {
            final[key] = parseResult;
          }
        }
      }
    }

    if (asyncResults.length) {
      return Promise.resolve()
        .then(async () => {
          for (const asyncResult of asyncResults) {
            const result = await asyncResult.promise;
            if (parse.isAborted(result)) {
              issues.push(
                ...result.issues.map((issue) => ({
                  ...issue,
                  path: [asyncResult.key, ...(issue.path || [])],
                }))
              );
            } else {
              if (asyncResult.key in input) {
                final[asyncResult.key] = result;
              }
            }
          }
        })
        .then(() => {
          if (issues.length) {
            return new parse.ZodFailure(issues);
          }

          return final;
        });
    }

    if (issues.length) {
      return new parse.ZodFailure(issues);
    }

    return final;
  }
  strict(message?: types.ErrMessage): $ZodObject<T, "strict", Catchall> {
    util.errToObj;
    return new $ZodObject({
      ...this,
      unknownKeys: "strict",

      ...(message !== undefined
        ? {
            errorMap: (issue, ctx) => {
              const defaultError =
                this.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: util.errToObj(message).message ?? defaultError,
                };
              return {
                message: defaultError,
              };
            },
          }
        : {}),
    }) as any;
  }

  strip(): $ZodObject<T, "strip", Catchall> {
    return new $ZodObject({
      ...this,
      unknownKeys: "strip",
    }) as any;
  }

  passthrough(): $ZodObject<T, "passthrough", Catchall> {
    return new $ZodObject({
      ...this,
      unknownKeys: "passthrough",
    }) as any;
  }

  /**
   * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
   * If you want to pass through unknown properties, use `.passthrough()` instead.
   */
  nonstrict: () => $ZodObject<T, "passthrough", Catchall> = this.passthrough;

  // const AugmentFactory =
  //   <Def extends $ZodObjectDef>(def: Def) =>
  //   <Augmentation extends $ZodRawShape>(
  //     augmentation: Augmentation
  //   ): $ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new $ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape,
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend<Augmentation extends $ZodRawShape>(
    augmentation: Augmentation & Partial<{ [k in keyof T]: unknown }>
  ): $ZodObject<core.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  extend<Augmentation extends $ZodRawShape>(
    augmentation: Augmentation
  ): $ZodObject<core.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  extend(augmentation: $ZodRawShape) {
    return new $ZodObject({
      ...this,
      shape: () => ({
        ...this.shape,
        ...augmentation,
      }),
    }) as any;
  }
  // extend<
  //   Augmentation extends $ZodRawShape,
  //   NewOutput extends types.flatten<{
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["~output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   }>,
  //   NewInput extends types.flatten<{
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? core.input<Augmentation[k]>
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }>
  // >(
  //   augmentation: Augmentation
  // ): $ZodObject<
  //   extendShape<T, Augmentation>,
  //   UnknownKeys,
  //   Catchall,
  //   NewOutput,
  //   NewInput
  // > {
  //   return new $ZodObject({
  //     ...this,
  //     shape: () => ({
  //       ...this.shape,
  //       ...augmentation,
  //     }),
  //   }) as any;
  // }

  /**
   * @deprecated Use `.extend` instead
   *  */
  augment: (typeof this)["extend"] = this.extend;

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge<Incoming extends AnyZodObject, Augmentation extends Incoming["shape"]>(
    merging: Incoming
  ): $ZodObject<
    types.extendShape<T, Augmentation>,
    Incoming["_def"]["unknownKeys"],
    Incoming["_def"]["catchall"]
  > {
    const merged: any = new $ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this.shape,
        ...merging._def.shape,
      }),
      typeName: $ZodFirstPartyTypeKind.ZodObject,
    }) as any;
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["~output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? core.input<Augmentation[k]>
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): $ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new $ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       core.mergeShapes(this.shape, merging._def.shape),
  //     typeName: $ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }

  setKey<Key extends string, Schema extends $ZodType>(
    key: Key,
    schema: Schema
  ): $ZodObject<T & { [k in Key]: Schema }, UnknownKeys, Catchall> {
    return this.augment({ [key]: schema }) as any;
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // $ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = core.mergeShapes(
  //   //   this.shape,
  //   //   merging._def.shape
  //   // );
  //   const merged: any = new $ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       core.mergeShapes(this.shape, merging._def.shape),
  //     typeName: $ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }

  pick<Mask extends types.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): $ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall> {
    const shape: any = {};

    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }

    return new $ZodObject({
      ...this,
      shape: () => shape,
    }) as any;
  }

  omit<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): $ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall> {
    const shape: any = {};

    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }

    return new $ZodObject({
      ...this,
      shape: () => shape,
    }) as any;
  }

  /**
   * @deprecated
   */
  // deepPartial(): core.DeepPartial<this> {
  //   return deepPartialify(this) as any;
  // }

  partial(): $ZodObject<
    { [k in keyof T]: $ZodOptional<T[k]> },
    UnknownKeys,
    Catchall
  >;

  partial<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): $ZodObject<
    core.noNever<{
      [k in keyof T]: k extends keyof Mask ? $ZodOptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  partial(mask?: any) {
    const newShape: any = {};

    // util.objectKeys(this.shape).forEach((key) => {
    //   const fieldSchema = this.shape[key];

    //   if (mask && !mask[key]) {
    //     newShape[key] = fieldSchema;
    //   } else {
    //     newShape[key] = fieldSchema.optional();
    //   }
    // });

    // rewrite to use for of
    for (const key of this._cached.keys) {
      const fieldSchema = this.shape[key];

      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }

    return new $ZodObject({
      ...this,
      shape: () => newShape,
    }) as any;
  }

  required(): $ZodObject<
    { [k in keyof T]: deoptional<T[k]> },
    UnknownKeys,
    Catchall
  >;
  required<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): $ZodObject<
    core.noNever<{
      [k in keyof T]: k extends keyof Mask ? deoptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  required(mask?: any) {
    const newShape: any = {};
    for (const key of this._cached.keys) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;

        while (newField instanceof $ZodOptional) {
          newField = (newField as $ZodOptional<any>)._def.innerType;
        }

        newShape[key] = newField;
      }
    }

    return new $ZodObject({
      ...this,
      shape: () => newShape,
    }) as any;
  }

  keyof(): $ZodEnum<core.UnionToTupleString<keyof T>> {
    return $ZodEnum.create(
      util.objectKeys(this.shape) as [string, ...string[]]
    ) as any;
  }

  static create<T extends $ZodRawShape>(
    shape: T,
    params?: RawCreateParams
  ): $ZodObject<
    T,
    "strip",
    $ZodType,
    objectOutputType<T, $ZodType, "strip">,
    objectInputType<T, $ZodType, "strip">
  > {
    return new $ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: $ZodNever.create(),
      typeName: $ZodFirstPartyTypeKind.ZodObject,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }

  static strictCreate<T extends $ZodRawShape>(
    shape: T,
    params?: RawCreateParams
  ): $ZodObject<T, "strict"> {
    return new $ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: $ZodNever.create(),
      typeName: $ZodFirstPartyTypeKind.ZodObject,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }

  static lazycreate<T extends $ZodRawShape>(
    shape: () => T,
    params?: RawCreateParams
  ): $ZodObject<T, "strip"> {
    return new $ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: $ZodNever.create(),
      typeName: $ZodFirstPartyTypeKind.ZodObject,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

export type AnyZodObject = $ZodObject<any, any, any>;

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodUnion      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export type $ZodUnionOptions = Readonly<[$ZodType, ...$ZodType[]]>;
export class $ZodUnion<
  T extends $ZodUnionOptions = $ZodUnionOptions,
> extends core.$ZodType<T[number]["~output"], core.input<T[number]>> {
  override typeName: $ZodFirstPartyTypeKind.ZodUnion;
  options: T;
  constructor(_def: core.$Def<$ZodUnion>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const options = this.options;

    function handleResults(results: parse.SyncParseReturnType<any>[]) {
      // return first issue-free validation if it exists
      for (const result of results) {
        if (parse.isValid(result)) {
          return result;
        }
      }

      const unionErrors: err.ZodError[] = [];

      for (const result of results) {
        if (parse.isAborted(result)) {
          unionErrors.push(
            new err.ZodError(
              result.issues.map((issue) => err.makeIssue(issue, ctx))
            )
          );
        }
      }

      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_union,
          unionErrors,
        },
      ]);
    }

    let hasPromises = false;
    const parseResults = options.map((option) => {
      const result = option["~parse"](input, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(parseResults).then(handleResults);
    }
    const issues: err.ZodIssue[][] = [];
    for (const result of parseResults as parse.SyncParseReturnType<any>[]) {
      // we know it's sync because hasPromises is false
      if (!parse.isAborted(result)) {
        return result;
      }

      issues.push(result.issues.map((issue) => err.makeIssue(issue, ctx)));
    }

    const unionErrors = issues.map((issues) => new err.ZodError(issues));

    return new parse.ZodFailure([
      {
        input,
        code: err.ZodIssueCode.invalid_union,
        unionErrors,
      },
    ]);
  }

  static create<T extends Readonly<[$ZodType, $ZodType, ...$ZodType[]]>>(
    types: T,
    params?: RawCreateParams
  ): $ZodUnion<T> {
    return new $ZodUnion({
      options: types,
      typeName: $ZodFirstPartyTypeKind.ZodUnion,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      $ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

const getDiscriminator = <T extends $ZodType>(type: T): types.Primitive[] => {
  if (type instanceof $ZodLazy) {
    return getDiscriminator(type.schema);
  }
  if (type instanceof $ZodEffects) {
    return getDiscriminator(type.innerType());
  }
  if (type instanceof $ZodLiteral) {
    return [type.value];
  }
  if (type instanceof $ZodEnum) {
    return type.options;
  }
  if (type instanceof $ZodNativeEnum) {
    return util.objectValues(type.enum as any);
  }
  if (type instanceof $ZodDefault) {
    return getDiscriminator(type._def.innerType);
  }
  if (type instanceof $ZodUndefined) {
    return [undefined];
  }
  if (type instanceof $ZodNull) {
    return [null];
  }
  if (type instanceof $ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  }
  if (type instanceof $ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  }
  if (type instanceof $ZodBranded) {
    return getDiscriminator(type.unwrap());
  }
  if (type instanceof $ZodReadonly) {
    return getDiscriminator(type.unwrap());
  }
  if (type instanceof $ZodCatch) {
    return getDiscriminator(type._def.innerType);
  }
  return [];
};

export type $ZodDiscriminatedUnionOption<Discriminator extends string> =
  $ZodObject<
    { [key in Discriminator]: $ZodType } & $ZodRawShape,
    UnknownKeysParam,
    $ZodType
  >;

export class $ZodDiscriminatedUnion<
  Discriminator extends string = string,
  Options extends
    $ZodDiscriminatedUnionOption<Discriminator>[] = $ZodDiscriminatedUnionOption<Discriminator>[],
> extends core.$ZodType<
  core.output<Options[number]>,
  core.input<Options[number]>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
  discriminator: Discriminator;
  options: Options;
  optionsMap: Map<types.Primitive, $ZodDiscriminatedUnionOption<any>>;

  constructor(_def: core.$Def<$ZodDiscriminatedUnion>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);

    if (parsedType !== parse.ZodParsedType.object) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const discriminator = this.discriminator;
    const discriminatorValue: string = input[discriminator];
    const option = this.optionsMap.get(discriminatorValue);

    if (!option) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [discriminator],
        },
      ]);
    }

    return option["~parse"](input, ctx) as any;
  }

  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create<
    Discriminator extends string,
    Types extends [
      $ZodDiscriminatedUnionOption<Discriminator>,
      ...$ZodDiscriminatedUnionOption<Discriminator>[],
    ],
  >(
    discriminator: Discriminator,
    options: Types,
    params?: RawCreateParams
  ): $ZodDiscriminatedUnion<Discriminator, Types> {
    // Get all the valid discriminator values
    const optionsMap: Map<types.Primitive, Types[number]> = new Map();

    // try {
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(
          `A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`
        );
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(
            `Discriminator property ${String(
              discriminator
            )} has duplicate value ${String(value)}`
          );
        }

        optionsMap.set(value, type);
      }
    }

    return new $ZodDiscriminatedUnion<
      Discriminator,
      // DiscriminatorValue,
      Types
    >({
      typeName: $ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////////////
///////////////////////////////////////////////
//////////                           //////////
//////////      $ZodIntersection      //////////
//////////                           //////////
///////////////////////////////////////////////
///////////////////////////////////////////////

function mergeValues(
  a: any,
  b: any
):
  | { valid: true; data: any }
  | { valid: false; mergeErrorPath: (string | number)[] } {
  const aType = parse.getParsedType(a);
  const bType = parse.getParsedType(b);

  if (a === b) {
    return { valid: true, data: a };
  }
  if (
    aType === parse.ZodParsedType.object &&
    bType === parse.ZodParsedType.object
  ) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util
      .objectKeys(a)
      .filter((key) => bKeys.indexOf(key) !== -1);

    const newObj: any = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
        };
      }
      newObj[key] = sharedValue.data;
    }

    return { valid: true, data: newObj };
  }
  if (
    aType === parse.ZodParsedType.array &&
    bType === parse.ZodParsedType.array
  ) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }

    const newArray: unknown[] = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);

      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
        };
      }

      newArray.push(sharedValue.data);
    }

    return { valid: true, data: newArray };
  }
  if (
    aType === parse.ZodParsedType.date &&
    bType === parse.ZodParsedType.date &&
    +a === +b
  ) {
    return { valid: true, data: a };
  }
  return { valid: false, mergeErrorPath: [] };
}

export class $ZodIntersection<
  T extends $ZodType = $ZodType,
  U extends $ZodType = $ZodType,
> extends core.$ZodType<
  T["~output"] & U["~output"],
  core.input<T> & core.input<U>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodIntersection;
  left: T;
  right: U;
  constructor(_def: core.$Def<$ZodIntersection>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const handleParsed = (
      parsedLeft: parse.SyncParseReturnType,
      parsedRight: parse.SyncParseReturnType
    ): parse.SyncParseReturnType<T & U> => {
      if (parse.isAborted(parsedLeft) || parse.isAborted(parsedRight)) {
        const issuesLeft = parse.isAborted(parsedLeft) ? parsedLeft.issues : [];
        const issuesRight = parse.isAborted(parsedRight)
          ? parsedRight.issues
          : [];
        return new parse.ZodFailure(issuesLeft.concat(issuesRight));
      }

      const merged = mergeValues(parsedLeft, parsedRight);

      if (!merged.valid) {
        return new parse.ZodFailure([
          {
            input,
            code: err.ZodIssueCode.invalid_intersection_types,
            mergeErrorPath: merged.mergeErrorPath,
          },
        ]);
      }

      return merged.data;
    };

    const parseResults = [
      this.left["~parse"](input, ctx),
      this.right["~parse"](input, ctx),
    ];

    const hasPromises = parseResults.some(
      (result) => result instanceof Promise
    );

    if (hasPromises) {
      return Promise.all(parseResults).then(([left, right]) =>
        handleParsed(left, right)
      );
    }
    return handleParsed(
      parseResults[0] as parse.SyncParseReturnType,
      parseResults[1] as parse.SyncParseReturnType
    );
  }

  static create<T extends $ZodType, U extends $ZodType>(
    left: T,
    right: U,
    params?: RawCreateParams
  ): $ZodIntersection<T, U> {
    return new $ZodIntersection({
      left: left,
      right: right,
      typeName: $ZodFirstPartyTypeKind.ZodIntersection,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodTuple      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export type $ZodTupleItems = [$ZodType, ...$ZodType[]];
export type AssertArray<T> = T extends any[] ? T : never;
export type OutputTypeOfTuple<T extends $ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends core.$ZodType ? T[k]["~output"] : never;
}>;
export type OutputTypeOfTupleWithRest<
  T extends $ZodTupleItems | [],
  Rest extends $ZodType | null = null,
> = Rest extends $ZodType
  ? [...OutputTypeOfTuple<T>, ...Rest["~output"][]]
  : OutputTypeOfTuple<T>;

export type InputTypeOfTuple<T extends $ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends core.$ZodType ? core.input<T[k]> : never;
}>;
export type InputTypeOfTupleWithRest<
  T extends $ZodTupleItems | [],
  Rest extends $ZodType | null = null,
> = Rest extends $ZodType
  ? [...InputTypeOfTuple<T>, ...core.input<Rest>[]]
  : InputTypeOfTuple<T>;

export type AnyZodTuple = $ZodTuple<
  [$ZodType, ...$ZodType[]] | [],
  $ZodType | null
>;
export class $ZodTuple<
  T extends [$ZodType, ...$ZodType[]] | [] = [$ZodType, ...$ZodType[]] | [],
  Rest extends $ZodType | null = null,
> extends core.$ZodType<
  OutputTypeOfTupleWithRest<T, Rest>,
  InputTypeOfTupleWithRest<T, Rest>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodTuple;
  items: T;
  rest: Rest;
  constructor(_def: core.$Def<$ZodTuple>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.array) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.array,
          received: parsedType,
        },
      ]);
    }

    if (input.length < this.items.length) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.too_small,
          minimum: this.items.length,
          inclusive: true,
          exact: false,
          type: "array",
        },
      ]);
    }

    const rest = this.rest;

    const issues: err.IssueData[] = [];

    if (!rest && input.length > this.items.length) {
      issues.push({
        input,
        code: err.ZodIssueCode.too_big,
        maximum: this.items.length,
        inclusive: true,
        exact: false,
        type: "array",
      });
    }

    let hasPromises = false;

    const items = ([...input] as any[])
      .map((item, itemIndex) => {
        const schema = this.items[itemIndex] || this.rest;
        if (!schema)
          return symbols.NOT_SET as any as parse.SyncParseReturnType<any>;
        const result = schema["~parse"](item, ctx);
        if (result instanceof Promise) {
          hasPromises = true;
        }

        return result;
      })
      .filter((x) => x !== symbols.NOT_SET); // filter nulls

    if (hasPromises) {
      return Promise.all(items).then((results) => {
        issues.push(
          ...results.flatMap((r, i) =>
            !parse.isAborted(r)
              ? []
              : r.issues.map((issue) => ({
                  ...issue,
                  path: [i, ...(issue.path || [])],
                }))
          )
        );

        if (issues.length) {
          return new parse.ZodFailure(issues);
        }
        return results.map((x) => x as any) as any;
      });
    }
    issues.push(
      ...(items as parse.SyncParseReturnType<any>[]).flatMap((r, i) =>
        !parse.isAborted(r)
          ? []
          : r.issues.map((issue) => ({
              ...issue,
              path: [i, ...(issue.path || [])],
            }))
      )
    );

    if (issues.length) {
      return new parse.ZodFailure(issues);
    }
    return items.map((x) => x as any) as any;
  }

  static create<T extends [$ZodType, ...$ZodType[]] | []>(
    schemas: T,
    params?: RawCreateParams
  ): $ZodTuple<T, null> {
    if (!Array.isArray(schemas)) {
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new $ZodTuple({
      items: schemas,
      typeName: $ZodFirstPartyTypeKind.ZodTuple,
      rest: null,

      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodRecord      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export type KeySchema = core.$ZodType<string | number | symbol, any>;
export type RecordType<K extends string | number | symbol, V> = [
  string,
] extends [K]
  ? Record<K, V>
  : [number] extends [K]
    ? Record<K, V>
    : [symbol] extends [K]
      ? Record<K, V>
      : [BRAND<string | number | symbol>] extends [K]
        ? Record<K, V>
        : Partial<Record<K, V>>;
export class $ZodRecord<
  Key extends KeySchema = KeySchema,
  Value extends $ZodType = $ZodType,
> extends core.$ZodType<
  RecordType<Key["~output"], Value["~output"]>,
  RecordType<core.input<Key>, core.input<Value>>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodRecord;
  valueType: Value;
  keyType: Key;
  constructor(_def: core.$Def<$ZodRecord>) {
    super(_def);
  }
  get keySchema(): Key {
    return this.keyType;
  }
  get valueSchema(): Value {
    return this.valueType;
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.object) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const keyType = this.keyType;
    const valueType = this.valueType;

    const issues: err.IssueData[] = [];

    const final: Record<any, any> = {};
    const asyncResults: {
      key: any;
      keyR: parse.AsyncParseReturnType<any>;
      valueR: parse.AsyncParseReturnType<any>;
    }[] = [];

    for (const key of util.objectKeys(input)) {
      if (key === "__proto__") continue;
      const keyResult = keyType["~parse"](key, ctx);
      const valueResult = valueType["~parse"](input[key], ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        asyncResults.push({
          key,
          keyR: keyResult as any,
          valueR: valueResult as any,
        });
      } else if (parse.isAborted(keyResult) || parse.isAborted(valueResult)) {
        if (parse.isAborted(keyResult)) {
          issues.push(
            ...keyResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        }
        if (parse.isAborted(valueResult)) {
          issues.push(
            ...valueResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        }
      } else {
        final[keyResult as any] = valueResult as any;
      }
    }

    if (asyncResults.length) {
      return Promise.resolve().then(async () => {
        for (const asyncResult of asyncResults) {
          const key = asyncResult.key;
          const keyR = await asyncResult.keyR;
          const valueR = await asyncResult.valueR;
          if (parse.isAborted(keyR) || parse.isAborted(valueR)) {
            if (parse.isAborted(keyR)) {
              issues.push(
                ...keyR.issues.map((issue) => ({
                  ...issue,
                  path: [key, ...(issue.path || [])],
                }))
              );
            }
            if (parse.isAborted(valueR)) {
              issues.push(
                ...valueR.issues.map((issue) => ({
                  ...issue,
                  path: [key, ...(issue.path || [])],
                }))
              );
            }
          } else {
            final[keyR as any] = valueR;
          }
        }

        if (issues.length) {
          return new parse.ZodFailure(issues);
        }
        return final as this["~output"];
      });
    }
    if (issues.length) {
      return new parse.ZodFailure(issues);
    }
    return final as this["~output"];
  }

  get element(): Value {
    return this.valueType;
  }

  static create<Value extends $ZodType>(
    valueType: Value,
    params?: RawCreateParams
  ): $ZodRecord<ZodString, Value>;
  static create<Keys extends KeySchema, Value extends $ZodType>(
    keySchema: Keys,
    valueType: Value,
    params?: RawCreateParams
  ): $ZodRecord<Keys, Value>;
  static create(first: any, second?: any, third?: any): $ZodRecord<any, any> {
    if (second instanceof $ZodType) {
      return new $ZodRecord({
        keyType: first,
        valueType: second,
        typeName: $ZodFirstPartyTypeKind.ZodRecord,
        checks: [],
        ...processCreateParams(third),
      });
    }

    return new $ZodRecord({
      keyType: $ZodString.create(),
      valueType: first,
      typeName: $ZodFirstPartyTypeKind.ZodRecord,
      checks: [],
      ...processCreateParams(second),
    });
  }
}

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      $ZodMap      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////
export class $ZodMap<
  Key extends $ZodType = $ZodType,
  Value extends $ZodType = $ZodType,
> extends core.$ZodType<
  Map<Key["~output"], Value["~output"]>,
  Map<core.input<Key>, core.input<Value>>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodMap;
  valueType: Value;
  keyType: Key;
  constructor(_def: core.$Def<$ZodMap>) {
    super(_def);
  }
  get keySchema(): Key {
    return this.keyType;
  }
  get valueSchema(): Value {
    return this.valueType;
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.map) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.map,
          received: parsedType,
        },
      ]);
    }

    const keyType = this.keyType;
    const valueType = this.valueType;

    const asyncResults: {
      index: number;
      keyR: parse.AsyncParseReturnType<any>;
      valueR: parse.AsyncParseReturnType<any>;
    }[] = [];
    const issues: err.IssueData[] = [];
    const final = new Map();

    const entries = [...(input as Map<string | number, unknown>).entries()];
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const keyResult = keyType["~parse"](key, ctx);
      const valueResult = valueType["~parse"](value, ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        asyncResults.push({
          index: i,
          keyR: keyResult as parse.AsyncParseReturnType<any>,
          valueR: valueResult as parse.AsyncParseReturnType<any>,
        });
      } else if (parse.isAborted(keyResult) || parse.isAborted(valueResult)) {
        if (parse.isAborted(keyResult)) {
          issues.push(
            ...keyResult.issues.map((issue) => ({
              ...issue,
              path: [i, "key", ...(issue.path || [])],
            }))
          );
        }
        if (parse.isAborted(valueResult)) {
          issues.push(
            ...valueResult.issues.map((issue) => ({
              ...issue,
              path: [i, "value", ...(issue.path || [])],
            }))
          );
        }
      } else {
        final.set(keyResult, valueResult);
      }
    }

    if (asyncResults.length) {
      return Promise.resolve().then(async () => {
        for (const asyncResult of asyncResults) {
          const index = asyncResult.index;
          const keyR = await asyncResult.keyR;
          const valueR = await asyncResult.valueR;
          if (parse.isAborted(keyR) || parse.isAborted(valueR)) {
            if (parse.isAborted(keyR)) {
              issues.push(
                ...keyR.issues.map((issue) => ({
                  ...issue,
                  path: [index, "key", ...(issue.path || [])],
                }))
              );
            }
            if (parse.isAborted(valueR)) {
              issues.push(
                ...valueR.issues.map((issue) => ({
                  ...issue,
                  path: [index, "value", ...(issue.path || [])],
                }))
              );
            }
          } else {
            final.set(keyR, valueR);
          }
        }

        if (issues.length) {
          return new parse.ZodFailure(issues);
        }

        return final;
      });
    }
    if (issues.length) {
      return new parse.ZodFailure(issues);
    }

    return final;
  }
  static create<
    Key extends $ZodType = $ZodType,
    Value extends $ZodType = $ZodType,
  >(
    keyType: Key,
    valueType: Value,
    params?: RawCreateParams
  ): $ZodMap<Key, Value> {
    return new $ZodMap({
      valueType,
      keyType,
      typeName: $ZodFirstPartyTypeKind.ZodMap,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      $ZodSet      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////
export class $ZodSet<Value extends $ZodType = $ZodType> extends core.$ZodType<
  Set<Value["~output"]>,
  Set<core.input<Value>>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodSet;
  valueType: Value;
  minSize: { value: number; message?: string } | null;
  maxSize: { value: number; message?: string } | null;
  constructor(_def: core.$Def<$ZodSet>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.set) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.set,
          received: parsedType,
        },
      ]);
    }

    const issues: err.IssueData[] = [];

    if (this.minSize !== null) {
      if (input.size < this.minSize.value) {
        issues.push({
          input,
          code: err.ZodIssueCode.too_small,
          minimum: this.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: this.minSize.message,
        });
      }
    }

    if (this.maxSize !== null) {
      if (input.size > this.maxSize.value) {
        issues.push({
          input,
          code: err.ZodIssueCode.too_big,
          maximum: this.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: this.maxSize.message,
        });
      }
    }

    const valueType = this.valueType;

    function finalizeSet(elements: parse.SyncParseReturnType<any>[]) {
      const parsedSet = new Set();
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (parse.isAborted(element)) {
          issues.push(
            ...element.issues.map((issue) => ({
              ...issue,
              path: [i, ...(issue.path || [])],
            }))
          );
        } else {
          parsedSet.add(element);
        }
      }

      if (issues.length) {
        return new parse.ZodFailure(issues);
      }

      return parsedSet;
    }

    let hasPromises = false;

    const elements = [...(input as Set<unknown>).values()].map((item) => {
      const result = valueType["~parse"](item, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(elements).then(finalizeSet);
    }
    return finalizeSet(elements as parse.SyncParseReturnType[]);
  }

  min(minSize: number, message?: types.ErrMessage): this {
    return new $ZodSet({
      ...this,
      minSize: { value: minSize, message: util.errToString(message) },
    }) as any;
  }

  max(maxSize: number, message?: types.ErrMessage): this {
    return new $ZodSet({
      ...this,
      maxSize: { value: maxSize, message: util.errToString(message) },
    }) as any;
  }

  size(size: number, message?: types.ErrMessage): this {
    return this.min(size, message).max(size, message) as any;
  }

  nonempty(message?: types.ErrMessage): $ZodSet<Value> {
    return this.min(1, message) as any;
  }

  static create<Value extends $ZodType = $ZodType>(
    valueType: Value,
    params?: RawCreateParams
  ): $ZodSet<Value> {
    return new $ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: $ZodFirstPartyTypeKind.ZodSet,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      $ZodFunction      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

export type OuterTypeOfFunction<
  Args extends $ZodTuple,
  Returns extends $ZodType,
> = core.input<Args> extends Array<any>
  ? (...args: core.input<Args>) => Returns["~output"]
  : never;

export type InnerTypeOfFunction<
  Args extends $ZodTuple,
  Returns extends $ZodType,
> = Args["~output"] extends Array<any>
  ? (...args: Args["~output"]) => core.input<Returns>
  : never;

export class $ZodFunction<
  Args extends $ZodTuple = $ZodTuple,
  Returns extends $ZodType = $ZodType,
> extends core.$ZodType<
  OuterTypeOfFunction<Args, Returns>,
  InnerTypeOfFunction<Args, Returns>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodFunction;
  args: Args;
  returns: Returns;
  constructor(_def: core.$Def<$ZodFunction>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<any> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.function) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.function,
          received: parsedType,
        },
      ]);
    }

    function makeArgsIssue(args: any, error: err.ZodError): err.ZodIssue {
      return err.makeIssue(
        {
          input: args,
          code: err.ZodIssueCode.invalid_arguments,
          argumentsError: error,
        },
        ctx
      );
    }

    function makeReturnsIssue(returns: any, error: err.ZodError): err.ZodIssue {
      return err.makeIssue(
        {
          input: returns,
          code: err.ZodIssueCode.invalid_return_type,
          returnTypeError: error,
        },
        ctx
      );
    }

    const params = { errorMap: ctx.contextualErrorMap };
    const fn = input;

    if (this.returns instanceof $ZodPromise) {
      // Would love a way to avoid disabling this rule, but we need
      // an alias (using an arrow function was what caused 2651).
      const me = this;
      return async function (this: any, ...args: any[]) {
        const error = new err.ZodError([]);
        const parsedArgs = await me._def.args
          .parseAsync(args, params)
          .catch((e) => {
            error.addIssue(makeArgsIssue(args, e));
            throw error;
          });
        const result = await Reflect.apply(fn, this, parsedArgs as any);
        const parsedReturns = await (
          me._def.returns as unknown as $ZodPromise<$ZodType>
        )._def.type
          .parseAsync(result, params)
          .catch((e) => {
            error.addIssue(makeReturnsIssue(result, e));
            throw error;
          });
        return parsedReturns;
      };
    }
    // Would love a way to avoid disabling this rule, but we need
    // an alias (using an arrow function was what caused 2651).
    const me = this;
    return function (this: any, ...args: any[]) {
      const parsedArgs = me._def.args.safeParse(args, params);
      if (!parsedArgs.success) {
        throw new err.ZodError([makeArgsIssue(args, parsedArgs.error)]);
      }
      const result = Reflect.apply(fn, this, parsedArgs.data);
      const parsedReturns = me._def.returns.safeParse(result, params);
      if (!parsedReturns.success) {
        throw new err.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
      }
      return parsedReturns.data;
    } as any;
  }

  parameters(): Args {
    return this.args;
  }

  returnType(): Returns {
    return this.returns;
  }

  implement<F extends InnerTypeOfFunction<Args, Returns>>(
    func: F
  ): ReturnType<F> extends Returns["~output"]
    ? (...args: core.input<Args>) => ReturnType<F>
    : OuterTypeOfFunction<Args, Returns> {
    const validatedFunc = this.parse(func);
    return validatedFunc as any;
  }

  strictImplement(
    func: InnerTypeOfFunction<Args, Returns>
  ): InnerTypeOfFunction<Args, Returns> {
    const validatedFunc = this.parse(func);
    return validatedFunc as any;
  }

  validate: (typeof this)["implement"] = this.implement;

  static create(): $ZodFunction<$ZodTuple<[], $ZodUnknown>, $ZodUnknown>;
  static create<T extends Any$ZodTuple = $ZodTuple<[], $ZodUnknown>>(
    args: T
  ): $ZodFunction<T, $ZodUnknown>;
  static create<T extends Any$ZodTuple, U extends $ZodType>(
    args: T,
    returns: U
  ): $ZodFunction<T, U>;
  static create<
    T extends Any$ZodTuple = $ZodTuple<[], $ZodUnknown>,
    U extends $ZodType = $ZodUnknown,
  >(args: T, returns: U, params?: RawCreateParams): $ZodFunction<T, U>;
  static create(
    args?: Any$ZodTuple,
    returns?: $ZodType,
    params?: RawCreateParams
  ) {
    return new $ZodFunction({
      args: (args
        ? args
        : $ZodTuple.create([]).rest(ZodUnknown.create())) as any,
      returns: returns || $ZodUnknown.create(),
      typeName: $ZodFirstPartyTypeKind.ZodFunction,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodLazy      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export class $ZodLazy<T extends $ZodType = $ZodType> extends core.$ZodType<
  core.output<T>,
  core.input<T>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodLazy;
  getter: () => T;
  constructor(_def: core.$Def<$ZodLazy>) {
    super(_def);
  }
  get schema(): T {
    return this.getter();
  }

  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const lazySchema = this.getter();
    return lazySchema["~parse"](input, ctx);
  }

  static create<T extends $ZodType>(
    getter: () => T,
    params?: RawCreateParams
  ): $ZodLazy<T> {
    return new $ZodLazy({
      getter: getter,
      typeName: $ZodFirstPartyTypeKind.ZodLazy,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodLiteral      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export class $ZodLiteral<
  T extends types.Primitive = types.Primitive,
> extends core.$ZodType<T, T> {
  override typeName: $ZodFirstPartyTypeKind.ZodLiteral;
  value: T;
  message?: string;
  constructor(_def: core.$Def<$ZodLiteral>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (input !== this.value) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_literal,
          expected: this.value,
          received: input,
          message: this.message,
        },
      ]);
    }
    return input;
  }

  static create<T extends types.Primitive>(
    value: T,
    params?: RawCreateParams & Exclude<types.ErrMessage, string>
  ): $ZodLiteral<T> {
    return new $ZodLiteral({
      value: value,
      typeName: $ZodFirstPartyTypeKind.ZodLiteral,
      message: params?.message,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodEnum      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export type ArrayKeys = keyof any[];
export type Indices<T> = Exclude<keyof T, ArrayKeys>;

export type EnumValues<T extends string = string> = readonly [T, ...T[]];

export type Values<T extends EnumValues> = {
  [k in T[number]]: k;
};

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type FilterEnum<Values, ToExclude> = Values extends []
  ? []
  : Values extends [infer Head, ...infer Rest]
    ? Head extends ToExclude
      ? FilterEnum<Rest, ToExclude>
      : [Head, ...FilterEnum<Rest, ToExclude>]
    : never;

export type typecast<A, T> = A extends T ? A : never;

export class $ZodEnum<
  T extends [string, ...string[]] = [string, ...string[]],
> extends core.$ZodType<T[number], T[number]> {
  override typeName: $ZodFirstPartyTypeKind.ZodEnum;
  values: T;
  constructor(_def: core.$Def<$ZodEnum>) {
    super(_def);
  }
  #cache: Set<T[number]> | undefined;

  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (typeof input !== "string") {
      const parsedType = parse.getParsedType(input);
      const expectedValues = this.values;
      return new parse.ZodFailure([
        {
          input,
          expected: core.joinValues(expectedValues) as "string",
          received: parsedType,
          code: err.ZodIssueCode.invalid_type,
        },
      ]);
    }

    if (!this.#cache) {
      this.#cache = new Set(this.values);
    }

    if (!this.#cache.has(input)) {
      const expectedValues = this.values;

      return new parse.ZodFailure([
        {
          input,
          received: input,
          code: err.ZodIssueCode.invalid_enum_value,
          options: expectedValues,
        },
      ]);
    }

    return input;
  }

  get options(): T {
    return this.values;
  }

  get enum(): Values<T> {
    const enumValues: any = {};
    for (const val of this.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  get Values(): Values<T> {
    const enumValues: any = {};
    for (const val of this.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  get Enum(): Values<T> {
    const enumValues: any = {};
    for (const val of this.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  extract<ToExtract extends readonly [T[number], ...T[number][]]>(
    values: ToExtract,
    newDef: RawCreateParams = this
  ): $ZodEnum<Writeable<ToExtract>> {
    return $ZodEnum.create(values, {
      ...this,
      ...newDef,
    }) as any;
  }

  exclude<ToExclude extends readonly [T[number], ...T[number][]]>(
    values: ToExclude,
    newDef: RawCreateParams = this
  ): $ZodEnum<
    typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [string, ...string[]]>
  > {
    return $ZodEnum.create(
      this.options.filter((opt) => !values.includes(opt)) as FilterEnum<
        T,
        ToExclude[number]
      >,
      {
        ...this,
        ...newDef,
      }
    ) as any;
  }

  static create<U extends string, T extends Readonly<[U, ...U[]]>>(
    values: T,
    params?: RawCreateParams
  ): $ZodEnum<Writeable<T>>;
  static create<U extends string, T extends [U, ...U[]]>(
    values: T,
    params?: RawCreateParams
  ): $ZodEnum<T>;
  static create(values: [string, ...string[]], params?: RawCreateParams) {
    return new $ZodEnum({
      values,
      typeName: $ZodFirstPartyTypeKind.ZodEnum,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      $ZodNativeEnum      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export type EnumLike = { [k: string]: string | number; [nu: number]: string };

export class $ZodNativeEnum<
  T extends EnumLike = EnumLike,
> extends core.$ZodType<T[keyof T], T[keyof T]> {
  override typeName: $ZodFirstPartyTypeKind.ZodNativeEnum;
  values: T;
  constructor(_def: core.$Def<$ZodNativeEnum>) {
    super(_def);
  }
  #cache: Set<T[keyof T]> | undefined;
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<T[keyof T]> {
    const nativeEnumValues = util.getValidEnumValues(this.values);

    const parsedType = parse.getParsedType(input);
    if (
      parsedType !== parse.ZodParsedType.string &&
      parsedType !== parse.ZodParsedType.number
    ) {
      const expectedValues = util.objectValues(nativeEnumValues);
      return new parse.ZodFailure([
        {
          input,
          expected: core.joinValues(expectedValues) as "string",
          received: parsedType,
          code: err.ZodIssueCode.invalid_type,
        },
      ]);
    }

    if (!this.#cache) {
      this.#cache = new Set(util.getValidEnumValues(this.values));
    }

    if (!this.#cache.has(input)) {
      const expectedValues = util.objectValues(nativeEnumValues);

      return new parse.ZodFailure([
        {
          input,
          received: input,
          code: err.ZodIssueCode.invalid_enum_value,
          options: expectedValues,
        },
      ]);
    }

    return input as any;
  }

  get enum(): T {
    return this.values;
  }

  static create<T extends EnumLike>(
    values: T,
    params?: RawCreateParams
  ): $ZodNativeEnum<T> {
    return new $ZodNativeEnum({
      values: values,
      typeName: $ZodFirstPartyTypeKind.ZodNativeEnum,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodFile         //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export type $ZodFileCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string }
  | { kind: "type"; value: Array<string>; message?: string }
  | { kind: "filename"; value: $ZodType; message?: string };

interface _ZodBlob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream;
  text(): Promise<string>;
}

interface _ZodFile extends _ZodBlob {
  readonly lastModified: number;
  readonly name: string;
}

type File = typeof globalThis extends {
  File: {
    prototype: infer X;
  };
}
  ? X
  : _ZodFile;

export class $ZodFile extends core.$ZodType<File, File> {
  override typeName: $ZodFirstPartyTypeKind.ZodFile;
  constructor(_def: core.$Def<$ZodFile>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<File> {
    const parsedType = parse.getParsedType(input);

    if (parsedType !== parse.ZodParsedType.file) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.file,
          received: parsedType,
        },
      ]);
    }

    const file: File = input;

    const issues: err.IssueData[] = [];

    for (const check of this.checks) {
      if (check.kind === "min") {
        if (file.size < check.value) {
          issues.push({
            input,
            code: err.ZodIssueCode.too_small,
            minimum: check.value,
            type: "file",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        if (file.size > check.value) {
          issues.push({
            input,
            code: err.ZodIssueCode.too_big,
            maximum: check.value,
            type: "file",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "type") {
        const _check: any = check;
        const cache: Set<string> = _check.cache ?? new Set(check.value);
        // @todo support extensions?
        // const extension =
        //   file.name.indexOf(".") >= 0
        //     ? file.name.slice(file.name.indexOf("."))
        //     : undefined;
        // const checkSpecifier = (fileTypeSpecifier: string): boolean => {
        //   if (fileTypeSpecifier.startsWith(".")) {
        //     return fileTypeSpecifier === extension;
        //   }
        //   return fileTypeSpecifier === file.type;
        // };
        if (!cache.has(file.type)) {
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_file_type,
            expected: check.value,
            received: file.type,
            message: check.message,
          });
        }
      } else if (check.kind === "filename") {
        const parsedFilename = check.value.safeParse(file.name);
        if (!parsedFilename.success) {
          issues.push({
            input,
            code: err.ZodIssueCode.invalid_file_name,
            message: check.message,
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues.length > 0) {
      return new parse.ZodFailure(issues);
    }

    return file;
  }

  _addCheck(check: $ZodFileCheck): $ZodFile {
    return new $ZodFile({
      ...this,
      checks: [...this.checks, check],
    });
  }

  /**
   * Restricts file size to the specified min.
   */
  min(minSize: number, message?: types.ErrMessage): $ZodFile {
    return this._addCheck({
      kind: "min",
      value: minSize,
      ...util.errToObj(message),
    });
  }

  /**
   * Restricts file size to the specified max.
   */
  max(maxSize: number, message?: types.ErrMessage): $ZodFile {
    return this._addCheck({
      kind: "max",
      value: maxSize,
      ...util.errToObj(message),
    });
  }

  /**
   * Restrict accepted file types.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
   */
  type(fileTypes: Array<string>, message?: types.ErrMessage): $ZodFile {
    const invalidTypes = [];
    for (const t of fileTypes) {
      if (!t.includes("/")) {
        invalidTypes.push(t);
      }
    }
    if (invalidTypes.length > 0) {
      throw new Error(`Invalid file type(s): ${invalidTypes.join(", ")}`);
    }
    return this._addCheck({
      kind: "type",
      value: fileTypes,
      ...util.errToObj(message),
    });
  }

  /**
   * Validates file name against the provided schema.
   */
  name(schema: $ZodType, message?: types.ErrMessage): $ZodFile {
    return this._addCheck({
      kind: "filename",
      value: schema,
      ...util.errToObj(message),
    });
  }

  get minSize(): number | null {
    let min: number | null = null;
    for (const check of this.checks) {
      if (check.kind === "min") {
        if (min === null || check.value > min) {
          min = check.value;
        }
      }
    }
    return min;
  }

  get maxSize(): number | null {
    let max: number | null = null;
    for (const check of this.checks) {
      if (check.kind === "max") {
        if (max === null || check.value < max) {
          max = check.value;
        }
      }
    }
    return max;
  }

  /**
   * Returns accepted file types or undefined if any file type is acceptable.
   */
  get acceptedTypes(): string[] | undefined {
    let result: Array<string> | undefined;
    for (const check of this.checks) {
      if (check.kind === "type") {
        if (check.value) {
          if (result) {
            // reduce to intersection
            result = result.filter((fileType) =>
              check.value.includes(fileType)
            );
          } else {
            result = check.value;
          }
        }
      }
    }
    return result;
  }

  static create = (params?: RawCreateParams): $ZodFile => {
    if (typeof File === "undefined") {
      throw new Error("File is not supported in this environment");
    }
    return new $ZodFile({
      checks: [],
      typeName: $ZodFirstPartyTypeKind.ZodFile,
      checks: [],
      ...processCreateParams(params),
    });
  };
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodPromise      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export class $ZodPromise<T extends $ZodType = $ZodType> extends core.$ZodType<
  Promise<T["~output"]>,
  Promise<core.input<T>>
> {
  type: T;
  override typeName: $ZodFirstPartyTypeKind.ZodPromise;
  constructor(_def: core.$Def<$ZodPromise>) {
    super(_def);
  }
  unwrap(): T {
    return this.type;
  }

  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);

    if (parsedType !== parse.ZodParsedType.promise) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.promise,
          received: parsedType,
        },
      ]);
    }

    return input.then((inner: any) => {
      return this.type["~parse"](inner, ctx);
    });
  }

  static create<T extends $ZodType>(
    schema: T,
    params?: RawCreateParams
  ): $ZodPromise<T> {
    return new $ZodPromise({
      type: schema,
      typeName: $ZodFirstPartyTypeKind.ZodPromise,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////        $ZodEffects        //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export type Refinement<T> = (arg: T, ctx: $RefinementCtx) => any;
export type SuperRefinement<T> = (
  arg: T,
  ctx: $RefinementCtx
) => void | Promise<void>;

export type RefinementEffect<T> = {
  type: "refinement";
  refinement: (arg: T, ctx: $RefinementCtx) => any;
};
export type TransformEffect<T> = {
  type: "transform";
  transform: (arg: T, ctx: $RefinementCtx) => any;
};
export type PreprocessEffect<T> = {
  type: "preprocess";
  transform: (arg: T, ctx: $RefinementCtx) => any;
};
export type Effect<T> =
  | RefinementEffect<T>
  | TransformEffect<T>
  | PreprocessEffect<T>;

export class $ZodEffects<
  T extends $ZodType = $ZodType,
  Output = core.output<T>,
  Input = core.input<T>,
> extends core.$ZodType<Output, Input> {
  schema: T;
  override typeName: $ZodFirstPartyTypeKind.ZodEffects;
  effect: Effect<any>;
  constructor(_def: core.$Def<$ZodEffects>) {
    super(_def);
  }
  innerType(): T {
    return this.schema;
  }

  sourceType(): T {
    return this.schema._def.typeName === $ZodFirstPartyTypeKind.ZodEffects
      ? (this.schema as unknown as $ZodEffects<T>).sourceType()
      : (this.schema as T);
  }

  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const effect = this.effect || null;

    const issues: err.IssueData[] = [];

    const checkCtx: $RefinementCtx = {
      addIssue: (arg: err.IssueData) => {
        issues.push(arg);
      },
    };

    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);

    if (effect.type === "preprocess") {
      const processed = effect.transform(input, checkCtx);

      if (processed instanceof Promise) {
        return processed.then((processed) => {
          if (issues.some((i) => i.fatal)) {
            return new parse.ZodFailure(issues);
          }
          const result = this.schema["~parse"](processed, ctx);
          if (result instanceof Promise) {
            return result.then((r) => {
              if (parse.isAborted(r)) {
                issues.push(...r.issues);
              }
              if (issues.length) return new parse.ZodFailure(issues);
              return r;
            });
          }

          if (parse.isAborted(result)) {
            issues.push(...result.issues);
            return new parse.ZodFailure(issues);
          }

          return issues.length ? new parse.ZodFailure(issues) : result;
        }) as any;
      }
      if (issues.some((i) => i.fatal)) {
        return new parse.ZodFailure(issues);
      }
      const result = this.schema["~parse"](processed, ctx);

      if (result instanceof Promise) {
        return result.then((r) => {
          if (parse.isAborted(r)) {
            issues.push(...r.issues);
          }
          if (issues.length) return new parse.ZodFailure(issues);
          return r;
        });
      }

      if (parse.isAborted(result)) {
        issues.push(...result.issues);
        return new parse.ZodFailure(issues);
      }

      return issues.length ? new parse.ZodFailure(issues) : (result as any);
    }

    if (effect.type === "refinement") {
      const executeRefinement = (acc: unknown): any => {
        const result = effect.refinement(acc, checkCtx);
        if (result instanceof Promise) {
          return Promise.resolve(result);
        }
        return acc;
      };

      const inner = this.schema["~parse"](input, ctx);

      if (!(inner instanceof Promise)) {
        if (parse.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        const value = parse.isAborted(inner)
          ? inner.value !== symbols.NOT_SET
            ? inner.value
            : input // if valid, use parsed value
          : inner;
        // else, check parse.ZodFailure for `.value` (set after transforms)
        // then fall back to original input
        if (issues.some((i) => i.fatal)) {
          return new parse.ZodFailure(issues, value);
        }

        // return value is ignored
        const executed = executeRefinement(value);

        if (executed instanceof Promise) {
          return executed.then(() => {
            if (issues.length) return new parse.ZodFailure(issues, inner);
            return inner;
          }) as any;
        }

        if (issues.length) return new parse.ZodFailure(issues, inner);
        return inner as any;
      }
      return inner.then((inner) => {
        if (parse.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        if (issues.some((i) => i.fatal)) {
          return new parse.ZodFailure(issues, inner);
        }

        const value = parse.isAborted(inner)
          ? inner.value !== symbols.NOT_SET
            ? inner.value
            : input // if valid, use parsed value
          : inner;

        const executed = executeRefinement(value);

        if (executed instanceof Promise) {
          return executed.then(() => {
            if (issues.length) return new parse.ZodFailure(issues, inner);
            return inner;
          });
        }

        if (issues.length) return new parse.ZodFailure(issues, inner);
        return inner;
      });
    }

    if (effect.type === "transform") {
      const inner = this.schema["~parse"](input, ctx);
      if (!(inner instanceof Promise)) {
        if (parse.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        // do not execute transform if any issues exist
        if (issues.length) return new parse.ZodFailure(issues);

        const value = parse.isAborted(inner)
          ? inner.value === symbols.NOT_SET
            ? input
            : inner.value
          : inner;

        const result = effect.transform(value, checkCtx);
        if (result instanceof Promise) {
          return result.then((result) => {
            if (issues.length) return new parse.ZodFailure(issues, result);
            return result;
          });
        }

        if (issues.length) return new parse.ZodFailure(issues, result);
        return result;
      }
      return inner.then((inner) => {
        if (parse.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        if (issues.length) return new parse.ZodFailure(issues, inner);

        const value = parse.isAborted(inner)
          ? inner.value === symbols.NOT_SET
            ? input
            : inner.value
          : inner;

        const result = effect.transform(value, checkCtx);

        if (result instanceof Promise) {
          return result.then((result) => {
            if (issues.length) return new parse.ZodFailure(issues, result);
            return result;
          });
        }

        if (issues.length) return new parse.ZodFailure(issues, result);
        return result;
      });
    }

    util.assertNever(effect);
  }

  static create<I extends $ZodType>(
    schema: I,
    effect: Effect<I["~output"]>,
    params?: RawCreateParams
  ): $ZodEffects<I, I["~output"]> {
    return new $ZodEffects({
      schema,
      typeName: $ZodFirstPartyTypeKind.ZodEffects,
      effect,
      checks: [],
      ...processCreateParams(params),
    });
  }

  static createWithPreprocess<I extends $ZodType>(
    preprocess: (arg: unknown, ctx: $RefinementCtx) => unknown,
    schema: I,
    params?: RawCreateParams
  ): $ZodEffects<I, I["~output"], unknown> {
    return new $ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: $ZodFirstPartyTypeKind.ZodEffects,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

export { $ZodEffects as $ZodTransformer };

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      $ZodOptional      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export type $ZodOptionalType<T extends $ZodType> = $ZodOptional<T>;

export class $ZodOptional<T extends $ZodType = $ZodType> extends core.$ZodType<
  T["~output"] | undefined,
  core.input<T> | undefined
> {
  override typeName: $ZodFirstPartyTypeKind.ZodOptional;
  innerType: T;
  constructor(_def: core.$Def<$ZodOptional>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType === parse.ZodParsedType.undefined) {
      return undefined;
    }
    return this.innerType["~parse"](input, ctx);
  }

  unwrap(): T {
    return this.innerType;
  }

  static create<T extends $ZodType>(
    type: T,
    params?: RawCreateParams
  ): $ZodOptional<T> {
    return new $ZodOptional({
      innerType: type,
      typeName: $ZodFirstPartyTypeKind.ZodOptional,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      $ZodNullable      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export type $ZodNullableType<T extends $ZodType> = $ZodNullable<T>;

type adjklf = core.$Def<$ZodNullable>;
export class $ZodNullable<T extends $ZodType = $ZodType> extends core.$ZodType<
  T["~output"] | null,
  core.input<T> | null
> {
  override typeName: $ZodFirstPartyTypeKind.ZodNullable;
  innerType: T;
  constructor(_def: core.$Def<$ZodNullable>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType === parse.ZodParsedType.null) {
      return null;
    }

    return this.innerType["~parse"](input, ctx);
  }

  unwrap(): T {
    return this.innerType;
  }

  static create<T extends $ZodType>(
    type: T,
    params?: RawCreateParams
  ): $ZodNullable<T> {
    return new $ZodNullable({
      innerType: type,
      typeName: $ZodFirstPartyTypeKind.ZodNullable,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       $ZodDefault       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export class $ZodDefault<T extends $ZodType = $ZodType> extends core.$ZodType<
  types.noUndefined<T["~output"]>,
  core.input<T> | undefined
> {
  override typeName: $ZodFirstPartyTypeKind.ZodDefault;
  innerType: T;
  defaultValue: () => types.noUndefined<core.input<T>>;
  constructor(_def: core.$Def<$ZodDefault>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const parsedType = parse.getParsedType(input);
    if (parsedType === parse.ZodParsedType.undefined) {
      input = this.defaultValue();
    }
    this["~def"];
    return this.innerType["~parse"](input, ctx) as any;
  }

  removeDefault(): T {
    return this.innerType;
  }

  static create<T extends $ZodType>(
    type: T,
    params: RawCreateParams & {
      default: core.input<T> | (() => types.noUndefined<core.input<T>>);
    }
  ): $ZodDefault<T> {
    return new $ZodDefault({
      innerType: type,
      typeName: $ZodFirstPartyTypeKind.ZodDefault,
      defaultValue:
        typeof params.default === "function"
          ? params.default
          : ((() => params.default) as any),
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////       $ZodCatch       //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export class $ZodCatch<T extends $ZodType = $ZodType> extends core.$ZodType<
  T["~output"],
  unknown // any input will pass validation // core.input<T>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodCatch;
  innerType: T;
  catchValue: (ctx: { error: err.ZodError; input: unknown }) => core.input<T>;
  constructor(_def: core.$Def<$ZodCatch>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const result = this.innerType["~parse"](input, ctx);

    if (parse.isAsync(result)) {
      return result.then((result) => {
        return {
          status: "valid",
          value: parse.isAborted(result)
            ? this.catchValue({
                get error() {
                  return new err.ZodError(
                    result.issues.map((issue) => err.makeIssue(issue, ctx))
                  );
                },
                input,
              })
            : result,
        };
      });
    }
    return parse.isAborted(result)
      ? this.catchValue({
          get error() {
            return new err.ZodError(
              result.issues.map((issue) => err.makeIssue(issue, ctx))
            );
          },
          input,
        })
      : result;
  }

  removeCatch(): T {
    return this.innerType;
  }

  static create<T extends $ZodType>(
    type: T,
    params: RawCreateParams & {
      catch: T["~output"] | (() => T["~output"]);
    }
  ): $ZodCatch<T> {
    return new $ZodCatch({
      innerType: type,
      typeName: $ZodFirstPartyTypeKind.ZodCatch,
      catchValue:
        typeof params.catch === "function"
          ? params.catch
          : ((() => params.catch) as any),
      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNaN         //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export class $ZodNaN extends core.$ZodType<number, number> {
  override typeName: $ZodFirstPartyTypeKind.ZodNaN;
  constructor(_def: core.$Def<$ZodNaN>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<any> {
    const parsedType = parse.getParsedType(input);
    if (parsedType !== parse.ZodParsedType.nan) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.nan,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams): $ZodNaN {
    return new $ZodNaN({
      typeName: $ZodFirstPartyTypeKind.ZodNaN,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodBranded      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export const BRAND: unique symbol = Symbol("zod_brand");
export type BRAND<T extends string | number | symbol> = {
  [BRAND]: { [k in T]: true };
};

export class $ZodBranded<
  T extends $ZodType = $ZodType,
  B extends string | number | symbol = string | number | symbol,
> extends core.$ZodType<T["~output"] & BRAND<B>, core.input<T>> {
  override typeName: $ZodFirstPartyTypeKind.ZodBranded;
  type: T;
  constructor(_def: core.$Def<$ZodBranded>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<any> {
    return this.type["~parse"](input, ctx);
  }

  unwrap(): T {
    return this.type;
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodPipeline       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export class $ZodPipeline<
  A extends $ZodType = $ZodType,
  B extends $ZodType = $ZodType,
> extends core.$ZodType<B["~output"], core.input<A>> {
  override typeName: $ZodFirstPartyTypeKind.ZodPipeline;
  in: A;
  out: B;
  constructor(_def: core.$Def<$ZodPipeline>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<any> {
    const result = this.in["~parse"](input, ctx);
    if (result instanceof Promise) {
      return result.then((inResult) => {
        if (parse.isAborted(inResult)) return inResult;

        return this.out["~parse"](inResult, ctx);
      });
    }
    if (parse.isAborted(result)) return result;

    return this.out["~parse"](result, ctx);
  }

  static create<A extends $ZodType, B extends $ZodType>(
    a: A,
    b: B
  ): $ZodPipeline<A, B> {
    return new $ZodPipeline({
      in: a,
      out: b,
      typeName: $ZodFirstPartyTypeKind.ZodPipeline,
    });
  }
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      $ZodReadonly      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
type BuiltIn =
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;

type MakeReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : T extends Set<infer V>
    ? ReadonlySet<V>
    : T extends [infer Head, ...infer Tail]
      ? readonly [Head, ...Tail]
      : T extends Array<infer V>
        ? ReadonlyArray<V>
        : T extends BuiltIn
          ? T
          : Readonly<T>;

export class $ZodReadonly<T extends $ZodType = $ZodType> extends core.$ZodType<
  MakeReadonly<T["~output"]>,
  MakeReadonly<core.input<T>>
> {
  override typeName: $ZodFirstPartyTypeKind.ZodReadonly;
  innerType: T;
  constructor(_def: core.$Def<$ZodReadonly>) {
    super(_def);
  }
  "~parse"(
    input: parse.ParseInput,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const result = this.innerType["~parse"](input, ctx);
    const freeze = (data: unknown) => {
      if (parse.isValid(data)) {
        data = Object.freeze(data) as any;
      }
      return data;
    };
    return parse.isAsync(result)
      ? result.then((data) => freeze(data))
      : (freeze(result) as any);
  }

  static create<T extends $ZodType>(
    type: T,
    params?: RawCreateParams
  ): $ZodReadonly<T> {
    return new $ZodReadonly({
      innerType: type,
      typeName: $ZodFirstPartyTypeKind.ZodReadonly,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }

  unwrap(): T {
    return this.innerType;
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////  $ZodTemplateLiteral  //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

type TemplateLiteralPrimitive = string | number | boolean | null | undefined;

type TemplateLiteralInterpolatedPosition = $ZodType<
  TemplateLiteralPrimitive | bigint
>;
type TemplateLiteralPart =
  | TemplateLiteralPrimitive
  | TemplateLiteralInterpolatedPosition;

type appendToTemplateLiteral<
  Template extends string,
  Suffix extends TemplateLiteralPrimitive | $ZodType,
> = Suffix extends TemplateLiteralPrimitive
  ? `${Template}${Suffix}`
  : Suffix extends $ZodOptional<infer UnderlyingType>
    ? Template | appendToTemplateLiteral<Template, UnderlyingType>
    : Suffix extends $ZodBranded<infer UnderlyingType, any>
      ? appendToTemplateLiteral<Template, UnderlyingType>
      : Suffix extends core.$ZodType<infer Output, any>
        ? Output extends TemplateLiteralPrimitive | bigint
          ? `${Template}${Output}`
          : never
        : never;

type partsToTemplateLiteral<Parts extends TemplateLiteralPart[]> =
  [] extends Parts
    ? ``
    : Parts extends [
          ...infer Rest extends TemplateLiteralPart[],
          infer Last extends TemplateLiteralPart,
        ]
      ? appendToTemplateLiteral<partsToTemplateLiteral<Rest>, Last>
      : never;

export class $ZodTemplateLiteral<
  Template extends string = "",
> extends core.$ZodType<Template, Template> {
  override typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral;
  coerce: boolean;
  parts: readonly TemplateLiteralPart[];
  regexString: string;
  constructor(_def: core.$Def<$ZodTemplateLiteral>) {
    super(_def);
  }
  interpolated<I extends TemplateLiteralInterpolatedPosition>(
    type: Exclude<
      I,
      $ZodNever | $ZodNaN | $ZodPipeline<any, any> | $ZodLazy<any>
    >
  ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, I>> {
    // TODO: check for invalid types at runtime
    return this._addPart(type) as any;
  }

  literal<L extends TemplateLiteralPrimitive>(
    literal: L
  ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, L>> {
    return this._addPart(literal) as any;
  }

  "~parse"(
    input: parse.ParseInput,
    _ctx: parse.ParseContext
  ): parse.ParseReturnType<Template> {
    if (this.coerce) {
      input = String(input);
    }

    const parsedType = parse.getParsedType(input);

    if (parsedType !== parse.ZodParsedType.string) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.invalid_type,
          expected: parse.ZodParsedType.string,
          received: parsedType,
        },
      ]);
    }

    if (!new RegExp(this.regexString).test(input)) {
      return new parse.ZodFailure([
        {
          input,
          code: err.ZodIssueCode.custom,
          message: `String does not match template literal`,
        },
      ]);
    }

    return input;
  }

  protected _addParts(parts: TemplateLiteralPart[]): $ZodTemplateLiteral {
    let r = this.regexString;
    for (const part of parts) {
      r = this._appendToRegexString(r, part);
    }
    return new $ZodTemplateLiteral({
      ...this,
      parts: [...this.parts, ...parts],
      regexString: r,
    });
  }

  protected _addPart(
    part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
  ): $ZodTemplateLiteral {
    const parts = [...this.parts, part];

    return new $ZodTemplateLiteral({
      ...this,
      parts,
      regexString: this._appendToRegexString(this.regexString, part),
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
    if (!(part instanceof core.$ZodType)) {
      return this._escapeRegExp(part);
    }

    if (part instanceof $ZodLiteral) {
      return this._escapeRegExp(part._def.value);
    }

    if (part instanceof $ZodString) {
      return this._transformZodStringPartToRegexString(part);
    }

    if (part instanceof $ZodEnum || part instanceof $ZodNativeEnum) {
      const values =
        part instanceof $ZodEnum
          ? part._def.values
          : util.getValidEnumValues(part._def.values);

      return `(${values.map(this._escapeRegExp).join("|")})`;
    }

    if (part instanceof $ZodUnion) {
      return `(${(part._def.options as any[])
        .map((option) => this._transformPartToRegexString(option))
        .join("|")})`;
    }

    if (part instanceof $ZodNumber) {
      return this._transformZodNumberPartToRegexString(part);
    }

    if (part instanceof $ZodOptional) {
      return `(${this._transformPartToRegexString(part.unwrap())})?`;
    }

    if (part instanceof $ZodTemplateLiteral) {
      return this._unwrapRegExp(part._def.regexString);
    }

    if (part instanceof $ZodBigInt) {
      // FIXME: include/exclude '-' based on min/max values after https://github.com/colinhacks/zod/pull/1711 is merged.
      return "\\-?\\d+";
    }

    if (part instanceof $ZodBoolean) {
      return "(true|false)";
    }

    if (part instanceof $ZodNullable) {
      do {
        part = part.unwrap();
      } while (part instanceof $ZodNullable);

      return `(${this._transformPartToRegexString(part)}|null)${
        part instanceof $ZodOptional ? "?" : ""
      }`;
    }

    if (part instanceof $ZodBranded) {
      return this._transformPartToRegexString(part.unwrap());
    }

    if (part instanceof $ZodAny) {
      return ".*";
    }

    if (part instanceof $ZodNull) {
      return "null";
    }

    if (part instanceof $ZodUndefined) {
      return "undefined";
    }

    throw new err.ZodTemplateLiteralUnsupportedTypeError();
  }

  // FIXME: we don't support transformations, so `.trim()` is not supported.
  protected _transformZodStringPartToRegexString(part: $ZodString): string {
    let maxLength = Number.POSITIVE_INFINITY;
    let minLength = 0;
    let endsWith = "";
    let startsWith = "";

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
        throw new err.ZodTemplateLiteralUnsupportedCheckError(
          $ZodFirstPartyTypeKind.ZodString,
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
      : Number.POSITIVE_INFINITY;

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

  protected _resolveRegexForStringCheck(check: $ZodStringCheck): RegExp | null {
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

    if (maxLength !== Number.POSITIVE_INFINITY) {
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
  protected _transformZodNumberPartToRegexString(part: $ZodNumber): string {
    let canBeNegative = true;
    let canBePositive = true;
    let min = Number.NEGATIVE_INFINITY;
    let max = Number.POSITIVE_INFINITY;
    let canBeZero = true;
    let finite = false;
    let isInt = false;
    let acc = "";

    for (const ch of part._def.checks) {
      if (ch.kind === "finite") {
        finite = true;
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
        throw new err.ZodTemplateLiteralUnsupportedCheckError(
          $ZodFirstPartyTypeKind.ZodNumber,
          ch.kind
        );
      }
    }

    if (Number.isFinite(min) && Number.isFinite(max)) {
      finite = true;
    }

    if (canBeNegative) {
      acc = `${acc}\\-`;

      if (canBePositive) {
        acc = `${acc}?`;
      }
    } else if (!canBePositive) {
      return "0+";
    }

    if (!finite) {
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

    if (!finite) {
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

  static empty = (
    params?: RawCreateParams & { coerce?: true }
  ): $ZodTemplateLiteral => {
    return new $ZodTemplateLiteral({
      checks: [],
      ...processCreateParams(params),
      coerce: params?.coerce ?? false,
      parts: [],
      regexString: "^$",
      typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral,
    });
  };

  static create<
    Part extends TemplateLiteralPart,
    Parts extends [] | [Part, ...Part[]],
  >(
    parts: Parts,
    params?: RawCreateParams & { coerce?: true }
  ): $ZodTemplateLiteral<partsToTemplateLiteral<Parts>>;
  static create(
    parts: TemplateLiteralPart[],
    params?: RawCreateParams & { coerce?: true }
  ) {
    return $ZodTemplateLiteral.empty(params)._addParts(parts) as any;
  }
}

export enum $ZodFirstPartyTypeKind {
  ZodString = "ZodString",
  ZodNumber = "ZodNumber",
  ZodNaN = "ZodNaN",
  ZodBigInt = "ZodBigInt",
  ZodBoolean = "ZodBoolean",
  ZodDate = "ZodDate",
  ZodFile = "ZodFile",
  ZodSymbol = "ZodSymbol",
  ZodUndefined = "ZodUndefined",
  ZodNull = "ZodNull",
  ZodAny = "ZodAny",
  ZodUnknown = "ZodUnknown",
  ZodNever = "ZodNever",
  ZodVoid = "ZodVoid",
  ZodArray = "ZodArray",
  ZodObject = "ZodObject",
  ZodUnion = "ZodUnion",
  ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
  ZodIntersection = "ZodIntersection",
  ZodTuple = "ZodTuple",
  ZodRecord = "ZodRecord",
  ZodMap = "ZodMap",
  ZodSet = "ZodSet",
  ZodFunction = "ZodFunction",
  ZodLazy = "ZodLazy",
  ZodLiteral = "ZodLiteral",
  ZodEnum = "ZodEnum",
  ZodEffects = "ZodEffects",
  ZodNativeEnum = "ZodNativeEnum",
  ZodOptional = "ZodOptional",
  ZodNullable = "ZodNullable",
  ZodDefault = "ZodDefault",
  ZodCatch = "ZodCatch",
  ZodPromise = "ZodPromise",
  ZodBranded = "ZodBranded",
  ZodPipeline = "ZodPipeline",
  ZodReadonly = "ZodReadonly",
  ZodTemplateLiteral = "ZodTemplateLiteral",
}

export type ZodFirstPartySchemaTypes =
  | $ZodString
  | $ZodNumber
  | $ZodNaN
  | $ZodBigInt
  | $ZodBoolean
  | $ZodDate
  | $ZodFile
  | $ZodUndefined
  | $ZodNull
  | $ZodAny
  | $ZodUnknown
  | $ZodNever
  | $ZodVoid
  | $ZodArray
  | $ZodObject
  | $ZodUnion
  | $ZodDiscriminatedUnion
  | $ZodIntersection
  | $ZodTuple
  | $ZodRecord
  | $ZodMap
  | $ZodSet
  | $ZodFunction
  | $ZodLazy
  | $ZodLiteral
  | $ZodEnum
  | $ZodEffects
  | $ZodNativeEnum
  | $ZodOptional
  | $ZodNullable
  | $ZodDefault
  | $ZodCatch
  | $ZodPromise
  | $ZodBranded
  | $ZodPipeline
  | $ZodReadonly
  | $ZodSymbol
  | $ZodTemplateLiteral;
