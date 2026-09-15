import { expect, test } from "vitest";

import * as z from "../../index.js";
import { compile, compileFn } from "../compile.js";

// Generative differential: random schemas over the compiled node types, a valid value for each, single corruptions of that value, and the assertion that the interpreter and the compiled schema agree on the verdict, the output, the issues and how often user callbacks ran. A fixture suite covers the compositions somebody wrote down; this covers the ones nobody did. Seeds are fixed, so a failure names the seed and the schema it built.

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Gen {
  schema: z.ZodType;
  desc: string;
  valid: () => unknown;
  // one corruption of a valid value; not always rejected (a loose object absorbs an extra key), and both sides must agree either way
  corrupt: (v: unknown) => unknown;
  // this node itself has no fast emitter and compiles through the runtime
  island: boolean;
}

interface Ctx {
  rand: () => number;
  // runs per generated callback, so the two-run bound holds for each one rather than for the sum
  calls: Map<number, number>;
  nextCallback: number;
}

function count(c: Ctx, id: number): void {
  c.calls.set(id, (c.calls.get(id) ?? 0) + 1);
}

const pick = <T>(c: Ctx, xs: readonly T[]): T => xs[Math.floor(c.rand() * xs.length)]!;
const int = (c: Ctx, lo: number, hi: number): number => lo + Math.floor(c.rand() * (hi - lo + 1));
const JUNK = [42, "x", null, undefined, true, [], {}, -0, Number.NaN] as const;

function leaf(c: Ctx): Gen {
  switch (int(c, 0, 7)) {
    case 0: {
      const min = int(c, 0, 3);
      return {
        schema: z.string().min(min),
        desc: `string.min(${min})`,
        valid: () => "x".repeat(min + int(c, 0, 2)),
        corrupt: () => (c.rand() < 0.5 ? 42 : "x".repeat(Math.max(0, min - 1))),
        island: false,
      };
    }
    case 1:
      return {
        schema: z.email(),
        desc: "email",
        valid: () => "a@b.co",
        corrupt: () => (c.rand() < 0.5 ? "nope" : 1),
        island: false,
      };
    case 2: {
      const lo = int(c, -5, 0);
      const hi = int(c, 1, 5);
      return {
        schema: z.number().int().min(lo).max(hi),
        desc: `int[${lo},${hi}]`,
        valid: () => int(c, lo, hi),
        corrupt: () => pick(c, [hi + 1, lo - 1, 1.5, "1"]),
        island: false,
      };
    }
    case 3:
      return {
        schema: z.boolean(),
        desc: "boolean",
        valid: () => c.rand() < 0.5,
        corrupt: () => pick(c, ["true", 0, null]),
        island: false,
      };
    case 4: {
      const lit = pick(c, ["a", 1, true] as const);
      return {
        schema: z.literal(lit),
        desc: `literal(${JSON.stringify(lit)})`,
        valid: () => lit,
        corrupt: () => pick(c, ["b", 2, false]),
        island: false,
      };
    }
    case 5:
      return {
        schema: z.enum(["a", "b", "c"]),
        desc: "enum",
        valid: () => pick(c, ["a", "b", "c"]),
        corrupt: () => pick(c, ["d", 2, null]),
        island: false,
      };
    case 6: {
      const id = c.nextCallback++;
      return {
        schema: z.number().superRefine((v, ctx) => {
          count(c, id);
          if (v < 0) ctx.addIssue({ code: "custom", message: "negative" });
        }),
        desc: "number.superRefine",
        valid: () => int(c, 0, 9),
        corrupt: () => pick(c, [-1, "x"]),
        island: false,
      };
    }
    default: {
      const id = c.nextCallback++;
      return {
        schema: z.string().transform((s) => {
          count(c, id);
          return s.length;
        }),
        desc: "string.transform",
        valid: () => "y".repeat(int(c, 0, 3)),
        corrupt: () => 42,
        island: false,
      };
    }
  }
}

