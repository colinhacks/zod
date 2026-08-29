// Randomized differential sweep for z.compile. Builds schemas from a grammar, throws generated inputs at both parsers, and compares success, output and issues exactly — plus the one property the fallback cannot rescue: that a bail-out inside a union is not read as a rejected branch.
//
//   pnpm dev scripts/compile-fuzz.ts            # default seed
//   pnpm dev scripts/compile-fuzz.ts 424242     # a specific seed, printed on any failure
//   ROUNDS=20000 pnpm dev scripts/compile-fuzz.ts
//
// Not wired into CI: it is a hunting tool, and a seed that finds something new should become a fixture in compile-differential.test.ts rather than a flaky test run.
import * as z from "zod";
import { INVALID, ZodCompileAsyncError, ZodCompileUnsupportedError, compile, compileFastpass } from "zod/v4/core";

// Seeded PRNG so a failure is reproducible from its seed alone.
let seed = Number(process.argv[2] ?? 12345);
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
};
const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)]!;
const chance = (p: number) => rnd() < p;

type Built = { schema: z.ZodType; gen: () => unknown };

const leaves: (() => Built)[] = [
  () => ({ schema: z.string(), gen: () => pick(["", "abc", "hello world", "  pad  "]) }),
  () => ({ schema: z.string().min(2).max(8), gen: () => pick(["a", "abc", "abcdefghij"]) }),
  () => ({ schema: z.string().trim(), gen: () => pick(["  x  ", "y"]) }),
  () => ({ schema: z.email(), gen: () => pick(["a@b.com", "nope"]) }),
  () => ({ schema: z.uuid(), gen: () => pick(["550e8400-e29b-41d4-a716-446655440000", "no"]) }),
  () => ({ schema: z.creditCard(), gen: () => pick(["4111111111111111", "4111111111111112"]) }),
  () => ({ schema: z.number(), gen: () => pick([0, -1, 3.5, Number.NaN, Number.POSITIVE_INFINITY]) }),
  () => ({ schema: z.number().int().min(0).max(10), gen: () => pick([0, 5, 11, -1, 2.5]) }),
  () => ({ schema: z.boolean(), gen: () => pick([true, false, "true"]) }),
  () => ({ schema: z.bigint(), gen: () => pick([1n, 0n, 1]) }),
  () => ({ schema: z.date(), gen: () => pick([new Date(0), new Date("nope")]) }),
  () => ({ schema: z.literal("lit"), gen: () => pick(["lit", "other"]) }),
  () => ({ schema: z.enum(["a", "b"]), gen: () => pick(["a", "b", "c"]) }),
  () => ({ schema: z.null(), gen: () => pick([null, undefined]) }),
  () => ({ schema: z.undefined(), gen: () => pick([undefined, null]) }),
  () => ({ schema: z.any(), gen: () => pick([1, "x", null, undefined]) }),
  () => ({ schema: z.unknown(), gen: () => pick([1, "x", undefined]) }),
  () => ({ schema: z.literal(Number.NaN), gen: () => pick([Number.NaN, 0, "NaN"]) }),
  () => ({ schema: z.coerce.number(), gen: () => pick(["42", 42, "x"]) }),
  () => ({ schema: z.coerce.string(), gen: () => pick([5, "s", true]) }),
  () => ({ schema: z.strictObject({}), gen: () => pick([{}, { extra: 1 }]) }),
  () => ({ schema: z.looseObject({}), gen: () => pick([{}, { extra: 1 }]) }),
  () => ({
    schema: z.looseRecord(z.enum(["a", "b"]), z.number()),
    gen: () => pick([{ a: 1, b: 2 }, { a: 1 }, { a: 1, b: 2, x: "k" }]),
  }),
  () => ({
    schema: (z as any).partialRecord(z.enum(["a", "b"]), z.number()),
    gen: () => pick([{ a: 1 }, { a: 1, b: 2 }, {}]),
  }),
  () => ({ schema: z.string().catch("fb"), gen: () => pick(["ok", 42, undefined]) }),
  () => ({ schema: z.string().min(2).catch("fb"), gen: () => pick(["ok", "a", 42]) }),
  () => ({ schema: z.int32(), gen: () => pick([1, 2 ** 31, 1.5, "3"]) }),
  () => ({ schema: z.number().multipleOf(0.5), gen: () => pick([1, 1.5, 1.25]) }),
  () => ({ schema: z.bigint().min(2n), gen: () => pick([1n, 5n, 5]) }),
  () => ({ schema: z.date().min(new Date(0)), gen: () => pick([new Date(1), new Date(-1), new Date("x")]) }),
  () => ({ schema: z.templateLiteral(["id_", z.string()]), gen: () => pick(["id_a", "b", 1]) }),
  () => ({ schema: z.stringbool(), gen: () => pick(["true", "false", "yes", 1]) }),
  () => ({ schema: z.string().readonly(), gen: () => pick(["s", 1]) }),
  () => ({ schema: z.success(z.string()), gen: () => pick(["s", 1]) }),
  () => ({ schema: z.set(z.number()), gen: () => pick([new Set([1, 2]), new Set(["a"]), [1]]) }),
  () => ({ schema: z.map(z.string(), z.number()), gen: () => pick([new Map([["a", 1]]), new Map([["a", "b"]]), {}]) }),
  () => ({
    schema: z.preprocess((v: any) => (typeof v === "string" ? v.trim() : v), z.string()),
    gen: () => pick(["  x  ", 1]),
  }),
  () => ({
    schema: z.xor([z.object({ a: z.string() }), z.object({ b: z.number() })]) as any,
    gen: () => pick([{ a: "x" }, { b: 1 }, {}]),
  }),
  () => ({
    schema: z.object({ [Symbol.for("s")]: z.string() } as any),
    gen: () => pick([{ [Symbol.for("s")]: "v" }, {}]),
  }),
];

