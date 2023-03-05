import { z } from "./src";

const a = z.object({ a: z.string() });
const b = z.object({ a, b: z.string() });
const c = z.object({ a, b, c: z.string() });
const d = z.object({ a, b, c, d: z.string() });
const e = z.object({ a, b, c, d, e: z.string() });
const f = z.object({ a, b, c, d, e, f: z.string() });
const g = z.object({ a, b, c, d, e, f, g: z.string() });
const h = z.object({ a, b, c, d, e, f, g, h: z.string() });
const i = z.object({ a, b, c, d, e, f, g, h, i: z.string() });
const j = z.object({ a, b, c, d, e, f, g, h, i, j: z.string() });

export const arg = j.parse({});
