import * as core from "@zod/core";
import { ZodError } from "./errors.js";

export type ZodSafeParseResult<T> = ZodSafeParseSuccess<T> | ZodSafeParseError<T>;
export type ZodSafeParseSuccess<T> = { success: true; data: T; error?: never };
export type ZodSafeParseError<T> = { success: false; data?: never; error: ZodError<T> };

///////////        METHODS       ///////////

export function parse<T extends core.$ZodType>(schema: T, value: unknown, _ctx?: core.$ParseContext): core.output<T> {
  const ctx: core.$InternalParseContext = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) {
    throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
  }
  if (result.issues.length) {
    throw new ZodError(result.issues.map((iss) => core.$finalize(iss, ctx)));
  }
  return result.value as core.output<T>;
}

export function safeParse<T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.$ParseContext
): ZodSafeParseResult<core.output<T>> {
  const ctx: core.$InternalParseContext = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) {
    throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
  }

  if (result.issues.length) {
    return { success: false, error: new ZodError(result.issues.map((iss) => core.$finalize(iss, ctx))) };
  }
  return { success: true, data: result.value };
}

export async function parseAsync<T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.$ParseContext
): Promise<core.output<T>> {
  const ctx: core.$InternalParseContext = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) result = await result;
  if (result.issues.length) {
    throw new ZodError(result.issues.map((iss) => core.$finalize(iss, ctx)));
  }
  return result.value as core.output<T>;
}

export async function safeParseAsync<T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.$ParseContext
): Promise<ZodSafeParseResult<core.output<T>>> {
  const ctx: core.$InternalParseContext = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._run({ value, issues: [], $payload: true }, ctx);
  if (result instanceof Promise) result = await result;

  if (result.issues.length) {
    return { success: false, error: new ZodError(result.issues.map((iss) => core.$finalize(iss, ctx))) };
  }
  return { success: true, data: result.value };
}
