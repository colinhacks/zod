import * as z from "zod-mini";
// import type * as util from "zod-core/util";

const arg = z.object({
  /** testing! */
  a: z.string(),
  b: z.union([z.string(), z.undefined()]),
  c: z.optional(z.string()),
  d: z._default(z.string(), "bob"),
  "e?": z.string(),
});

type argOut = z.output<typeof arg>;
type argIn = z.input<typeof arg>;
