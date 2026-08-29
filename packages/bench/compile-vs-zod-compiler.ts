import { spawnSync } from "node:child_process";
import * as z from "zod";
import { jit } from "zod-compiler/jit";
import { ZodCompileUnsupportedError, compile } from "zod/v4/core";

// z.compile() against zod-compiler (github.com/gajus/zod-compiler), the third-party AOT compiler for zod 4 schemas. Its `jit()` entry runs the same codegen the build plugin emits, in-process through `new Function`, so this is a like-for-like runtime comparison: both compilers see the same schema object and the same zod internals. Method is the one `compile-matrix.ts` uses — interleaved rounds, best of N, inputs through an array load, results escaped — and correctness is checked across all three engines before anything is timed.
//
// Two contract differences matter when reading the table. zod-compiler validates in place and returns the input container by reference for arrays, tuples, sets, maps, records and strict objects (a stripping `z.object()` is rebuilt), where zod — compiled or not — allocates a fresh one every time. And it defers building the `ZodError` until `.error` is read, so the invalid section times the bare verdict and the forced error read separately.

interface Case {
  group: string;
  name: string;
  make: () => z.ZodType;
  inputs: unknown[];
  invalid?: unknown[] | undefined;
}

const cases: Case[] = [];
const add = (group: string, name: string, make: () => z.ZodType, input: unknown, invalid?: unknown[]) =>
  cases.push({ group, name, make, inputs: [input], invalid });
// inputs cycle through the pool so a dispatch bench hits every branch
const addRotating = (group: string, name: string, make: () => z.ZodType, inputs: unknown[]) =>
  cases.push({ group, name, make, inputs });

// --- primitives ---
add("primitive", "string", () => z.string(), "hello world", [42]);
add("primitive", "string min/max", () => z.string().min(3).max(64), "hello world", ["ab"]);
add("primitive", "number int + range", () => z.number().int().min(0).max(1000), 500, [1.5]);
add("primitive", "enum (4)", () => z.enum(["a", "b", "c", "d"]), "c", ["e"]);

// --- string formats ---
add("string", "email", () => z.email(), "user@example.com", ["not-email"]);
add("string", "uuid", () => z.uuid(), "550e8400-e29b-41d4-a716-446655440000", ["nope"]);
add("string", "url", () => z.url(), "https://example.com/a/b?c=1", ["nope"]);
add("string", "trim + toLowerCase", () => z.string().trim().toLowerCase(), "  MiXeD Case  ");

// --- objects ---
const flat = { a: "x", b: 1, c: true, d: "y", e: 2 };
const flatShape = () => ({ a: z.string(), b: z.number(), c: z.boolean(), d: z.string(), e: z.number() });
add("object", "flat (5 keys)", () => z.object(flatShape()), flat, [{ ...flat, e: "2" }]);
add("object", "strict (5 keys)", () => z.strictObject(flatShape()), flat, [{ ...flat, extra: 1 }]);

// zod-compiler's own "medium object" fixture, plus its invalid, wrong-shape and overposted variants
const user = () =>
  z.object({
    username: z.string().min(3).max(20),
    email: z.email(),
    password: z.string().min(8),
    age: z.number().int().positive(),
    role: z.enum(["user", "admin"]),
    newsletter: z.boolean(),
    referral: z.string().optional(),
  });
const validUser = {
  username: "alice_dev",
  email: "alice@example.com",
  password: "securepass123",
  age: 28,
  role: "user",
  newsletter: true,
  referral: "bob",
};
const invalidUser = {
  username: "ab",
  email: "not-email",
  password: "short",
  age: -1,
  role: "superadmin",
  newsletter: "yes",
};
add("object", "user (7 keys, checks)", user, validUser, [invalidUser, { ...validUser, newsletter: "yes" }]);
add("object", "user, extra keys stripped", user, { ...validUser, __extra: "x", internalId: 9001, is_admin: true });

