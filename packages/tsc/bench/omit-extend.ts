import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });
import { ZOD, ZOD3, generate } from "../generate.js";

console.log("╔═════════════════════╗");
console.log("║     Zod v3.24.2     ║");
console.log("╚═════════════════════╝");
await generate({
  ...ZOD,

  numSchemas: 0,
  numKeys: 0,

  imports: ["import * as z from 'zod3-24-2'"],
  custom: body(),
});

await $`pnpm run build:bench`;

console.log("╔═════════════════════╗");
console.log("║     Zod v3.24.3     ║");
console.log("╚═════════════════════╝");
await generate({
  ...ZOD,

  numSchemas: 0,
  numKeys: 0,

  imports: ["import * as z from 'zod3-24-3'"],
  custom: body(),
});

await $`pnpm run build:bench`;

console.log("╔════════════════╗");
console.log("║     Zod v4     ║");
console.log("╚════════════════╝");
await generate({
  ...ZOD,
  schemaType: "z.interface",
  numSchemas: 0,
  numKeys: 0,

  imports: ["import * as z from 'zod'"],
  custom: body(),
});

await $`pnpm run build:bench`;

export function body() {
  return `
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

export const d = c.omit({
  a: true,
  b: true,
  c: true,
});

export const e = d.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

export const f = e.omit({
  a: true,
  b: true,
  c: true,
});

export const g = f.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

export const h = g.omit({
  a: true,
  b: true,
  c: true,
});

export const i = h.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

export const j = i.omit({
  a: true,
  b: true,
  c: true,
});

export const k = j.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

export const l = k.omit({
  a: true,
  b: true,
  c: true,
});

export const m = l.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

export const n = m.omit({
  a: true,
  b: true,
  c: true,
});

export const o = n.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

export const p = o.omit({
  a: true,
  b: true,
  c: true,
});

export const q = p.extend({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});
`;
}