function build(depth: number): Built {
  if (depth <= 0 || chance(0.35)) return pick(leaves)();

  const kind = pick([
    "object",
    "strictObject",
    "looseObject",
    "array",
    "tuple",
    "union",
    "du",
    "record",
    "optional",
    "nullable",
    "default",
    "prefault",
    "catch",
    "readonly",
    "refine",
    "transform",
    "pipe",
    "intersection",
    "nonoptional",
  ]);

  const inner = () => build(depth - 1);

  switch (kind) {
    case "object":
    case "strictObject":
    case "looseObject": {
      const n = 1 + Math.floor(rnd() * 3);
      const parts: [string, Built][] = [];
      for (let i = 0; i < n; i++) parts.push([`k${i}`, inner()]);
      const shape = Object.fromEntries(parts.map(([k, b]) => [k, b.schema]));
      const make = kind === "object" ? z.object : kind === "strictObject" ? z.strictObject : z.looseObject;
      return {
        schema: (make as any)(shape),
        gen: () => {
          const o: any = {};
          for (const [k, b] of parts) if (chance(0.85)) o[k] = b.gen();
          if (chance(0.25)) o.extra = "unknown";
          return o;
        },
      };
    }
    case "array": {
      const el = inner();
      return { schema: z.array(el.schema), gen: () => Array.from({ length: Math.floor(rnd() * 4) }, () => el.gen()) };
    }
    case "tuple": {
      const a = inner();
      const b = inner();
      return { schema: z.tuple([a.schema, b.schema]), gen: () => (chance(0.8) ? [a.gen(), b.gen()] : [a.gen()]) };
    }
    case "union": {
      const a = inner();
      const b = inner();
      return { schema: z.union([a.schema, b.schema]), gen: () => (chance(0.5) ? a.gen() : b.gen()) };
    }
    case "du": {
      const a = inner();
      return {
        schema: z.discriminatedUnion("t", [
          z.object({ t: z.literal("a"), v: a.schema }),
          z.object({ t: z.literal("b"), w: z.string() }),
        ]) as z.ZodType,
        gen: () => (chance(0.5) ? { t: "a", v: a.gen() } : { t: "b", w: "s" }),
      };
    }
    case "record": {
      const v = inner();
      const key = pick([z.string(), z.email(), z.string().min(2)]) as z.ZodType;
      return {
        schema: z.record(key as any, v.schema),
        gen: () => {
          const o: any = {};
          for (let i = 0; i < Math.floor(rnd() * 3); i++) o[chance(0.5) ? `a${i}@b.com` : `kk${i}`] = v.gen();
          return o;
        },
      };
    }
    case "intersection": {
      return {
        schema: z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() })),
        gen: () => ({ a: "x", b: chance(0.8) ? 1 : "no" }),
      };
    }
    case "optional": {
      const i = inner();
      return { schema: i.schema.optional(), gen: () => (chance(0.3) ? undefined : i.gen()) };
    }
    case "nullable": {
      const i = inner();
      return { schema: i.schema.nullable(), gen: () => (chance(0.3) ? null : i.gen()) };
    }
    case "nonoptional": {
      const i = inner();
      return { schema: i.schema.optional().nonoptional(), gen: () => (chance(0.2) ? undefined : i.gen()) };
    }
    case "default": {
      const i = inner();
      const d = i.gen();
      return { schema: i.schema.default(d as any), gen: () => (chance(0.35) ? undefined : i.gen()) };
    }
    case "prefault": {
      const i = inner();
      const d = i.gen();
      return { schema: i.schema.prefault(d as any), gen: () => (chance(0.35) ? undefined : i.gen()) };
    }
    case "catch": {
      const i = inner();
      const d = i.gen();
      return { schema: i.schema.catch(d as any), gen: () => i.gen() };
    }
    case "readonly": {
      const i = inner();
      return { schema: i.schema.readonly(), gen: i.gen };
    }
    case "refine": {
      const i = inner();
      // Must be a pure function of the value: a predicate that consulted the PRNG would answer differently on each parse and manufacture fake divergences.
      return { schema: i.schema.refine((v: any) => typeof v !== "string" || !v.startsWith("zz")), gen: i.gen };
    }
    case "transform": {
      const i = inner();
      return { schema: i.schema.transform((v: any) => ({ wrapped: v })) as z.ZodType, gen: i.gen };
    }
    case "pipe": {
      const i = inner();
      return { schema: i.schema.pipe(z.any()) as z.ZodType, gen: i.gen };
    }
  }
  return pick(leaves)();
}

