import * as core from "./core.js";
import * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import * as util from "./util.js";

type ParserDefaults = Partial<schemas.ParseContextInternal>;
type ZodErrorClass = { new (issues: errors.$ZodIssue[]): errors.$ZodError };

///////////        METHODS       ///////////
type $Parse = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => core.output<T>;

export const _parse: (_defaults: ParserDefaults, _Err: ZodErrorClass) => $Parse =
  (_defaults, _Err) => (schema, value, _ctx) => {
    const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new core.$ZodAsyncError();
    }
    if (result.issues.length) {
      const e = new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
      Error.captureStackTrace(e, _parse);
      throw e;
    }
    return result.value;
  };

export const parse: typeof _parse = /* @__PURE__*/ _parse.bind({ Error: errors.$ZodError });

type $SafeParse = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => util.SafeParseResult<core.output<T>>;

export const _safeParse: (_defaults: ParserDefaults, _Err: ZodErrorClass) => $SafeParse =
  (_defaults, _Err) => (schema, value, _ctx) => {
    const ctx: schemas.ParseContextInternal = _ctx ? Object.assign(_ctx, _defaults) : _defaults;
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new core.$ZodAsyncError();
    }

    return result.issues.length
      ? {
          success: false,
          error: new (_Err ?? errors.$ZodError)(
            result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))
          ),
        }
      : { success: true, data: result.value };
  };
export const safeParse: $SafeParse = /* @__PURE__*/ _safeParse({ async: false }, errors.$ZodError);

type $ParseAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<core.output<T>>;

export const _parseAsync: (_defaults: ParserDefaults, _Err: ZodErrorClass) => $ParseAsync =
  (_defaults, _Err) => async (schema, value, _ctx) => {
    const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) result = await result;
    if (result.issues.length) {
      const e = new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
      Error.captureStackTrace(e, _parseAsync);
      throw e;
    }
    return result.value as core.output<typeof schema>;
  };

export const parseAsync: $ParseAsync = /* @__PURE__*/ _parseAsync({ async: true }, errors.$ZodError);

type $SafeParseAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<util.SafeParseResult<core.output<T>>>;

export const _safeParseAsync: (_defaults: ParserDefaults, _Err: ZodErrorClass) => $SafeParseAsync =
  (_defaults, _Err) => async (schema, value, _ctx) => {
    const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) result = await result;

    return result.issues.length
      ? {
          success: false,
          error: new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
        }
      : { success: true, data: result.value };
  };

export const safeParseAsync: $SafeParseAsync = /* @__PURE__*/ _safeParseAsync({ async: true }, errors.$ZodError);
