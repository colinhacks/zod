import * as core from "@zod/core";
import { ZodError } from "./errors.js";

export type ZodSafeParseResult<T> = ZodSafeParseSuccess<T> | ZodSafeParseError<T>;
export type ZodSafeParseSuccess<T> = { success: true; data: T; error?: never };
export type ZodSafeParseError<T> = { success: false; data?: never; error: ZodError<T> };

export const parse: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => core.output<T> = /* @__PURE__ */ core._parse.bind({ Error: ZodError }) as any;

export const safeParse: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => ZodSafeParseResult<core.output<T>> = /* @__PURE__ */ core._safeParse.bind({ Error: ZodError }) as any;

export const parseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => Promise<core.output<T>> = /* @__PURE__ */ core._parseAsync.bind({ Error: ZodError }) as any;

export const safeParseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => Promise<ZodSafeParseResult<core.output<T>>> = /* @__PURE__ */ core._safeParseAsync.bind({
  Error: ZodError,
}) as any;