function wrap(c: Ctx, inner: Gen): Gen {
  switch (int(c, 0, 4)) {
    case 0:
      return {
        ...inner,
        schema: inner.schema.optional(),
        desc: `${inner.desc}.optional`,
        valid: () => (c.rand() < 0.3 ? undefined : inner.valid()),
        island: false,
      };
    case 1:
      return {
        ...inner,
        schema: inner.schema.nullable(),
        desc: `${inner.desc}.nullable`,
        valid: () => (c.rand() < 0.3 ? null : inner.valid()),
        island: false,
      };
    case 2: {
      const dflt = inner.valid();
      return {
        ...inner,
        schema: inner.schema.default(dflt as never),
        desc: `${inner.desc}.default`,
        valid: () => (c.rand() < 0.3 ? undefined : inner.valid()),
        island: false,
      };
    }
    case 3:
      return { ...inner, schema: inner.schema.readonly(), desc: `${inner.desc}.readonly`, island: false };
    default:
      return {
        ...inner,
        schema: inner.schema.optional().nonoptional(),
        desc: `${inner.desc}.optional.nonoptional`,
        corrupt: (v) => (c.rand() < 0.5 ? undefined : inner.corrupt(v)),
        island: false,
      };
  }
}

function container(c: Ctx, depth: number): Gen {
  const child = () => gen(c, depth - 1);
  switch (int(c, 0, 8)) {
    case 0:
    case 1: {
      const n = int(c, 1, 4);
      const entries = Array.from({ length: n }, (_, i) => [`k${i}`, child(), c.rand() < 0.3] as const);
      const shape = Object.fromEntries(entries.map(([k, g, opt]) => [k, opt ? g.schema.optional() : g.schema]));
      const mode = pick(c, ["plain", "strict", "loose", "catchall"] as const);
      const schema =
        mode === "strict"
          ? z.strictObject(shape)
          : mode === "loose"
            ? z.looseObject(shape)
            : mode === "catchall"
              ? z.object(shape).catchall(z.number())
              : z.object(shape);
      const valid = () => {
        const o: Record<string, unknown> = {};
        for (const [k, g, opt] of entries) if (!opt || c.rand() < 0.6) o[k] = g.valid();
        if (mode === "catchall" && c.rand() < 0.5) o.extra = 1;
        return o;
      };
      return {
        schema,
        desc: `${mode}{${entries.map(([k, g, opt]) => `${k}${opt ? "?" : ""}:${g.desc}`).join(",")}}`,
        valid,
        corrupt: (v) => {
          if (typeof v !== "object" || v === null) return v;
          const o = { ...(v as Record<string, unknown>) };
          const [k, g, opt] = pick(c, entries);
          switch (int(c, 0, 3)) {
            case 0:
              o[k] = g.corrupt(k in o ? o[k] : g.valid());
              break;
            case 1:
              if (opt) o[k] = g.corrupt(g.valid());
              else delete o[k];
              break;
            case 2:
              o.extra = "e";
              break;
            default:
              return 42;
          }
          return o;
        },
        island: false,
      };
    }
    case 2: {
      const g = child();
      const min = int(c, 0, 2);
      return {
        schema: z.array(g.schema).min(min),
        desc: `array(${g.desc}).min(${min})`,
        valid: () => Array.from({ length: min + int(c, 0, 2) }, () => g.valid()),
        corrupt: (v) => {
          if (!Array.isArray(v)) return v;
          const a = [...v];
          if (a.length && c.rand() < 0.6) a[int(c, 0, a.length - 1)] = g.corrupt(a[0]);
          else if (min > 0) a.length = min - 1;
          else return 42;
          return a;
        },
        island: false,
      };
    }
    case 3: {
      const items = Array.from({ length: int(c, 1, 3) }, child);
      const rest = c.rand() < 0.4 ? child() : null;
      const schema = rest
        ? z.tuple(items.map((g) => g.schema) as [z.ZodType, ...z.ZodType[]], rest.schema)
        : z.tuple(items.map((g) => g.schema) as [z.ZodType, ...z.ZodType[]]);
      return {
        schema,
        desc: `tuple(${items.map((g) => g.desc).join(",")}${rest ? `,...${rest.desc}` : ""})`,
        valid: () => [
          ...items.map((g) => g.valid()),
          ...(rest ? Array.from({ length: int(c, 0, 2) }, () => rest.valid()) : []),
        ],
        corrupt: (v) => {
          if (!Array.isArray(v)) return v;
          const a = [...v];
          const i = int(c, 0, items.length - 1);
          if (c.rand() < 0.6) a[i] = items[i]!.corrupt(a[i]);
          else if (c.rand() < 0.5) a.push("extra");
          else a.length = i;
          return a;
        },
        island: false,
      };
    }
    case 4: {
      const g = child();
      const enumKeys = c.rand() < 0.4;
      const schema = enumKeys ? z.record(z.enum(["a", "b"]), g.schema) : z.record(z.string(), g.schema);
      return {
        schema,
        desc: `record(${enumKeys ? "enum" : "string"},${g.desc})`,
        valid: () =>
          enumKeys
            ? { a: g.valid(), b: g.valid() }
            : Object.fromEntries(Array.from({ length: int(c, 0, 3) }, (_, i) => [`r${i}`, g.valid()])),
        corrupt: (v) => {
          if (typeof v !== "object" || v === null) return v;
          const o = { ...(v as Record<string, unknown>) };
          const keys = Object.keys(o);
          if (keys.length && c.rand() < 0.6) o[pick(c, keys)] = g.corrupt(o[keys[0]!]);
          else if (enumKeys) o.z = g.valid();
          else return 42;
          return o;
        },
        island: false,
      };
    }
    case 5: {
      const options = Array.from({ length: int(c, 2, 3) }, child);
      return {
        schema: z.union(options.map((g) => g.schema) as [z.ZodType, z.ZodType, ...z.ZodType[]]),
        desc: `union(${options.map((g) => g.desc).join("|")})`,
        valid: () => pick(c, options).valid(),
        corrupt: (v) => pick(c, options).corrupt(v),
        island: false,
      };
    }
    case 6: {
      const branches = Array.from({ length: int(c, 2, 3) }, (_, i) => [i, child()] as const);
      return {
        schema: z.discriminatedUnion(
          "t",
          branches.map(([i, g]) => z.object({ t: z.literal(`b${i}`), v: g.schema })) as [
            z.ZodObject<{ t: z.ZodLiteral<string>; v: z.ZodType }>,
            ...z.ZodObject<{ t: z.ZodLiteral<string>; v: z.ZodType }>[],
          ]
        ),
        desc: `dunion(${branches.map(([, g]) => g.desc).join("|")})`,
        valid: () => {
          const [i, g] = pick(c, branches);
          return { t: `b${i}`, v: g.valid() };
        },
        corrupt: (v) => {
          if (typeof v !== "object" || v === null) return v;
          const o = { ...(v as { t: string; v: unknown }) };
          const branch = branches.find(([i]) => `b${i}` === o.t);
          if (branch && c.rand() < 0.6) o.v = branch[1].corrupt(o.v);
          else o.t = "nope";
          return o;
        },
        island: false,
      };
    }
    case 7: {
      const min = int(c, 1, 3);
      return {
        schema: z.string().pipe(z.string().min(min)),
        desc: `string.pipe(min(${min}))`,
        valid: () => "p".repeat(min + int(c, 0, 1)),
        corrupt: () => (c.rand() < 0.5 ? "p".repeat(min - 1) : 7),
        island: false,
      };
    }
    default: {
      // map and set: the compiled result still has to agree
      const g = child();
      if (c.rand() < 0.5) {
        return {
          schema: z.map(z.string(), g.schema),
          desc: `map(string,${g.desc})`,
          valid: () => new Map(Array.from({ length: int(c, 0, 2) }, (_, i) => [`m${i}`, g.valid()])),
          corrupt: (v) => {
            if (!(v instanceof Map)) return v;
            const m = new Map(v);
            if (m.size && c.rand() < 0.7) m.set("m0", g.corrupt(m.get("m0")));
            else return [];
            return m;
          },
          island: true,
        };
      }
      return {
        schema: z.set(g.schema),
        desc: `set(${g.desc})`,
        valid: () => new Set(Array.from({ length: int(c, 0, 2) }, () => g.valid())),
        corrupt: (v) => {
          if (!(v instanceof Set)) return v;
          const s = new Set(v);
          if (c.rand() < 0.7) s.add(g.corrupt(g.valid()));
          else return {};
          return s;
        },
        island: true,
      };
    }
  }
}

