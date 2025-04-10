import * as core from "@zod/core";
import type { util } from "@zod/core";

export const parse: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => core.output<T> = /* @__PURE__ */ core._parse.bind({ Error: core.$ZodError });

export const safeParse: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => util.SafeParseResult<core.output<T>> = /* @__PURE__ */ core._safeParse.bind({ Error: core.$ZodError });

export const parseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => Promise<core.output<T>> = /* @__PURE__ */ core._parseAsync.bind({ Error: core.$ZodError });

export const safeParseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => Promise<util.SafeParseResult<core.output<T>>> = /* @__PURE__ */ core._safeParseAsync.bind({
  Error: core.$ZodError,
});
