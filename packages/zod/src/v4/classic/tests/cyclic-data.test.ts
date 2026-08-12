import { expect, test } from "vitest";
import * as z from "zod/v4";

test("parses a self-referential object and preserves identity", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return Node;
    },
  });

  const input: any = { id: 1 };
  input.self = input;

  const result = Node.parse(input);
  expect(result.id).toBe(1);
  expect(result.self).toBe(result);
  expect(result).not.toBe(input);
});

test("validates a node against every schema that reaches it", () => {
  const A: any = z.object({
    x: z.string(),
    get b() {
      return B;
    },
  });
  const B: any = z.object({
    y: z.number(),
    get a() {
      return A;
    },
  });

  const input: any = { x: "s", y: 1 };
  input.b = input;
  input.a = input;

  const result = A.parse(input);
  expect(Object.keys(result).sort()).toEqual(["b", "x"]);
  expect(Object.keys(result.b).sort()).toEqual(["a", "y"]);
  expect(result.b.y).toBe(1);
  expect(result.b.a).toBe(result);

  const bad: any = { x: "s", y: "not a number" };
  bad.b = bad;
  bad.a = bad;
  expect(A.safeParse(bad).success).toBe(false);
});

test("breaks cycles through every container", () => {
  const cases: [string, () => { schema: any; input: any }][] = [
    [
      "array",
      () => {
        const S: any = z.object({
          id: z.number(),
          get kids() {
            return z.array(S);
          },
        });
        const a: any = { id: 1, kids: [] };
        a.kids.push(a);
        return { schema: S, input: a };
      },
    ],
    [
      "record",
      () => {
        const S: any = z.object({
          id: z.number(),
          get kids() {
            return z.record(z.string(), S);
          },
        });
        const a: any = { id: 1, kids: {} };
        a.kids.self = a;
        return { schema: S, input: a };
      },
    ],
    [
      "tuple",
      () => {
        const S: any = z.object({
          id: z.number(),
          get pair() {
            return z.tuple([z.number(), S]);
          },
        });
        const a: any = { id: 1 };
        a.pair = [1, a];
        return { schema: S, input: a };
      },
    ],
    [
      "set",
      () => {
        const S: any = z.object({
          id: z.number(),
          get peers() {
            return z.set(S);
          },
        });
        const a: any = { id: 1, peers: new Set() };
        a.peers.add(a);
        return { schema: S, input: a };
      },
    ],
    [
      "map",
      () => {
        const S: any = z.object({
          id: z.number(),
          get links() {
            return z.map(z.string(), S);
          },
        });
        const a: any = { id: 1, links: new Map() };
        a.links.set("s", a);
        return { schema: S, input: a };
      },
    ],
    [
      "union",
      () => {
        const S: any = z.object({
          id: z.number(),
          get self() {
            return z.union([z.string(), S]);
          },
        });
        const a: any = { id: 1 };
        a.self = a;
        return { schema: S, input: a };
      },
    ],
    [
      "discriminated union",
      () => {
        const S: any = z.discriminatedUnion("kind", [
          z.object({ kind: z.literal("leaf"), v: z.number() }),
          z.object({
            kind: z.literal("branch"),
            get next() {
              return S;
            },
          }),
        ]);
        const a: any = { kind: "branch" };
        a.next = a;
        return { schema: S, input: a };
      },
    ],
    [
      "lazy",
      () => {
        const S: any = z.object({ id: z.number(), self: z.lazy(() => S) });
        const a: any = { id: 1 };
        a.self = a;
        return { schema: S, input: a };
      },
    ],
    [
      "mutual recursion five hops apart",
      () => {
        const A: any = z.object({
          get b() {
            return B;
          },
        });
        const B: any = z.object({
          get c() {
            return C;
          },
        });
        const C: any = z.object({
          get d() {
            return D;
          },
        });
        const D: any = z.object({
          get e() {
            return E;
          },
        });
        const E: any = z.object({
          get a() {
            return A;
          },
        });
        const a: any = {};
        a.b = { c: { d: { e: { a } } } };
        return { schema: A, input: a };
      },
    ],
  ];

  for (const [name, build] of cases) {
    for (const jitless of [false, true]) {
      const { schema, input } = build();
      expect(() => schema.parse(input, { jitless }), `${name} (jitless: ${jitless})`).not.toThrow();
    }
  }
});

