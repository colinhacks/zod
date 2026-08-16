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

test("a cycle through .readonly() keeps the node intact", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return Node.readonly();
    },
  });

  const input: any = { id: 1 };
  input.self = input;

  // Freezing a node that is still being built would make its remaining keys fail to assign, silently, because generated code is not strict mode.
  const result = Node.parse(input);
  expect(Object.keys(result).sort()).toEqual(["id", "self"]);
  expect(result.self).toBe(result);
});

test("a cycle through z.intersection validates but does not mirror the graph", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return z.intersection(Node, z.object({ id: z.number() }));
    },
  });

  const input: any = { id: 7 };
  input.self = input;

  // The merged value is built after both sides are parsed, so it cannot be the object a back-edge already resolved to. Values are right, the graph is not.
  const result = Node.parse(input);
  expect(result.id).toBe(7);
  expect(result.self.id).toBe(7);
  expect(result.self).not.toBe(result);
  expect(result.self.self).toBeUndefined();

  const bad: any = { id: "nope" };
  bad.self = bad;
  expect(Node.safeParse(bad).success).toBe(false);
});

test("keeps two cycles and a shared node distinct in one input", () => {
  const Node: any = z.object({
    id: z.number(),
    get kids() {
      return z.array(Node);
    },
  });

  const shared: any = { id: 9, kids: [] };
  const root: any = { id: 0, kids: [shared, shared] };
  root.kids.push(root);

  const result = Node.parse(root);
  expect(result.kids[0]).toBe(result.kids[1]);
  expect(result.kids[2]).toBe(result);
});

test("closes a cycle through a Map key and a Set member", () => {
  const Keyed: any = z.object({
    id: z.number(),
    get keyed() {
      return z.map(Keyed, z.string());
    },
  });
  const k: any = { id: 1, keyed: new Map() };
  k.keyed.set(k, "v");
  const keyedOut = Keyed.parse(k);
  expect([...keyedOut.keyed.keys()][0]).toBe(keyedOut);

  const Peered: any = z.object({
    id: z.number(),
    get peers() {
      return z.set(Peered);
    },
  });
  const p: any = { id: 1, peers: new Set() };
  p.peers.add(p);
  const peeredOut = Peered.parse(p);
  expect([...peeredOut.peers][0]).toBe(peeredOut);
});

test("does not mutate the input, and tolerates a frozen one", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return Node;
    },
  });

  const input: any = { id: 1 };
  input.self = input;
  Object.freeze(input);

  const result = Node.parse(input);
  expect(result).not.toBe(input);
  expect(result.self).toBe(result);
  expect(Reflect.ownKeys(input)).toEqual(["id", "self"]);
});

test("keys identity on the schema, not just the input", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return Node.optional();
    },
  });
  const Partial: any = Node.partial();

  const input: any = { id: 1 };
  input.self = input;

  // `Partial` and `Node` are different schemas, so the root and the node its cycle points back to are different output objects. Same rule that lets one input node be validated against two schemas in mutual recursion.
  const result = Partial.parse(input);
  expect(result.self).not.toBe(result);
  expect(result.self.self).toBe(result.self);
  expect(result.id).toBe(1);
  expect(result.self.id).toBe(1);
});

test("keeps concurrent async parses of one schema independent", async () => {
  const Node: any = z.object({
    id: z.number().refine(async (n: number) => {
      await new Promise((r) => setTimeout(r, 5 + (n % 3)));
      return true;
    }),
    get self() {
      return Node;
    },
  });

  const make = (id: number) => {
    const o: any = { id };
    o.self = o;
    return o;
  };

  const [a, b, c] = await Promise.all([Node.parseAsync(make(1)), Node.parseAsync(make(2)), Node.parseAsync(make(3))]);

  expect([a.id, b.id, c.id]).toEqual([1, 2, 3]);
  expect(a.self).toBe(a);
  expect(b.self).toBe(b);
  expect(c.self).toBe(c);
});

test("runs checks once per reference, as it does without a cycle", () => {
  let calls = 0;
  const Node: any = z
    .object({
      id: z.number(),
      get kids() {
        return z.array(Node);
      },
    })
    .refine(() => {
      calls++;
      return true;
    });

  const shared: any = { id: 1, kids: [] };
  Node.parse({ id: 0, kids: [shared, shared] });

  // Memoization skips the container's parse, not the checks layered on it.
  expect(calls).toBe(3);
});

test("a schema wrapped at the root adds one node and no more", () => {
  const Node: any = z.object({
    id: z.number(),
    get self() {
      return Node.optional();
    },
  });

  const input: any = { id: 1 };
  input.self = input;

  // The root is keyed on the wrapper, everything under it on `Node`, so the graph closes one level down rather than at the root. It does not compound: stacking wrappers still yields exactly two nodes.
  const count = (root: any) => {
    const seen: any[] = [];
    let n = root;
    while (n && !seen.includes(n)) {
      seen.push(n);
      n = n.self;
    }
    return seen.length;
  };

  expect(count(Node.parse(input))).toBe(1);
  expect(count(Node.partial().parse(input))).toBe(2);
  expect(count(Node.partial().partial().parse(input))).toBe(2);
  expect(count(Node.extend({ extra: z.string().optional() }).parse(input))).toBe(2);
});

test("resolves a recursive reference once, however it is written", () => {
  // This is what bounds the above: core caches a shape getter and a lazy getter, so a getter returning a fresh clone still yields a finite schema graph rather than a new schema per node.
  let getterCalls = 0;
  const ViaGetter: any = z.object({
    id: z.number(),
    get self() {
      getterCalls++;
      return ViaGetter.partial();
    },
  });

  let lazyCalls = 0;
  const ViaLazy: any = z.object({
    id: z.number(),
    self: z.lazy(() => {
      lazyCalls++;
      return ViaLazy.partial();
    }),
  });

  const input: any = { id: 1 };
  input.self = input;

  expect(() => ViaGetter.parse(input)).not.toThrow();
  expect(() => ViaLazy.parse(input)).not.toThrow();
  expect(getterCalls).toBe(1);
  expect(lazyCalls).toBe(1);
});
