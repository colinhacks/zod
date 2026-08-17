/**
 * Per-instance own-property census across every schema type. `funcs` counts
 * own properties whose value is a distinct function per instance — i.e. a
 * closure allocated at construction time that could live on the prototype.
 *
 * V8 switches an object to dictionary mode past ~30 dynamically-added
 * properties, so `own` is also a proxy for whether instances pay for a
 * NameDictionary instead of inline slots.
 */
import * as z from "zod";
import { table } from "./harness.js";

function census(a: any, b: any): { own: number; zod: number; funcs: number; accessors: number } {
  let funcs = 0;
  let accessors = 0;
  for (const [objA, objB] of [
    [a, b],
    [a._zod, b._zod],
  ] as const) {
    for (const key of Reflect.ownKeys(objA)) {
      const d = Object.getOwnPropertyDescriptor(objA, key)!;
      const dB = objB && Object.getOwnPropertyDescriptor(objB, key);
      if (d.get || d.set) {
        if (dB && (d.get !== dB.get || d.set !== dB.set)) accessors++;
      } else if (typeof d.value === "function" && dB && d.value !== dB.value) {
        funcs++;
      }
    }
  }
  return { own: Reflect.ownKeys(a).length, zod: Reflect.ownKeys(a._zod).length, funcs, accessors };
}

const cases: Array<[string, () => any]> = [
  ["string", () => z.string()],
  ["number", () => z.number()],
  ["boolean", () => z.boolean()],
  ["bigint", () => z.bigint()],
  ["date", () => z.date()],
  ["file", () => z.file()],
  ["symbol", () => z.symbol()],
  ["literal", () => z.literal("a")],
  ["enum", () => z.enum(["a", "b"])],
  ["array", () => z.array(z.string())],
  ["object", () => z.object({ a: z.string() })],
  ["record", () => z.record(z.string(), z.string())],
  ["map", () => z.map(z.string(), z.string())],
  ["set", () => z.set(z.string())],
  ["tuple", () => z.tuple([z.string()])],
  ["union", () => z.union([z.string(), z.number()])],
  ["intersection", () => z.intersection(z.object({}), z.object({}))],
  ["optional", () => z.string().optional()],
  ["nullable", () => z.string().nullable()],
  ["default", () => z.string().default("x")],
  ["catch", () => z.string().catch("x")],
  ["pipe", () => z.string().pipe(z.string())],
  ["lazy", () => z.lazy(() => z.string())],
  ["promise", () => z.promise(z.string())],
  ["readonly", () => z.string().readonly()],
  ["success", () => z.success(z.string())],
  ["transform", () => z.transform((x) => x)],
  ["email (fmt)", () => z.email()],
  ["custom", () => z.custom(() => true)],
];

const rows = cases.map(([label, f]) => {
  const c = census(f(), f());
  return {
    schema: label,
    "own(inst)": c.own,
    "own(_zod)": c.zod,
    "per-inst fns": c.funcs,
    "per-inst accessors": c.accessors,
    "dict mode?": c.own > 30 ? "LIKELY" : "",
  };
});
rows.sort((a, b) => (b["per-inst fns"] as number) - (a["per-inst fns"] as number));
table(rows);

const total = rows.reduce((s, r) => s + (r["per-inst fns"] as number), 0);
console.log(`\ntotal per-instance closures across ${rows.length} types: ${total}`);