test("checks run once per node and never against a half-built object", () => {
  const seen: number[] = [];
  const Node: any = z
    .object({
      id: z.number(),
      get self() {
        return Node;
      },
    })
    .refine((value: any) => {
      seen.push(Object.keys(value).length);
      return true;
    });

  const input: any = { id: 1 };
  input.self = input;
  Node.parse(input);

  expect(seen).toEqual([2]);
});

test("reports a failing check inside a cycle", () => {
  const Node: any = z
    .object({
      id: z.number(),
      get self() {
        return Node;
      },
    })
    .refine((value: any) => value.id > 100, "too small");

  const input: any = { id: 1 };
  input.self = input;
  expect(Node.safeParse(input).success).toBe(false);
});

test("reports an invalid value inside a cycle once, at its own path", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return Node;
    },
  });

  const input: any = { id: "nope" };
  input.self = input;

  const result = Node.safeParse(input);
  expect(result.success).toBe(false);
  expect(result.error!.issues).toHaveLength(1);
  expect(result.error!.issues[0].path).toEqual(["id"]);
});

test("rejects a cycle that closes through a transform", () => {
  const Inner: any = z.object({
    name: z.string(),
    get self() {
      return Wrapped;
    },
  });
  const Wrapped: any = Inner.transform((value: any) => ({ wrapped: value }));

  const input: any = { name: "x" };
  input.self = input;

  expect(() => Wrapped.parse(input)).toThrow(/reference cycle/);
});

test("leaves a transform that is not on the cycle alone", () => {
  const Node: any = z.object({
    n: z.number().transform((value: number) => value * 2),
    get self() {
      return Node;
    },
  });

  const input: any = { n: 21 };
  input.self = input;

  const result = Node.parse(input);
  expect(result.n).toBe(42);
  expect(result.self).toBe(result);
});

test("encodes through a cycle", () => {
  const Stringified = z.codec(z.string(), z.number(), {
    decode: (value) => Number(value),
    encode: (value) => String(value),
  });
  const Node: any = z.object({
    n: Stringified,
    get self() {
      return Node;
    },
  });

  const input: any = { n: 5 };
  input.self = input;

  const result: any = z.encode(Node, input);
  expect(result.n).toBe("5");
  expect(result.self).toBe(result);
});

test("keeps separate parses independent", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return Node;
    },
  });

  const input: any = { id: 1 };
  input.self = input;

  const first = Node.parse(input);
  const second = Node.parse(input);
  expect(first).not.toBe(second);
  expect(first.self).toBe(first);
  expect(second.self).toBe(second);

  const bad: any = { id: "x" };
  bad.self = bad;
  expect(Node.safeParse(bad).success).toBe(false);
  expect(Node.safeParse(input).success).toBe(true);
});

test("parses a cycle asynchronously", async () => {
  const Node: any = z.object({
    id: z.number().refine(async (value: number) => value > 0),
    get self() {
      return Node;
    },
  });

  const input: any = { id: 1 };
  input.self = input;

  const result = await Node.parseAsync(input);
  expect(result.self).toBe(result);

  const bad: any = { id: -1 };
  bad.self = bad;
  expect((await Node.safeParseAsync(bad)).success).toBe(false);
});

test("a non-recursive schema still copies a shared reference twice", () => {
  const Leaf = z.object({ v: z.number() });
  const Pair = z.object({ a: Leaf, b: Leaf });

  const shared = { v: 1 };
  const result = Pair.parse({ a: shared, b: shared });

  expect(result.a).not.toBe(result.b);
  expect(result.a.v).toBe(1);
  expect(result.b.v).toBe(1);
});

test("a recursive schema shares one output node per input node", () => {
  const Node: any = z.object({
    v: z.number(),
    get kids() {
      return z.array(Node);
    },
  });

  const shared: any = { v: 1, kids: [] };
  const result = Node.parse({ v: 0, kids: [shared, shared] });

  expect(result.kids[0]).toBe(result.kids[1]);
});

test("sync and async agree on a shared reference", async () => {
  const build = (asyncCheck: boolean) => {
    const Node: any = z.object({
      v: asyncCheck ? z.number().refine(async (n: number) => n >= 0) : z.number(),
      get kids() {
        return z.array(Node);
      },
    });
    return Node;
  };

  const shared: any = { v: 1, kids: [] };
  const input = { v: 0, kids: [shared, shared] };

  const syncResult = build(false).parse(input);
  const asyncResult = await build(true).parseAsync(input);

  expect(syncResult.kids[0]).toBe(syncResult.kids[1]);
  expect(asyncResult.kids[0]).toBe(asyncResult.kids[1]);
});