add(
  "object",
  "strict DB row",
  () =>
    z.strictObject({
      id: z.uuid(),
      title: z.string().min(1).max(200),
      status: z.enum(["draft", "active", "archived"]),
      rate: z.number().nullable(),
      isDefault: z.boolean(),
      createdAt: z.date(),
    }),
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Senior Engineer",
    status: "active",
    rate: 120.5,
    isDefault: false,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  }
);

const moltarInput = {
  number: 1,
  negNumber: -1,
  maxNumber: Number.MAX_VALUE,
  string: "string",
  longString: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  boolean: true,
  deeplyNested: { foo: "bar", num: 1, bool: false },
};
add(
  "object",
  "nested (moltar)",
  () =>
    z.object({
      number: z.number(),
      negNumber: z.number(),
      maxNumber: z.number(),
      string: z.string(),
      longString: z.string(),
      boolean: z.boolean(),
      deeplyNested: z.object({ foo: z.string(), num: z.number(), bool: z.boolean() }),
    }),
  moltarInput,
  [{ ...moltarInput, deeplyNested: { foo: "bar", num: "1", bool: false } }]
);
add(
  "object",
  "optional keys",
  () => z.object({ a: z.string(), b: z.string().optional(), c: z.number().optional(), d: z.boolean().optional() }),
  { a: "x", c: 3 }
);
add("object", "defaults", () => z.object({ a: z.string().default("d"), b: z.number().default(7), c: z.boolean() }), {
  c: true,
});
add(
  "object",
  "wide (20 keys)",
  () => z.object(Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, z.string()]))) as z.ZodType,
  Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, "v"]))
);

// --- collections ---
const nums = Array.from({ length: 100 }, (_, i) => i);
add("collection", "array<number> x100", () => z.array(z.number()), nums, [[...nums.slice(0, 99), "99"]]);
add(
  "collection",
  "array<object> x50",
  () => z.array(z.object({ id: z.number(), name: z.string() })),
  Array.from({ length: 50 }, (_, i) => ({ id: i, name: `n${i}` }))
);
add("collection", "tuple", () => z.tuple([z.string(), z.number().int(), z.boolean()]), ["hello", 42, true]);
add("collection", "record<string, number> x20", () => z.record(z.string(), z.number()), {
  ...Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, i])),
});
add(
  "collection",
  "set<string> x20",
  () => z.set(z.string().min(1)).min(1).max(100),
  new Set(Array.from({ length: 20 }, (_, i) => `item_${i}`))
);
add(
  "collection",
  "map<string, number> x20",
  () => z.map(z.string().min(1), z.number().int().nonnegative()),
  new Map(Array.from({ length: 20 }, (_, i) => [`key_${i}`, i]))
);

// --- unions ---
const events = [
  { type: "click", x: 100, y: 200, target: "button#submit" },
  { type: "scroll", direction: "down", delta: 120 },
  { type: "keypress", key: "Enter", modifiers: ["ctrl", "shift"] },
  { type: "focus", elementId: "field-email", tabIndex: 3 },
  { type: "blur", elementId: "field-email" },
  { type: "submit", formId: "checkout", fields: ["email", "card"] },
  { type: "resize", width: 1920, height: 1080 },
  { type: "drag", fromX: 0, fromY: 0, toX: 50, toY: 75 },
];
const eventShapes = () => [
  z.object({ type: z.literal("click"), x: z.number().int(), y: z.number().int(), target: z.string().min(1) }),
  z.object({ type: z.literal("scroll"), direction: z.enum(["up", "down"]), delta: z.number().positive() }),
  z.object({ type: z.literal("keypress"), key: z.string().min(1), modifiers: z.array(z.string()) }),
  z.object({ type: z.literal("focus"), elementId: z.string().min(1), tabIndex: z.number().int() }),
  z.object({ type: z.literal("blur"), elementId: z.string().min(1) }),
  z.object({ type: z.literal("submit"), formId: z.string().min(1), fields: z.array(z.string()) }),
  z.object({ type: z.literal("resize"), width: z.number().positive(), height: z.number().positive() }),
  z.object({
    type: z.literal("drag"),
    fromX: z.number().int(),
    fromY: z.number().int(),
    toX: z.number().int(),
    toY: z.number().int(),
  }),
];
add("union", "discriminated (3)", () => z.discriminatedUnion("type", eventShapes().slice(0, 3) as any), events[0], [
  { type: "hover" },
]);
addRotating("union", "discriminated (8, rotating)", () => z.discriminatedUnion("type", eventShapes() as any), events);
addRotating("union", "plain tagged union (8, rotating)", () => z.union(eventShapes()), events);
add(
  "union",
  "objects (3, last match)",
  () => z.union([z.object({ a: z.string() }), z.object({ b: z.number() }), z.object({ c: z.boolean() })]),
  { c: true }
);

