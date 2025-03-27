import * as core from "./core.js";
import * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import * as util from "./util.js";

///////////        METHODS       ///////////
type ParseThis = void | { Error?: { new (issues: errors.$ZodIssue[]): errors.$ZodError } };
export function _parse<T extends schemas.$ZodType>(
  this: ParseThis | void,
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
): core.output<T> {
  const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new core.$ZodAsyncError();
  }
  if (result.issues.length) {
    throw new (this?.Error ?? errors.$ZodError)(
      result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))
    );
  }
  return result.value as core.output<T>;
}
export const parse: typeof _parse = /* @__PURE__*/ _parse.bind({ Error: errors.$ZodError });

export function _safeParse<T extends schemas.$ZodType>(
  this: ParseThis,
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
): util.SafeParseResult<core.output<T>> {
  const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new core.$ZodAsyncError();
  }

  return (
    result.issues.length
      ? {
          success: false,
          error: new (this?.Error ?? errors.$ZodError)(
            result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))
          ),
        }
      : { success: true, data: result.value }
  ) as util.SafeParseResult<core.output<T>>;
}
export const safeParse: typeof _safeParse = /* @__PURE__*/ _safeParse.bind({ Error: errors.$ZodError });

export async function _parseAsync<T extends schemas.$ZodType>(
  this: ParseThis,
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
): Promise<core.output<T>> {
  const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) result = await result;
  if (result.issues.length) {
    throw new (this?.Error ?? errors.$ZodError)(
      result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))
    );
  }
  return result.value as core.output<T>;
}
export const parseAsync: typeof _parseAsync = /* @__PURE__*/ _parseAsync.bind({ Error: errors.$ZodError });

export async function _safeParseAsync<T extends schemas.$ZodType>(
  this: ParseThis,
  schema: T,
  value: unknown,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
): Promise<util.SafeParseResult<core.output<T>>> {
  const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) result = await result;

  if (result.issues.length) {
    return {
      success: false,
      error: new (this?.Error ?? errors.$ZodError)(
        result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))
      ),
    };
  }
  return { success: true, data: result.value };
}
export const safeParseAsync: typeof _safeParseAsync = /* @__PURE__*/ _safeParseAsync.bind({ Error: errors.$ZodError });
