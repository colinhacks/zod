import * as base from "./base.js";
import type * as util from "./util.js";

///////////        METHODS       ///////////

export function parse<T extends base.$ZodType>(schema: T, value: unknown, _ctx?: base.$ParseContext): base.output<T> {
  const ctx: base.$InternalParseContext = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) {
    throw new base.$ZodAsyncError();
  }
  if (result.issues.length) {
    throw new base.$ZodError(result.issues.map((iss) => base.finalizeIssue(iss, ctx)));
  }
  return result.value as base.output<T>;
}

export function safeParse<T extends base.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: base.$ParseContext
): util.SafeParseResult<base.output<T>> {
  const ctx: base.$InternalParseContext = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) {
    throw new base.$ZodAsyncError();
  }

  return (
    result.issues.length
      ? { success: false, error: new base.$ZodError(result.issues.map((iss) => base.finalizeIssue(iss, ctx))) }
      : { success: true, data: result.value }
  ) as util.SafeParseResult<base.output<T>>;
}

export async function parseAsync<T extends base.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: base.$ParseContext
): Promise<base.output<T>> {
  const ctx: base.$InternalParseContext = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) result = await result;
  if (result.issues.length) {
    throw new base.$ZodError(result.issues.map((iss) => base.finalizeIssue(iss, ctx)));
  }
  return result.value as base.output<T>;
}

export async function safeParseAsync<T extends base.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: base.$ParseContext
): Promise<util.SafeParseResult<base.output<T>>> {
  const ctx: base.$InternalParseContext = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) result = await result;

  if (result.issues.length) {
    return { success: false, error: new base.$ZodError(result.issues.map((iss) => base.finalizeIssue(iss, ctx))) };
  }
  return { success: true, data: result.value };
}
