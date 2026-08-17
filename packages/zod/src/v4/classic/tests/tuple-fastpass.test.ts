// The codegen in `$ZodTupleJIT` is a second implementation of tuple parsing, so every shape here is built twice — once compiled, once forced onto the interpreter — and run over the whole input matrix. A divergence means classic Zod disagrees with `zod/mini`, with `jitless: true`, and with any runtime where `new Function` is unavailable.

import { describe, expect, test } from "vitest";
import * as z from "zod/v4";
import { globalConfig } from "zod/v4/core";

// Records object identity as `<ref N>`, so a dropped cycle is a diff rather than something a deep-equal check would wave through.
function ser(v: unknown): string {
  const seen = new Map<object, number>();
  let counter = 0;
  const walk = (x: unknown): string => {
    if (x === null) return "null";
    if (typeof x === "undefined") return "undef";
    if (typeof x !== "object") return typeof x === "string" ? JSON.stringify(x) : String(x);
    const prev = seen.get(x as object);
    if (prev !== undefined) return `<ref ${prev}>`;
    const id = counter++;
    seen.set(x as object, id);
    if (Array.isArray(x)) return `[${x.length}|${x.map(walk).join(",")}]`;
    return `{${Object.keys(x as object)
      .map((k) => `${k}:${walk((x as any)[k])}`)
      .join(",")}}`;
  };
  return walk(v);
}

function norm(r: any): string {
  if (r.success) return `OK ${ser(r.data)}`;
  return `ERR ${r.error.issues.map((i: any) => `${i.code}@[${i.path.join(".")}]${i.expected ?? ""}${i.origin ?? ""}`).join(" | ")}`;
}

function under<T>(jitless: boolean, fn: () => T): T {
  globalConfig.jitless = jitless;
  try {
    return fn();
  } finally {
    globalConfig.jitless = false;
  }
}

const shapes: Record<string, () => any> = {
  plain3: () => z.tuple([z.string(), z.number(), z.boolean()]),
  wide8: () =>
    z.tuple([z.string(), z.number(), z.boolean(), z.string(), z.number(), z.boolean(), z.string(), z.number()]),
  empty: () => z.tuple([]),
  optTail: () => z.tuple([z.string(), z.string().optional(), z.string().optional()]),
  optTailFailing: () =>
    z.tuple([
      z.string(),
      z.string().optional(),
      z
        .string()
        .optional()
        .refine(() => false),
    ]),
  optTailFailingMid: () =>
    z.tuple([
      z.string(),
      z
        .string()
        .optional()
        .refine(() => false),
      z.string().optional(),
    ]),
  withRest: () => z.tuple([z.string(), z.number()], z.string()),
  restOptTail: () => z.tuple([z.string(), z.number().optional()], z.string()),
  restFailing: () =>
    z.tuple(
      [z.string(), z.number()],
      z.string().refine(() => false, "restfail")
    ),
  nestedObj: () => z.tuple([z.object({ a: z.string() }), z.number()]),
  nestedTuple: () => z.tuple([z.string(), z.tuple([z.number(), z.number()])]),
  defaults: () => z.tuple([z.string().default("d"), z.number()]),
  transform: () => z.tuple([z.string().transform((s) => s.length), z.number()]),
  explicitUndef: () => z.tuple([z.string(), z.string().or(z.undefined())]),
  allOptional: () => z.tuple([z.string().optional(), z.string().optional()]),
  catchItem: () => z.tuple([z.string().catch("c"), z.number()]),
  checked: () => z.tuple([z.string(), z.number()]).refine((t: any) => t[1] > 0, "positive"),
};

const inputs: unknown[] = [
  ["a", 1, true],
  ["a", 1],
  ["a"],
  [],
  ["a", 1, true, "extra"],
  ["a", undefined, undefined],
  ["a", 1, undefined],
  [undefined, 1, true],
  ["a", "notnum", true],
  ["a", "notnum", 99],
  [1, "notnum", true],
  null,
  undefined,
  "notarray",
  {},
  { 0: "a", 1: 1, length: 2 },
  ["a", 1, "x", "y"],
  ["a", 1, 2, 3],
  ["a", 1, "x", 9, "z"],
  [{ a: "s" }, 1],
  [{ a: 1 }, 1],
  ["ok", [1, "bad"]],
  new Array(3),
  Object.assign(["a", 1, true], { extra: 1 }),
  ["a", "b", "c", "d", "e", "f", "g", "h"],
  ["a", 1, true, "b", 2, false, "c", 3],
];

describe("tuple fastpass — compiled and interpreted paths agree", () => {
  for (const [name, make] of Object.entries(shapes)) {
    test(name, () => {
      const jit = under(false, make);
      const interpreted = under(true, make);
      for (const input of inputs) {
        expect(norm(jit.safeParse(input)), `input: ${ser(input)}`).toBe(norm(interpreted.safeParse(input)));
      }
    });
  }
});

describe("tuple fastpass — cycles", () => {
  // `z.lazy` defers construction to the first parse, so the flag has to stay set across the parse, not just the build.
  const cyclic: Record<string, { schema: () => any; input: () => unknown }> = {
    "self-reference through an array": {
      schema: () => {
        const N: any = z.lazy(() => z.tuple([z.string(), z.array(N)]));
        return N;
      },
      input: () => {
        const a: any = ["a", []];
        a[1].push(a);
        return a;
      },
    },
    "direct self-reference": {
      schema: () => {
        const N: any = z.lazy(() => z.tuple([z.string(), z.union([N, z.null()])]));
        return N;
      },
      input: () => {
        const a: any = ["a", null];
        a[1] = a;
        return a;
      },
    },
    "shared node parsed twice": {
      schema: () => z.tuple([z.object({ v: z.string() }), z.object({ v: z.string() })]),
      input: () => {
        const shared = { v: "s" };
        return [shared, shared];
      },
    },
  };

  for (const [name, { schema, input }] of Object.entries(cyclic)) {
    test(name, () => {
      const run = (jitless: boolean) => under(jitless, () => norm(schema().safeParse(input())));
      expect(run(false)).toBe(run(true));
    });
  }

  test("a self-referential tuple keeps its identity in the output", () => {
    const N: any = z.lazy(() => z.tuple([z.string(), z.union([N, z.null()])]));
    const a: any = ["a", null];
    a[1] = a;
    const out: any = N.parse(a);
    expect(out[1]).toBe(out);
  });
});

test("async items fall through to the interpreter", async () => {
  const schema = z.tuple([z.string().refine(async (s) => s.length > 0)]);
  await expect(schema.parseAsync(["hi"])).resolves.toEqual(["hi"]);
});
