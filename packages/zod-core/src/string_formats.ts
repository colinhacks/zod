import type * as checks from "./checks.js";
import { $ZodString, type $ZodStringDef } from "./classes.js";
import type * as err from "./errors.js";
import * as parse from "./parse.js";
import * as regexes from "./regexes.js";
import type * as types from "./types.js";

///////////////////////////////////////
/////     $ZodStringFormat(s)     /////
///////////////////////////////////////
interface $ZodStringFormatDef extends $ZodStringDef, checks.$ZodCheckDef {
  pattern?: RegExp;
  error?: err.$ZodErrorMap;
}

interface $ZodStringFormatDefDefault extends $ZodStringFormatDef {
  error?: err.$ZodErrorMap<
    err.$ZodIssueInvalidTypeBasic | err.$ZodIssueStringFormat
  >;
}

export abstract class $ZodStringFormat<
    Def extends $ZodStringFormatDef = $ZodStringFormatDefDefault,
  >
  extends $ZodString<string, string, Def>
  implements checks.$ZodCheck<string, Def>
{
  abstract check: err.$ZodStringFormats;

  run(ctx: checks.$CheckCtx<string>): void {
    if (!this.pattern) throw new Error("Not implemented.");
    if (!this.pattern.test(ctx.input)) {
      ctx.addIssue(
        {
          code: "invalid_format",
          format: this.check,
          pattern: this.pattern,
          input: ctx.input,
        } as err.$ZodIssueData,
        this
      );
    }
  }

  /** @deprecated Internal API, use with caution. */
  override _parseInput(
    input: unknown,
    _ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    console.log("uuid _parseInput");
    const typedResult = super._parseInput(input, _ctx);
    if (parse.failed(typedResult)) {
      if (parse.aborted(typedResult)) return typedResult;
      return this._runCheck(this, input, _ctx, typedResult);
    }
    return this._runCheck(this, input, _ctx);
  }
}

///////////////////////////////
//////      ZodUUID      //////
///////////////////////////////
export class $ZodUUID extends $ZodStringFormat {
  check = "uuid" as const;
  override pattern: RegExp = regexes.uuidRegex;
}

////////////////////////////////
//////      ZodRegex      //////
////////////////////////////////
export class $ZodRegex extends $ZodStringFormat {
  check = "regex" as const;
  override pattern!: RegExp;
}

////////////////////////////////
//////      ZodEmail      //////
////////////////////////////////
export class $ZodEmail extends $ZodStringFormat {
  check = "email" as const;
  override pattern?: RegExp = regexes.emailRegex;
}

//////////////////////////////
//////      ZodURL      //////
//////////////////////////////
export class $ZodURL extends $ZodStringFormat {
  check = "url" as const;

  override run(ctx: checks.$CheckCtx<string>): void {
    try {
      const url = new URL(ctx.input);
      if (!regexes.hostnameRegex.test(url.hostname)) {
        ctx.addIssue({
          code: "invalid_format",
          format: this.check,
          input: ctx.input,
        });
      }
    } catch {
      ctx.addIssue({
        code: "invalid_format",
        format: this.check,
        input: ctx.input,
      });
    }
  }
}