// --- refinements / transforms / intersections ---
add("refine", "refine", () => z.number().refine((n) => n > 0), 5, [-1]);
add("refine", "transform", () => z.string().transform((s) => s.length), "hello");
add(
  "refine",
  "object + refine",
  () => z.object({ a: z.number(), b: z.number() }).refine((o) => o.a < o.b),
  { a: 1, b: 2 },
  [{ a: 2, b: 1 }]
);
add("refine", "pipe", () => z.string().min(1).pipe(z.string().max(100)), "hello world");
add(
  "intersect",
  "disjoint objects",
  () =>
    z.intersection(
      z.object({ username: z.string().min(3).max(20), email: z.email(), password: z.string().min(8) }),
      z.object({
        age: z.number().int().positive(),
        role: z.enum(["user", "admin"]),
        newsletter: z.boolean(),
        referral: z.string().optional(),
      })
    ),
  validUser,
  [invalidUser]
);

// --- large payloads (zod-compiler's "large object" and "deeply nested" fixtures) ---
const item = (i: number) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
  tags: ["tag1", "tag2"],
  published: true,
  category: "tech",
  metadata: { createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z", views: i * 100 },
});
const apiResponse = () =>
  z.object({
    status: z.enum(["success", "error"]),
    data: z
      .object({
        items: z.array(
          z.object({
            id: z.number().int().positive(),
            title: z.string().min(1).max(200),
            description: z.string().max(2000).optional(),
            tags: z.array(z.string().min(1)).max(10),
            published: z.boolean(),
            category: z.enum(["tech", "science", "art", "music", "sports"]),
            metadata: z.object({ createdAt: z.string(), updatedAt: z.string(), views: z.number().int().nonnegative() }),
          })
        ),
        total: z.number().int().nonnegative(),
        page: z.number().int().positive(),
        pageSize: z.number().int().positive(),
        hasMore: z.boolean(),
      })
      .optional(),
    error: z.object({ code: z.string(), message: z.string() }).optional(),
  });
const response = (n: number) => ({
  status: "success",
  data: { items: Array.from({ length: n }, (_, i) => item(i)), total: 100, page: 1, pageSize: n, hasMore: true },
});
const badResponse = (n: number) => {
  const r = response(n);
  r.data.items[n - 1].metadata.views = -1;
  return r;
};
add("large", "api response (10 items)", apiResponse, response(10), [badResponse(10)]);
add("large", "api response (100 items)", apiResponse, response(100), [badResponse(100)]);

const widget = () =>
  z.object({
    id: z.number().int().positive(),
    label: z.string().min(1).max(80),
    visible: z.boolean(),
    weight: z.number(),
  });
const panel = (child: () => z.ZodType) => () =>
  z.object({ title: z.string().min(1), a: child(), b: child(), c: child() });
