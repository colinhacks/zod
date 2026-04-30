import * as core from "./core.js";
import * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import * as util from "./util.js";

export type $ZodErrorClass = { new (issues: errors.$ZodIssue[]): errors.$ZodError };
type $ParseParams = { callee?: util.AnyFunc; Err?: $ZodErrorClass };

function finalizeParams(callee: util.AnyFunc, params: $ParseParams | undefined): $ParseParams {
  return params?.Err ? { callee: params.callee ?? callee, Err: params.Err } : { callee: params?.callee ?? callee };
}

///////////        METHODS       ///////////
export type $Parse = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>,
  _params?: $ParseParams
) => core.output<T>;

export const _parse: (_Err: $ZodErrorClass) => $Parse = (_Err) => {
  const fn: $Parse = (schema, value, _ctx, _params) => {
    const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new core.$ZodAsyncError();
    }
    if (result.issues.length) {
      const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
      util.captureStackTrace(e, _params?.callee ?? fn);
      throw e;
    }
    return result.value as core.output<typeof schema>;
  };
  return fn;
};

export const parse: $Parse = /* @__PURE__*/ _parse(errors.$ZodRealError);

export type $ParseAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>,
  _params?: $ParseParams
) => Promise<core.output<T>>;

export const _parseAsync: (_Err: $ZodErrorClass) => $ParseAsync = (_Err) => {
  const fn: $ParseAsync = async (schema, value, _ctx, params) => {
    const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) result = await result;
    if (result.issues.length) {
      const e = new (params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
      util.captureStackTrace(e, params?.callee ?? fn);
      throw e;
    }
    return result.value as core.output<typeof schema>;
  };
  return fn;
};

export const parseAsync: $ParseAsync = /* @__PURE__*/ _parseAsync(errors.$ZodRealError);

export type $SafeParse = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => util.SafeParseResult<core.output<T>>;

export const _safeParse: (_Err: $ZodErrorClass) => $SafeParse = (_Err) => (schema, value, _ctx) => {
  const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new core.$ZodAsyncError();
  }

  return result.issues.length
    ? {
        success: false,
        error: new (_Err ?? errors.$ZodError)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.value } as any);
};
export const safeParse: $SafeParse = /* @__PURE__*/ _safeParse(errors.$ZodRealError);

export type $SafeParseAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<util.SafeParseResult<core.output<T>>>;

export const _safeParseAsync: (_Err: $ZodErrorClass) => $SafeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) result = await result;

  return result.issues.length
    ? {
        success: false,
        error: new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.value } as any);
};

export const safeParseAsync: $SafeParseAsync = /* @__PURE__*/ _safeParseAsync(errors.$ZodRealError);

// Codec functions
export type $Encode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>,
  _params?: $ParseParams
) => core.input<T>;

export const _encode: (_Err: $ZodErrorClass) => $Encode = (_Err) => {
  const parse = _parse(_Err);
  const fn: $Encode = (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" as const } : { direction: "backward" as const };
    return parse(schema, value, ctx as any, finalizeParams(fn, _params)) as any;
  };
  return fn;
};

export const encode: $Encode = /* @__PURE__*/ _encode(errors.$ZodRealError);

export type $Decode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.input<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>,
  _params?: $ParseParams
) => core.output<T>;

export const _decode: (_Err: $ZodErrorClass) => $Decode = (_Err) => {
  const parse = _parse(_Err);
  const fn: $Decode = (schema, value, _ctx, _params) => {
    return parse(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};

export const decode: $Decode = /* @__PURE__*/ _decode(errors.$ZodRealError);

export type $EncodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>,
  _params?: $ParseParams
) => Promise<core.input<T>>;

export const _encodeAsync: (_Err: $ZodErrorClass) => $EncodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn: $EncodeAsync = async (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" as const } : { direction: "backward" as const };
    return parseAsync(schema, value, ctx as any, finalizeParams(fn, _params)) as any;
  };
  return fn;
};

export const encodeAsync: $EncodeAsync = /* @__PURE__*/ _encodeAsync(errors.$ZodRealError);

export type $DecodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.input<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>,
  _params?: $ParseParams
) => Promise<core.output<T>>;

export const _decodeAsync: (_Err: $ZodErrorClass) => $DecodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn: $DecodeAsync = async (schema, value, _ctx, _params) => {
    return parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};

export const decodeAsync: $DecodeAsync = /* @__PURE__*/ _decodeAsync(errors.$ZodRealError);

export type $SafeEncode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => util.SafeParseResult<core.input<T>>;

export const _safeEncode: (_Err: $ZodErrorClass) => $SafeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" as const } : { direction: "backward" as const };
  return _safeParse(_Err)(schema, value, ctx as any) as any;
};

export const safeEncode: $SafeEncode = /* @__PURE__*/ _safeEncode(errors.$ZodRealError);

export type $SafeDecode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.input<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => util.SafeParseResult<core.output<T>>;

export const _safeDecode: (_Err: $ZodErrorClass) => $SafeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};

export const safeDecode: $SafeDecode = /* @__PURE__*/ _safeDecode(errors.$ZodRealError);

export type $SafeEncodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<util.SafeParseResult<core.input<T>>>;

export const _safeEncodeAsync: (_Err: $ZodErrorClass) => $SafeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" as const } : { direction: "backward" as const };
  return _safeParseAsync(_Err)(schema, value, ctx as any) as any;
};

export const safeEncodeAsync: $SafeEncodeAsync = /* @__PURE__*/ _safeEncodeAsync(errors.$ZodRealError);

export type $SafeDecodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.input<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<util.SafeParseResult<core.output<T>>>;

export const _safeDecodeAsync: (_Err: $ZodErrorClass) => $SafeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};

export const safeDecodeAsync: $SafeDecodeAsync = /* @__PURE__*/ _safeDecodeAsync(errors.$ZodRealError);