// Structural equality that is strict about the things parity actually turns on: key order, absent vs undefined-valued keys, NaN, -0, frozenness.
function same(a: unknown, b: unknown, path = "$"): string | null {
  if (Object.is(a, b)) return null;
  if (typeof a !== typeof b) return `${path}: type ${typeof a} vs ${typeof b}`;
  if (a === null || b === null || typeof a !== "object") return `${path}: ${String(a)} vs ${String(b)}`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${path}: array-ness differs`;
  if (a instanceof Date && b instanceof Date) return Object.is(a.getTime(), b.getTime()) ? null : `${path}: date`;
  // Set and Map hold their entries in internal slots, so the ownKeys walk below sees `[]` for both and reports every pair equal. The grammar generates both, so without these arms that coverage is imaginary.
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set) || !(b instanceof Set)) return `${path}: only one is a Set`;
    if (a.size !== b.size) return `${path}: Set size ${a.size} vs ${b.size}`;
    const bv = [...b];
    const av = [...a];
    for (let i = 0; i < av.length; i++) {
      const r = same(av[i], bv[i], `${path}.«set»[${i}]`);
      if (r) return r;
    }
    return null;
  }
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map) || !(b instanceof Map)) return `${path}: only one is a Map`;
    if (a.size !== b.size) return `${path}: Map size ${a.size} vs ${b.size}`;
    const ae = [...a.entries()];
    const be = [...b.entries()];
    for (let i = 0; i < ae.length; i++) {
      const k = same(ae[i]![0], be[i]![0], `${path}.«mapkey»[${i}]`);
      if (k) return k;
      const v = same(ae[i]![1], be[i]![1], `${path}.«map»[${i}]`);
      if (v) return v;
    }
    return null;
  }
  if (Object.isFrozen(a) !== Object.isFrozen(b)) return `${path}: frozenness differs`;
  const ka = Reflect.ownKeys(a as object);
  const kb = Reflect.ownKeys(b as object);
  if (ka.length !== kb.length) return `${path}: keys [${ka.map(String)}] vs [${kb.map(String)}]`;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return `${path}: key order [${ka.map(String)}] vs [${kb.map(String)}]`;
    const r = same((a as any)[ka[i]!], (b as any)[kb[i]!], `${path}.${String(ka[i])}`);
    if (r) return r;
  }
  return null;
}

function describe(s: any, d = 0): string {
  if (d > 6 || !s?._zod?.def) return "?";
  const def = s._zod.def;
  const t = def.type;
  if (def.shape)
    return `${t}{${Object.entries(def.shape)
      .map(([k, v]) => `${k}:${describe(v, d + 1)}`)
      .join(",")}}`;
  if (def.element) return `${t}<${describe(def.element, d + 1)}>`;
  if (def.items) return `${t}[${def.items.map((i: any) => describe(i, d + 1)).join(",")}]`;
  if (def.options) return `${t}(${def.options.map((o: any) => describe(o, d + 1)).join("|")})`;
  if (def.keyType) return `${t}<${describe(def.keyType, d + 1)},${describe(def.valueType, d + 1)}>`;
  if (def.left) return `${t}(${describe(def.left, d + 1)}&${describe(def.right, d + 1)})`;
  if (def.in) return `${t}(${describe(def.in, d + 1)}->${describe(def.out, d + 1)})`;
  if (def.innerType) return `${t}(${describe(def.innerType, d + 1)})`;
  const checks = (def.checks ?? []).map((c: any) => c._zod?.def?.check ?? "?").join("+");
  return checks ? `${t}[${checks}]` : t;
}

/** JSON.stringify throws on BigInt and drops Symbols, Maps and Sets — none of which the grammar can avoid generating. */
function ser(v: unknown): string {
  return JSON.stringify(v, (_k, val) => {
    if (typeof val === "bigint") return `«bigint:${val}»`;
    if (typeof val === "symbol") return `«symbol:${String(val)}»`;
    if (val instanceof Map) return { "«map»": [...val.entries()] };
    if (val instanceof Set) return { "«set»": [...val.values()] };
    if (typeof val === "number" && Number.isNaN(val)) return "«NaN»";
    return val;
  });
}

const ROUNDS = Number(process.env.ROUNDS ?? 4000);
let compiled = 0;
let skipped = 0;
let checks = 0;
const failures: string[] = [];

for (let r = 0; r < ROUNDS && failures.length < 5; r++) {
  const startSeed = seed;
  const built = build(Number(process.env.DEPTH ?? 3));
  let fast: z.ZodType;
  try {
    // Strict: an unsupported schema must be classified as skipped, not silently compared against itself.
    fast = compile(built.schema, { strict: true }) as z.ZodType;
  } catch (e) {
    if (e instanceof ZodCompileUnsupportedError || e instanceof ZodCompileAsyncError) {
      skipped++;
      continue;
    }
    failures.push(`seed ${startSeed}: compile threw ${(e as Error).name}: ${(e as Error).message}`);
    continue;
  }
  compiled++;

  // Union soundness: a bail-out inside a union is read as a rejected branch, so a later branch answers and nothing ever returns INVALID for the wrapper to fall back on. This is the only place the fallback cannot rescue a wrong result.
  {
    const marker = Symbol("sentinel");
    let cu: z.ZodType | null = null;
    try {
      cu = compile(z.union([built.schema, z.any().transform(() => marker)]) as z.ZodType, {
        strict: true,
      }) as z.ZodType;
    } catch {
      cu = null;
    }
    if (cu) {
      for (let i = 0; i < 4; i++) {
        const input = built.gen();
        let accepts = false;
        try {
          accepts = built.schema.safeParse(input).success;
        } catch {
          continue;
        }
        if (!accepts) continue;
        let got: any;
        try {
          got = cu.safeParse(input);
        } catch {
          continue;
        }
        if (got.success && got.data === marker) {
          failures.push(
            `seed ${startSeed}: union picked the sentinel for accepted input ${ser(input)?.slice(0, 90)}\n    schema: ${describe(built.schema)}`
          );
          break;
        }
      }
    }
  }

  for (let i = 0; i < 6; i++) {
    const input = built.gen();
    let expected: any;
    let got: any;
    try {
      expected = built.schema.safeParse(input);
    } catch {
      continue; // runtime itself throws (e.g. cyclic); not a compiled-path question
    }
    try {
      got = fast.safeParse(input);
    } catch (e) {
      failures.push(`seed ${startSeed}: compiled threw ${(e as Error).name} where runtime returned`);
      break;
    }
    checks++;
    if (expected.success !== got.success) {
      let code = "";
      try {
        code = (compileFastpass(built.schema, { debug: true }) as any).code ?? "";
      } catch {}
      let branches = "";
      const opts = (built.schema._zod.def as any).options as any[] | undefined;
      if (opts) {
        branches = opts
          .map((o, oi) => {
            const rt = o.safeParse(input);
            let cp = "refused";
            try {
              const f = compileFastpass(o);
              const v = f(input);
              cp = v === INVALID ? "INVALID" : (ser(v)?.slice(0, 40) ?? "?");
            } catch (e) {
              cp = `refused(${(e as Error).name})`;
            }
            let bcode = "";
            try {
              bcode = ((compileFastpass(o, { debug: true }) as any).code ?? "")
                .split("\n")
                .map((l: string) => `          ${l}`)
                .join("\n");
            } catch {}
            const shape = (o._zod.def as any).shape;
            const shapeDesc = shape
              ? Object.entries(shape)
                  .map(
                    ([k, v]: any) => `${k}=${describe(v)} coerce=${!!v._zod.def.coerce} optin=${String(v._zod.optin)}`
                  )
                  .join(", ")
              : "";
            return `      branch${oi} ${describe(o)}\n        shape: ${shapeDesc}\n        runtime=${rt.success ? ser(rt.data)?.slice(0, 40) : "REJECT"} fastpath=${cp}\n${bcode}`;
          })
          .join("\n");
      }
      failures.push(
        `seed ${startSeed}: success ${expected.success} vs ${got.success} on ${ser(input)?.slice(0, 120)}\n${branches}\n` +
          `    schema: ${describe(built.schema)}\n` +
          `    issues: ${expected.success ? "-" : JSON.stringify(expected.error.issues).slice(0, 200)}\n` +
          `    code:\n${code
            .split("\n")
            .map((l: string) => `      ${l}`)
            .join("\n")}`
      );
      break;
    }
    if (expected.success) {
      const diff = same(expected.data, got.data);
      if (diff) {
        failures.push(`seed ${startSeed}: output differs (${diff}) on ${ser(input)?.slice(0, 120)}`);
        break;
      }
    } else {
      const e1 = ser(expected.error.issues);
      const e2 = ser(got.error.issues);
      if (e1 !== e2) {
        let at = 0;
        while (at < e1.length && e1[at] === e2[at]) at++;
        failures.push(
          `seed ${startSeed}: issues differ at char ${at} on ${ser(input)?.slice(0, 100)}\n    rt: ...${e1.slice(Math.max(0, at - 40), at + 90)}\n    cp: ...${e2.slice(Math.max(0, at - 40), at + 90)}`
        );
        break;
      }
    }
  }
}

console.log(`rounds=${ROUNDS} compiled=${compiled} skipped(unsupported)=${skipped} parseChecks=${checks}`);
if (failures.length) {
  console.log(`\n${failures.length} FAILURE(S):`);
  for (const f of failures) console.log(`  ${f}`);
  process.exit(1);
}
console.log("no divergences");