//////////////////////////////
//////      ZodJWT      //////
//////////////////////////////
export function isValidJWT(
  token: string,
  algorithm: types.JWTAlgorithm | null = null
): boolean {
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

interface $ZodJWTDef extends $ZodStringFormatDef {
  algorithm?: types.JWTAlgorithm | undefined;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic | err.$ZodIssueJWT>;
}
export class $ZodJWT extends $ZodStringFormat<$ZodJWTDef> {
  check = "jwt" as const;
  override run(ctx: checks.$CheckCtx<string>): void {
    if (!isValidJWT(ctx.input, this.algorithm)) {
      ctx.addIssue({
        code: "invalid_format",
        format: this.check,
        algorithm: this.algorithm,
        input: ctx.input,
      });
    }
  }
}

////////////////////////////////
//////      ZodEmoji      //////
////////////////////////////////
export class $ZodEmoji extends $ZodStringFormat {
  check = "emoji" as const;
  override pattern: RegExp = regexes.emojiRegex();
}

/////////////////////////////////
//////      ZodNanoID      //////
/////////////////////////////////
export class $ZodNanoID extends $ZodStringFormat {
  check = "nanoid" as const;
  override pattern: RegExp = regexes.nanoidRegex;
}

///////////////////////////////
//////      ZodGUID      //////
///////////////////////////////
export class $ZodGUID extends $ZodStringFormat {
  check = "guid" as const;
  override pattern: RegExp = regexes.guidRegex;
}

///////////////////////////////
//////      ZodCUID      //////
///////////////////////////////
export class $ZodCUID extends $ZodStringFormat {
  check = "cuid" as const;
  override pattern: RegExp = regexes.cuidRegex;
}

////////////////////////////////
//////      ZodCUID2      //////
////////////////////////////////
export class $ZodCUID2 extends $ZodStringFormat {
  check = "cuid2" as const;
  override pattern: RegExp = regexes.cuid2Regex;
}

///////////////////////////////
//////      ZodULID      //////
///////////////////////////////
export class $ZodULID extends $ZodStringFormat {
  check = "ulid" as const;
  override pattern: RegExp = regexes.ulidRegex;
}

//////////////////////////////
//////      ZodXID      //////
//////////////////////////////
export class $ZodXID extends $ZodStringFormat {
  check = "xid" as const;
  override pattern: RegExp = regexes.xidRegex;
}

////////////////////////////////
//////      ZodKSUID      //////
////////////////////////////////
export class $ZodKSUID extends $ZodStringFormat {
  check = "ksuid" as const;
}

//////////////////////////////////////
//////      ZodISODateTime      //////
//////////////////////////////////////
interface $ZodISODateTimeDef extends $ZodStringFormatDef {
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
  error?: err.$ZodErrorMap<
    err.$ZodIssueInvalidTypeBasic | err.$ZodIssueStringFormat
  >;
}
export class $ZodISODateTime extends $ZodStringFormat<$ZodISODateTimeDef> {
  check = "iso_datetime" as const;
  constructor(def: $ZodISODateTimeDef) {
    super(def);
    this.pattern = regexes.datetimeRegex(def);
    this.precision = def.precision ?? null;
    this.offset = def.offset ?? false;
    this.local = def.local ?? false;
  }
}

//////////////////////////////////
//////      ZodISODate      //////
//////////////////////////////////
export class $ZodISODate extends $ZodStringFormat {
  check = "iso_date" as const;
  override pattern: RegExp = regexes.dateRegex;
}

//////////////////////////////////
//////      ZodISOTime      //////
//////////////////////////////////
export interface $ZodISOTimeDef extends $ZodStringFormatDef {
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
  error?: err.$ZodErrorMap<
    err.$ZodIssueInvalidTypeBasic | err.$ZodIssueStringFormat
  >;
}
export class $ZodISOTime extends $ZodStringFormat<$ZodISOTimeDef> {
  check = "iso_time" as const;

  constructor(def: $ZodISOTimeDef) {
    super(def);
    this.pattern = regexes.timeRegex(def);
    this.precision = def.precision ?? null;
    this.offset = def.offset ?? false;
    this.local = def.local ?? false;
  }
}

///////////////////////////////////
//////      ZodDuration      //////
///////////////////////////////////
export class $ZodDuration extends $ZodStringFormat {
  check = "duration" as const;
  override pattern: RegExp = regexes.durationRegex;
}

/////////////////////////////
//////      ZodIP      //////
/////////////////////////////
export class $ZodIP extends $ZodStringFormat {
  check = "ip" as const;
  override pattern: RegExp = regexes.ipv4Regex;

  override run(ctx: checks.$CheckCtx<string>): void {
    if (regexes.ipv4Regex.test(ctx.input) || regexes.ipv6Regex.test(ctx.input))
      return;
    ctx.addIssue({
      code: "invalid_format",
      format: this.check,
      input: ctx.input,
    });
  }
}

///////////////////////////////
//////      ZodIPv4      //////
///////////////////////////////
export class $ZodIPv4 extends $ZodStringFormat {
  check = "ipv4" as const;
  override pattern: RegExp = regexes.ipv4Regex;
}

///////////////////////////////
//////      ZodIPv6      //////
///////////////////////////////
export class $ZodIPv6 extends $ZodStringFormat {
  check = "ipv6" as const;
  override pattern: RegExp = regexes.ipv6Regex;
}

/////////////////////////////////
//////      ZodBase64      //////
/////////////////////////////////
export class $ZodBase64 extends $ZodStringFormat {
  check = "base64" as const;
  override pattern: RegExp = regexes.base64Regex;
}

/////////////////////////////////////
//////      ZodJSONString      //////
/////////////////////////////////////
export class $ZodJSONString extends $ZodStringFormat {
  check = "json_string" as const;

  override run(ctx: checks.$CheckCtx<string>): void {
    try {
      JSON.parse(ctx.input);
    } catch (err) {
      ctx.addIssue({
        code: "invalid_format",
        format: this.check,
        input: ctx.input,
      });
    }
  }
}

///////////////////////////////
//////      ZodE164      //////
///////////////////////////////
export class $ZodE164 extends $ZodStringFormat {
  check = "e164" as const;
  override pattern: RegExp = regexes.e164Regex;
}