function gen(c: Ctx, depth: number): Gen {
  if (depth === 0) return leaf(c);
  const r = c.rand();
  if (r < 0.25) return leaf(c);
  if (r < 0.4) return wrap(c, gen(c, depth - 1));
  return container(c, depth);
}

function attempt<T>(fn: () => T): { value?: T; threw?: string } {
  try {
    return { value: fn() };
  } catch (err) {
    return { threw: (err as Error)?.constructor?.name || "Error" };
  }
}

function describe(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v instanceof Map ? { $map: [...v] } : v instanceof Set ? { $set: [...v] } : v === undefined ? "$undefined" : v
  );
}

// own-key order and undefined-valued-vs-absent keys, which toStrictEqual does not see
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Reflect.ownKeys(value).map((k) => [k, shape((value as Record<PropertyKey, unknown>)[k])]);
  }
  return value;
}

const SEEDS = 400;

test("random schemas parse identically through the interpreter and the compiler", () => {
  // every failing seed is collected, so one run names all of them
  const failures: string[] = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    try {
      checkSeed(seed);
    } catch (err) {
      failures.push((err as Error).message.split("\n")[0]!);
    }
  }
  expect(failures).toEqual([]);
});

function checkSeed(seed: number): void {
  {
    const c: Ctx = { rand: mulberry32(seed), calls: new Map(), nextCallback: 0 };
    const g = gen(c, 3);
    const compiled = compile(g.schema);
    const inputs = [g.valid(), g.corrupt(g.valid()), g.corrupt(g.corrupt(g.valid())), pick(c, JUNK)];
    for (const input of inputs) {
      const label = `seed ${seed} ${g.desc} input ${describe(input)}`;
      c.calls.clear();
      const a = attempt(() => g.schema.safeParse(input));
      const runtimeCalls = new Map(c.calls);
      c.calls.clear();
      const b = attempt(() => compiled.safeParse(input));
      const compiledCalls = new Map(c.calls);
      expect(b.threw, `${label}: throw`).toBe(a.threw);
      if (a.threw) continue;
      expect(b.value!.success, `${label}: verdict`).toBe(a.value!.success);
      if (a.value!.success) {
        expect(b.value!.data, `${label}: data`).toStrictEqual(a.value!.data);
        expect(shape(b.value!.data), `${label}: key order`).toEqual(shape(a.value!.data));
      } else {
        expect(b.value!.error!.issues, `${label}: issues`).toEqual(a.value!.error!.issues);
      }
      // every callback the interpreter reaches, the compiled schema reaches too; the fast pass runs it at most once and the runtime re-parse at most once more
      for (const id of new Set([...compiledCalls.keys(), ...runtimeCalls.keys()])) {
        const n = compiledCalls.get(id) ?? 0;
        const r = runtimeCalls.get(id) ?? 0;
        expect(n, `${label}: callback ${id} ran ${n} vs ${r}`).toBeGreaterThanOrEqual(r);
        expect(n, `${label}: callback ${id} ran ${n} vs ${r}`).toBeLessThanOrEqual(2 * r);
      }
    }
    expect(() => compileFn(g.schema), `${g.desc}: compile refused`).not.toThrow();
  }
}