const deepLayout = () => {
  const p4 = panel(panel(panel(panel(widget))));
  return z.object({ name: z.string().min(1), header: p4(), body: p4(), footer: p4() });
};
let nextId = 0;
const widgetData = () => {
  nextId++;
  return { id: nextId, label: `widget-${nextId}`, visible: nextId % 2 === 0, weight: nextId * 1.5 };
};
const panelData = (child: () => unknown, depth: number) => () => ({
  title: `panel-${depth}`,
  a: child(),
  b: child(),
  c: child(),
});
const p4Data = panelData(panelData(panelData(panelData(widgetData, 1), 2), 3), 4);
const deepInput = { name: "dashboard", header: p4Data(), body: p4Data(), footer: p4Data() };
add("large", "deeply nested (243 leaves)", deepLayout, deepInput);

// --- recursive (z.compile refuses these; zod-compiler compiles them) ---
const tree = (): z.ZodType => {
  const node: z.ZodType = z.object({ value: z.string().min(1), children: z.array(z.lazy(() => node)) });
  return node;
};
const makeTree = (depth: number, breadth: number): unknown =>
  depth <= 0
    ? { value: "leaf", children: [] }
    : { value: `node-d${depth}`, children: Array.from({ length: breadth }, () => makeTree(depth - 1, breadth)) };
add("recursive", "tree (7 nodes)", tree, makeTree(2, 2));
add("recursive", "tree (121 nodes)", tree, makeTree(4, 3));

// ---------------------------------------------------------------------------

function deepEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") {
    return Number.isNaN(a) && Number.isNaN(b);
  }
  if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every((v) => b.has(v));
  if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, v]) => deepEq(b.get(k), v));
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEq((a as any)[k], (b as any)[k]));
}

const ROUNDS = 15;

function timed(fn: () => void, iters: number): number {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) fn();
  return Number(process.hrtime.bigint() - start) / 1e6;
}

function calibrate(fn: () => void): number {
  let iters = 64;
  for (;;) {
    const ms = timed(fn, iters);
    if (ms > 25 || iters > 4_000_000) return iters;
    iters = Math.max(iters * 2, Math.ceil((iters * 40) / Math.max(ms, 0.05)));
  }
}

/** Best-of-N ms per engine, every engine measured once per round so drift lands on all of them equally. */
function race(fns: (() => void)[], iters: number): number[] {
  for (const fn of fns) timed(fn, iters);
  const best = fns.map(() => Number.POSITIVE_INFINITY);
  for (let r = 0; r < ROUNDS; r++) {
    for (let i = 0; i < fns.length; i++) best[i] = Math.min(best[i], timed(fns[i], iters));
  }
  return best.map((ms) => (iters / ms) * 1000);
}

interface Row {
  group: string;
  name: string;
  kind: "valid" | "invalid" | "invalid+error";
  runtime: number;
  zc: number;
  gajus: number;
  zcStatus: string;
  gajusStatus: string;
  zcCompileMs: number;
  gajusCompileMs: number;
}

const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : n.toFixed(0);
const pad = (s: string, n: number) => s.padEnd(n);
const padL = (s: string, n: number) => s.padStart(n);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : Number.NaN;
};

