import * as core from "@zod/core";
import type * as util from "@zod/core/util";

export const parse: <T extends core.$ZodType>(schema: T, value: unknown, _ctx?: core.ParseContext) => core.output<T> =
  /* @__PURE__ */ core._parse.bind({ Error: core.$ZodError });

export const safeParse: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext
) => util.SafeParseResult<core.output<T>> = /* @__PURE__ */ core._safeParse.bind({ Error: core.$ZodError });

export const parseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext
) => Promise<core.output<T>> = /* @__PURE__ */ core._parseAsync.bind({ Error: core.$ZodError });

export const safeParseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext
) => Promise<util.SafeParseResult<core.output<T>>> = /* @__PURE__ */ core._safeParseAsync.bind({
  Error: core.$ZodError,
});
