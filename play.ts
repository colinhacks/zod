import * as z from "./packages/tsc/node_modules/zod4/dist/esm/index.js";

export const a = z.object({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

export const b = a.omit({
  a: true,
  b: true,
  c: true,
});

export const c = b.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});