function report(rows: Row[], problems: string[]): void {
  const sections: [Row["kind"], string][] = [
    ["valid", "valid input — safeParse, result consumed"],
    ["invalid", "invalid input — safeParse, only .success read"],
    ["invalid+error", "invalid input — safeParse, .error.issues read"],
  ];
  console.log();
  console.log(
    `z.compile() vs zod-compiler jit() — best of ${ROUNDS} interleaved rounds, ops/sec (${isolate ? "one process per schema" : "one shared process"})`
  );
  for (const [kind, title] of sections) {
    const section = rows.filter((r) => r.kind === kind);
    if (!section.length) continue;
    console.log();
    console.log(title);
    console.log(
      `${pad("group", 11)}${pad("schema", 32)}${padL("runtime", 10)}${padL("z.compile", 11)}${padL("zod-comp.", 11)}${padL("zc/rt", 8)}${padL("gajus/rt", 9)}${padL("gajus/zc", 9)}  status (z.compile / zod-compiler)`
    );
    console.log("-".repeat(132));
    let lastGroup = "";
    for (const r of section) {
      console.log(
        `${pad(r.group === lastGroup ? "" : r.group, 11)}${pad(r.name, 32)}${padL(fmt(r.runtime), 10)}${padL(fmt(r.zc), 11)}${padL(fmt(r.gajus), 11)}${padL(`${(r.zc / r.runtime).toFixed(2)}x`, 8)}${padL(`${(r.gajus / r.runtime).toFixed(2)}x`, 9)}${padL(`${(r.gajus / r.zc).toFixed(2)}x`, 9)}  ${r.zcStatus} / ${r.gajusStatus}`
      );
      lastGroup = r.group;
    }
    console.log("-".repeat(132));
    const both = section.filter((r) => r.zcStatus === "compiled" && r.gajusStatus === "compiled");
    console.log(
      `${section.length} rows, ${both.length} compiled by both — median z.compile ${median(section.map((r) => r.zc / r.runtime)).toFixed(2)}x, zod-compiler ${median(section.map((r) => r.gajus / r.runtime)).toFixed(2)}x; zod-compiler/z.compile median ${median(both.map((r) => r.gajus / r.zc)).toFixed(2)}x over rows both compiled`
    );
  }
  const valid = rows.filter((r) => r.kind === "valid");
  if (valid.length) {
    console.log();
    console.log(
      `one-time compile cost (ms, best of 5 fresh instances): z.compile median ${median(valid.map((r) => r.zcCompileMs)).toFixed(3)}, zod-compiler median ${median(valid.map((r) => r.gajusCompileMs)).toFixed(3)}; slowest z.compile ${Math.max(...valid.map((r) => r.zcCompileMs)).toFixed(2)}, slowest zod-compiler ${Math.max(...valid.map((r) => r.gajusCompileMs)).toFixed(2)}`
    );
  }
  if (problems.length) {
    console.log();
    console.log("PROBLEMS:");
    for (const p of problems) console.log(`  ${p}`);
  }
  console.log();
}

const arg = process.argv[2];
const isolate = arg === "--isolate";
const filter = isolate ? undefined : arg;
const selected = filter
  ? cases.filter((c) => {
      const id = `${c.group}/${c.name}`;
      return filter.includes("/") ? id === filter : id.includes(filter);
    })
  : cases;

const rows: Row[] = [];
const problems: string[] = [];

if (!filter && isolate) {
  for (const c of cases) {
    const id = `${c.group}/${c.name}`;
    const child = spawnSync(process.argv[0], [...process.execArgv, process.argv[1], id], {
      encoding: "utf8",
      env: { ...process.env, ZOD_BENCH_CHILD: "1" },
    });
    const lines = child.stdout?.split("\n").filter((l) => l.startsWith("ROW ")) ?? [];
    if (lines.length) for (const line of lines) rows.push(JSON.parse(line.slice(4)));
    else
      problems.push(
        `${id}: child produced no result${child.stderr ? ` (${child.stderr.trim().split("\n").pop()})` : ""}`
      );
  }
  report(rows, problems);
  process.exit(0);
}

// see compile-matrix.ts: a dead result lets V8 delete the parse, and an un-escaped one gets stack-allocated
let sink = 0;
let escaped: unknown;

const pool64 = (inputs: unknown[]) => Array.from({ length: 64 }, (_, i) => inputs[i % inputs.length]);

/** ms to compile a fresh instance, best of 5, so the table also shows what each compiler charges up front. */
function compileCost(make: () => z.ZodType, doCompile: (s: z.ZodType) => void): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 5; i++) {
    const s = make();
    const t0 = process.hrtime.bigint();
    doCompile(s);
    best = Math.min(best, Number(process.hrtime.bigint() - t0) / 1e6);
  }
  return best;
}

