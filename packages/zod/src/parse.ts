import * as core from "@zod/core";
import { ZodError } from "./errors.js";

export type ZodSafeParseResult<T> = ZodSafeParseSuccess<T> | ZodSafeParseError<T>;
export type ZodSafeParseSuccess<T> = { success: true; data: T; error?: never };
export type ZodSafeParseError<T> = { success: false; data?: never; error: ZodError<T> };

const _parse = core._parse.bind({ Error: ZodError });
export const parse: <T extends core.$ZodType>(schema: T, value: unknown, _ctx?: core.ParseContext) => core.output<T> = _parse;

const _safeParse = core._safeParse.bind({ Error: ZodError });
export const safeParse: <T extends core.$ZodType>(schema: T, value: unknown, _ctx?: core.ParseContext) => ZodSafeParseResult<core.output<T>> = _safeParse as any;

const _parseAsync = core._parseAsync.bind({ Error: ZodError });
export const parseAsync: <T extends core.$ZodType>(schema: T, value: unknown, _ctx?: core.ParseContext) => Promise<core.output<T>> = _parseAsync;

const _safeParseAsync = core._safeParseAsync.bind({ Error: ZodError });
export const safeParseAsync: <T extends core.$ZodType>(schema: T, value: unknown, _ctx?: core.ParseContext) => Promise<ZodSafeParseResult<core.output<T>>> = _safeParseAsync as any;
