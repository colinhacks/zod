import * as z from "zod";
import * as zm from "zod/mini";
import { fmtBytes, measureStable, table } from "./harness.js";

const N = 20_000;

const cases: Array<[string, (i: number) => unknown]> = [
  ["z.string()", () => z.string()],
  ["z.number()", () => z.number()],
  ["z.boolean()", () => z.boolean()],
  ["z.literal('a')", () => z.literal("a")],
  ["z.string().min(1)", () => z.string().min(1)],
  ["z.string().min(1).max(5)", () => z.string().min(1).max(5)],
  ["z.string().optional()", () => z.string().optional()],
  ["z.email()", () => z.email()],
  ["z.uuid()", () => z.uuid()],
  ["z.iso.datetime()", () => z.iso.datetime()],
  ["z.array(z.string())", () => z.array(z.string())],
  ["z.enum(['a','b','c'])", () => z.enum(["a", "b", "c"])],
  ["z.object({}) empty", () => z.object({})],
  [
    "z.object() 3 keys",
    () =>
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.boolean(),
      }),
  ],
  [
    "z.object() 10 keys",
    () => {
      const shape: Record<string, z.ZodType> = {};
      for (let k = 0; k < 10; k++) shape[`k${k}`] = z.string();
      return z.object(shape);
    },
  ],
  [
    "z.object() 10 keys (shared leaf)",
    (() => {
      const leaf = z.string();
      return () => {
        const shape: Record<string, z.ZodType> = {};
        for (let k = 0; k < 10; k++) shape[`k${k}`] = leaf;
        return z.object(shape);
      };
    })(),
  ],
  ["z.union([str,num])", () => z.union([z.string(), z.number()])],
  [
    "z.discriminatedUnion 2",
    () =>
      z.discriminatedUnion("t", [
        z.object({ t: z.literal("a"), a: z.string() }),
        z.object({ t: z.literal("b"), b: z.number() }),
      ]),
  ],
  ["z.record(str, num)", () => z.record(z.string(), z.number())],
  ["z.tuple([str,num])", () => z.tuple([z.string(), z.number()])],
  ["z.lazy(() => str)", () => z.lazy(() => z.string())],
  ["z.string().refine(fn)", () => z.string().refine((s) => s.length > 0)],
  ["z.string().transform(fn)", () => z.string().transform((s) => s.length)],
  ["z.string().default('x')", () => z.string().default("x")],
  ["z.string().brand<'x'>()", () => z.string().brand<"x">()],
  ["z.string().nullable()", () => z.string().nullable()],
  ["z.pipe(str, num-ish)", () => z.string().pipe(z.string())],
  // mini variants for contrast (no method-chaining surface)
  ["mini z.string()", () => zm.string()],
  ["mini z.object() 3 keys", () => zm.object({ a: zm.string(), b: zm.number(), c: zm.boolean() })],
];

console.log(`per-instance retained heap, n=${N}\n`);

const rows = cases.map(([label, factory]) => {
  const m = measureStable(label, N, factory, 5);
  return { schema: label, bytes: m.bytesEach.toFixed(0), human: fmtBytes(m.bytesEach) };
});

table(rows);