for (const c of selected) {
  const id = `${c.group}/${c.name}`;
  const runtime = c.make();

  let zcSchema: z.ZodType = runtime;
  let zcStatus = "compiled";
  try {
    zcSchema = compile(c.make(), { strict: true });
  } catch (err) {
    zcStatus = err instanceof ZodCompileUnsupportedError ? "fallback" : `refused: ${(err as Error).name}`;
  }

  // jit() installs compiled methods as own properties and swallows a refusal, so a missing own `safeParse` is the fallback signal; partial per-subschema delegation is invisible from outside and shows up in the numbers instead
  const gajusSchema = jit(c.make(), { eager: true });
  const gajusStatus = Object.prototype.hasOwnProperty.call(gajusSchema, "safeParse") ? "compiled" : "fallback";

  const zcCompileMs = zcStatus === "compiled" ? compileCost(c.make, (s) => compile(s, { strict: true })) : 0;
  const gajusCompileMs = gajusStatus === "compiled" ? compileCost(c.make, (s) => jit(s, { eager: true })) : 0;

  // correctness gate across all three engines, on every valid input and every invalid one
  let ok = true;
  for (const input of c.inputs) {
    const expected = runtime.safeParse(input);
    if (!expected.success) {
      problems.push(`${id}: input does not parse under the runtime`);
      ok = false;
      break;
    }
    for (const [label, s] of [
      ["z.compile", zcSchema],
      ["zod-compiler", gajusSchema],
    ] as const) {
      const got = s.safeParse(input);
      if (!got.success || !deepEq(got.data, expected.data)) {
        problems.push(`${id}: ${label} output differs from runtime`);
        ok = false;
      }
    }
  }
  for (const input of c.invalid ?? []) {
    const expected = runtime.safeParse(input);
    if (expected.success) {
      problems.push(`${id}: invalid input parses under the runtime`);
      ok = false;
      break;
    }
    for (const [label, s] of [
      ["z.compile", zcSchema],
      ["zod-compiler", gajusSchema],
    ] as const) {
      const got = s.safeParse(input);
      if (got.success) {
        problems.push(`${id}: ${label} accepts an input the runtime rejects`);
        ok = false;
      } else if (got.error.issues.length !== expected.error.issues.length) {
        problems.push(
          `${id}: ${label} reports ${got.error.issues.length} issues, runtime ${expected.error.issues.length}`
        );
      }
    }
  }
  if (!ok) continue;

  const engines = [runtime, zcSchema, gajusSchema];
  const base = { group: c.group, name: c.name, zcStatus, gajusStatus, zcCompileMs, gajusCompileMs };

  {
    const pool = pool64(c.inputs);
    let idx = 0;
    const fns = engines.map((s) => () => {
      const r = s.safeParse(pool[idx++ & 63]);
      sink += r.success ? 1 : 0;
      escaped = r;
    });
    const [rt, zc, gajus] = race(fns, calibrate(fns[0]));
    rows.push({ ...base, kind: "valid", runtime: rt, zc, gajus });
  }

  if (c.invalid) {
    const pool = pool64(c.invalid);
    let idx = 0;
    const verdict = engines.map((s) => () => {
      const r = s.safeParse(pool[idx++ & 63]);
      sink += r.success ? 1 : 0;
      escaped = r;
    });
    const withError = engines.map((s) => () => {
      const r = s.safeParse(pool[idx++ & 63]);
      sink += r.success ? 1 : r.error.issues.length;
      escaped = r;
    });
    const [rt, zc, gajus] = race(verdict, calibrate(verdict[0]));
    rows.push({ ...base, kind: "invalid", runtime: rt, zc, gajus });
    const [rt2, zc2, gajus2] = race(withError, calibrate(withError[0]));
    rows.push({ ...base, kind: "invalid+error", runtime: rt2, zc: zc2, gajus: gajus2 });
  }
}

if (process.env.ZOD_BENCH_CHILD === "1") {
  for (const r of rows) console.log(`ROW ${JSON.stringify(r)}`);
  process.exit(0);
}

report(rows, problems);
console.log(`(sink ${sink}${escaped === undefined ? "" : ""})`);
