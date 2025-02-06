import * as base from "./base.js";
import type * as util from "./util.js";

///////////        METHODS       ///////////
// export function parse<T extends base.$ZodType>(schema: T, data: unknown, ctx?: base.$ParseContext): base.output<T> {
//   const result = schema._run(data, ctx ? { ...ctx } : undefined);
//   if (result instanceof Promise) {
//     throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
//   }

//   if (result.issues?.length) {
//     throw base.$finalize(result.issues!, ctx);
//   }
//   return result.value as base.output<T>;
// }

// export function safeParse<T extends base.$ZodType>(
//   schema: T,
//   data: unknown,
//   ctx?: base.$ParseContext
// ): util.SafeParseResult<base.output<T>> {
//   const result = schema._run(data, ctx);

//   if (result instanceof Promise)
//     throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
//   return (
//     base.$failed(result)
//       ? { success: false, error: base.$finalize(result.issues, ctx) }
//       : { success: true, data: result.value }
//   ) as util.SafeParseResult<base.output<T>>;
// }

// export async function parseAsync<T extends base.$ZodType>(
//   schema: T,
//   data: unknown,
//   ctx?: base.$ParseContext
// ): Promise<base.output<T>> {
//   let result = schema._run(data, ctx);
//   if (result instanceof Promise) result = await result;
//   if (base.$failed(result)) throw base.$finalize(result.issues);
//   return result.value as base.output<T>;
// }

// export async function safeParseAsync<T extends base.$ZodType>(
//   schema: T,
//   data: unknown,
//   ctx?: base.$ParseContext
// ): Promise<util.SafeParseResult<base.output<T>>> {
//   let result = schema._run(data, ctx);
//   if (result instanceof Promise) result = await result;
//   return (
//     base.$failed(result)
//       ? { success: false, error: base.$finalize(result.issues, ctx) }
//       : { success: true, data: result.value }
//   ) as util.SafeParseResult<base.output<T>>;
// }

///// PARSE B ////////
export function parse<T extends base.$ZodType>(schema: T, value: unknown, _ctx?: base.ParseContextB): base.output<T> {
  const ctx: base.ParseContextB = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._runB({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) {
    throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
  }
  if (result.issues.length) {
    throw base.$finalize(result.issues, ctx);
  }
  return result.value as base.output<T>;
}

export function safeParse<T extends base.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: base.ParseContextB
): util.SafeParseResult<base.output<T>> {
  const ctx: base.ParseContextB = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._runB({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) {
    throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
  }

  return (
    result.issues.length
      ? { success: false, error: base.$finalize(result.issues, ctx) }
      : { success: true, data: result.value }
  ) as util.SafeParseResult<base.output<T>>;
}

export async function parseAsync<T extends base.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: base.ParseContextB
): Promise<base.output<T>> {
  const ctx: base.ParseContextB = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._runB({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) result = await result;
  if (result.issues.length) throw base.$finalize(result.issues, ctx);
  return result.value as base.output<T>;
}

export async function safeParseAsync<T extends base.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: base.ParseContextB
): Promise<util.SafeParseResult<base.output<T>>> {
  const ctx: base.ParseContextB = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._runB({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) result = await result;
  return (
    result.issues.length
      ? { success: false, error: base.$finalize(result.issues, ctx) }
      : { success: true, data: result.value }
  ) as util.SafeParseResult<base.output<T>>;
}
