# Parsing Cyclical Data

## Introduction

A **reference cycle** is a data structure where an object (directly or indirectly) contains a reference back to itself. These appear naturally in real-world data: a tree node that remembers its parent, a graph where nodes point to neighbors, or two entities like `User` and `Post` that reference each other.

```ts
const node: any = { id: 1 };
node.self = node; // direct self-reference

const a: any = { name: "alice" };
const b: any = { name: "bob" };
a.friend = b;
b.friend = a; // indirect cycle between two objects
```

### The v3 Limitation

In Zod v3, passing cyclical data into any schema — even through `safeParse` — caused an infinite recursion. The JavaScript call stack would eventually overflow, throwing a `RangeError` that `safeParse` could not catch because it originated outside Zod's own error handling. The v3 docs explicitly warned: ["passing cyclical data into Zod will cause an infinite loop"](https://zod.dev/api).

> **Note:** This was a separate concern from *recursive schemas* (schemas that reference themselves using `z.lazy()` or JavaScript getters), which have been supported since v3. The issue was specifically about recursive *input data* being fed into those schemas.

### Zod v4

Zod v4 eliminates this limitation entirely. Schemas can now safely parse input that contains reference cycles, and the output graph mirrors the structure of the input: [[1]](https://github.com/colinhacks/zod/pull/6387)

```ts
const Node = z.object({
  id: z.number(),
  get self() { return Node; },
});

const input: any = { id: 1 };
input.self = input; // cyclical!

const out = Node.parse(input); // ✅ no longer throws
out.self === out; // true — cycle is preserved in the output
```

## Basic Usage

The simplest cycle is a schema that can contain a reference to itself. Using a JavaScript getter allows the schema to reference itself by name before the variable is fully initialized:

```ts
const Node = z.object({
  id: z.number(),
  get self() { return Node; },
});

const input: any = { id: 1 };
input.self = input;

const out = Node.parse(input);
out.self === out; // true
```

Two things to note about the output: [[1]](https://github.com/colinhacks/zod/pull/6387)

1. **Cycles are preserved.** The reference from `out.self` back to `out` is maintained in the parsed output.
2. **The output is a deep clone.** `out !== input` — Zod still creates a new object during parsing. The cycle points to the *output* object, not back to the original input.

This means you can safely serialize or traverse the output (within cycle-aware tooling), and validation errors are still reported normally:

```ts
const bad: any = { id: "not-a-number" };
bad.self = bad;

Node.safeParse(bad).success; // false — validation error reported correctly
```

## How It Works

Zod v4 handles cyclical input through a **schema-aware memoization system**. Here is the high-level picture: [[1]](https://github.com/colinhacks/zod/pull/6387)

### Output Registration Before Descent

When a container schema (object, array, etc.) starts parsing, it immediately creates the output placeholder (e.g., `{}` for an object, `[]` for an array) and registers it in a memo table *before* parsing any child properties. If parsing later reaches the same input object through a back-edge — a reference that leads back to a node already on the parse stack — it finds the registered placeholder in the memo and returns that instead of recursing again.

### The Memo Key: `(schema, input)`

The memo table is keyed on **both the schema instance and the input object**, not on the input alone. This distinction is critical for correctness when the same input object is visited by multiple schemas (see [Mutual Recursion](#mutual-recursion)). Each `(schema, input)` pair gets its own independent output node and issue list.

### Back-Edges vs. Shared References

The memo also distinguishes between two kinds of revisits:

- **Back-edge (cycle):** The entry's issue list is `null` because the node is still being parsed. Zod returns the placeholder and marks the payload so that checks are skipped — the output isn't fully populated yet.
- **Shared reference (DAG):** The entry has a completed issue list. Zod returns the finished output and replays those issues at the current path.

### Recursive Schema Detection

Cycle tracking only activates for schemas that can actually re-enter themselves. An `isRecursive` function walks a schema's subtree once on first use and caches the result per schema instance. Non-recursive schemas have zero overhead from this feature: they skip the memo entirely, and in JIT mode they emit byte-identical generated code. [[1]](https://github.com/colinhacks/zod/pull/6387)

## Mutual Recursion

A particularly powerful consequence of keying the memo on `(schema, input)` is that **mutual recursion works correctly**: when the same input object is validated against two different schemas, each schema produces its own independently validated output. [[1]](https://github.com/colinhacks/zod/pull/6387)

```ts
const A = z.object({ x: z.string(), get b() { return B; } });
const B = z.object({ y: z.number(), get a() { return A; } });

const n: any = { x: "s", y: 1 };
n.b = n;
n.a = n;

const out = A.parse(n);

Object.keys(out);    // ["x", "b"]  — the A view
Object.keys(out.b);  // ["y", "a"]  — the B view, separately validated
out.b.a === out;     // true — cycle is preserved
```

Here the single input object `n` is visited twice: once as an `A` and once as a `B`. Because the memo is keyed on the schema, each visit produces a distinct output object with the keys that its own schema defines:

- `out` has `x` (string) and `b` (the B view) — only the keys `A` specifies.
- `out.b` has `y` (number) and `a` (the A view) — only the keys `B` specifies.
- The cycle closes: `out.b.a === out` (the `A` view's identity is preserved).

Validation errors are also schema-specific. If `n.y` is not a number, the error is reported on the `B` schema path, not on `A`.

```ts
const bad: any = { x: "s", y: "not-a-number" };
bad.b = bad;
bad.a = bad;

A.safeParse(bad).success; // false — y is invalid in the B view
```

## Supported Container Types

Cycle breaking is implemented for all of Zod's container types. Cycles can flow through any combination of these containers: [[1]](https://github.com/colinhacks/zod/pull/6387)

| Container | Example field type |
|---|---|
| `z.object()` | `get self() { return MySchema; }` |
| `z.array()` | `z.array(MySchema)` |
| `z.record()` | `z.record(z.string(), MySchema)` |
| `z.tuple()` | `z.tuple([z.number(), MySchema])` |
| `z.set()` | `z.set(MySchema)` |
| `z.map()` | `z.map(z.string(), MySchema)` |
| `z.union()` | `z.union([z.string(), MySchema])` |
| `z.discriminatedUnion()` | `z.discriminatedUnion("kind", [...])` |
| `z.lazy()` | `z.lazy(() => MySchema)` |

### Examples

**Array:**

```ts
const Node = z.object({
  id: z.number(),
  get children() { return z.array(Node); },
});

const root: any = { id: 1, children: [] };
root.children.push(root); // self-referential array

Node.parse(root); // ✅
```

**Record:**

```ts
const Node = z.object({
  id: z.number(),
  get links() { return z.record(z.string(), Node); },
});

const a: any = { id: 1, links: {} };
a.links.self = a;

Node.parse(a); // ✅
```

**Map:**

```ts
const Node = z.object({
  id: z.number(),
  get neighbors() { return z.map(z.string(), Node); },
});

const a: any = { id: 1, neighbors: new Map() };
a.neighbors.set("self", a);

Node.parse(a); // ✅
```

**Set:**

```ts
const Node = z.object({
  id: z.number(),
  get peers() { return z.set(Node); },
});

const a: any = { id: 1, peers: new Set() };
a.peers.add(a);

Node.parse(a); // ✅
```

**Discriminated union:**

```ts
const Tree = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("leaf"), value: z.number() }),
  z.object({
    kind: z.literal("branch"),
    get next() { return Tree; },
  }),
]);

const branch: any = { kind: "branch" };
branch.next = branch; // cycle

Tree.parse(branch); // ✅
```

**`z.lazy()`:**

```ts
const Node: z.ZodTypeAny = z.object({
  id: z.number(),
  self: z.lazy(() => Node),
});

const a: any = { id: 1 };
a.self = a;

Node.parse(a); // ✅
```

## Refinements and Checks

Refinements (`.refine()`, `.superRefine()`, `.check()`) work correctly with cyclical data, but with one important behavioral rule: **checks on a back-edge are skipped until the node is fully built**. [[1]](https://github.com/colinhacks/zod/pull/6387)

### Why back-edges skip checks

When a cycle is encountered, Zod returns the output placeholder for the node that is still being parsed. At that moment the output object exists but its properties haven't been set yet. Running a refinement against an empty `{}` would produce meaningless or incorrect results. So Zod defers: the checks for that node run exactly once, after all of its properties have been parsed, at the node's own location in the data.

### Checks run exactly once, on the complete object

```ts
const seen: number[] = [];

const Node = z
  .object({
    id: z.number(),
    get self() { return Node; },
  })
  .refine((value) => {
    seen.push(Object.keys(value).length);
    return true;
  });

const input: any = { id: 1 };
input.self = input;

Node.parse(input);

seen; // [2] — ran once, saw both keys
```

The refinement runs once and receives the fully-populated object (both `id` and `self` are present).

### Failing checks inside cycles are reported

A failing refinement inside a cyclical structure is still caught and reported:

```ts
const Node = z
  .object({
    id: z.number(),
    get self() { return Node; },
  })
  .refine((value) => value.id > 100, "id must be > 100");

const input: any = { id: 1 };
input.self = input;

Node.safeParse(input).success; // false — refinement failure is reported
```

Validation errors on individual fields within a cycle are also deduplicated — the error is reported once, at the field's own path, not once per time the cycle visits that node:

```ts
const Node = z.object({
  id: z.number(),
  get self() { return Node; },
});

const input: any = { id: "nope" }; // wrong type
input.self = input;

const result = Node.safeParse(input);
result.error!.issues.length; // 1 — reported once, at path ["id"]
```

## Transforms and Cycles

> **Important:** A cycle that closes *through* a `.transform()` throws a `ZodCyclicError`. This is the primary limitation to be aware of when working with cyclical data.

### Why transforms can't close a cycle

When Zod encounters a back-edge, it needs a concrete output object to bind the cycle to. For plain objects, arrays, and other containers, that placeholder exists as soon as the container is created. For transforms, the output doesn't exist until the transform function has run — but the transform function can't run until all of its inputs are ready, including the back-edge value, which doesn't exist yet. This circular dependency has no resolution, so Zod throws `ZodCyclicError` rather than silently producing an incorrect output. [[1]](https://github.com/colinhacks/zod/pull/6387)

```ts
// ❌ The cycle closes through a transform — ZodCyclicError
const Inner = z.object({
  name: z.string(),
  get self() { return Wrapped; },
});
const Wrapped = Inner.transform((value) => ({ wrapped: value }));

const input: any = { name: "x" };
input.self = input;

Wrapped.parse(input); // throws ZodCyclicError
```

### Transforms NOT on the cycle are fine

Only transforms that lie directly on the cycle path are problematic. Transforms applied to *fields* inside a cyclical object work without issue, because they run on scalar values that don't participate in the cycle: [[1]](https://github.com/colinhacks/zod/pull/6387)

```ts
// ✅ Transform is on a field, not on the cycle itself
const Node = z.object({
  n: z.number().transform((v) => v * 2), // fine — not on the cycle
  get self() { return Node; },
});

const input: any = { n: 21 };
input.self = input;

const result = Node.parse(input);
result.n;         // 42 — transform applied correctly
result.self === result; // true — cycle preserved
```

### Summary

| Scenario | Result |
|---|---|
| `.transform()` on a field that is NOT on the cycle | ✅ Works |
| `.transform()` wrapping the schema that IS on the cycle | ❌ `ZodCyclicError` |
| Codecs / `z.encode()` through a cycle | ✅ Works (codecs use two-way transforms handled separately) |

## Async Parsing

Cyclical data works seamlessly with `parseAsync` and `safeParseAsync`, including schemas that include async refinements: [[1]](https://github.com/colinhacks/zod/pull/6387)

```ts
const Node = z.object({
  id: z.number().refine(async (v) => v > 0, "must be positive"),
  get self() { return Node; },
});

const input: any = { id: 1 };
input.self = input;

const result = await Node.parseAsync(input);
result.self === result; // true

// Async validation errors are still caught:
const bad: any = { id: -1 };
bad.self = bad;

const r = await Node.safeParseAsync(bad);
r.success; // false
```

The memoization system works the same way for async paths: each container registers its output placeholder before awaiting its children, so back-edges that arrive while the async parse is in flight still resolve to the correct placeholder.

## Performance Considerations

Cycle support was designed to have zero cost for schemas that don't need it. [[1]](https://github.com/colinhacks/zod/pull/6387)

### The `isRecursive` gate

Before cycle tracking is activated for any schema, Zod checks whether the schema's subtree can actually re-enter itself:

- The `isRecursive` check walks a schema's subtree once, the first time the schema is parsed.
- The result is cached per schema instance in a `WeakMap`, so the walk is never repeated.
- If a schema is not recursive, it opts out of the memo system entirely on every subsequent parse.

In JIT mode (Zod's optimized object parser), non-recursive schemas emit byte-identical generated code to the pre-v4 version — no runtime branches, no memo lookups.

### What this means in practice

- **Non-recursive schemas:** Zero overhead. No memo allocation, no `isRecursive` check after the first parse, no change to generated code.
- **Recursive schemas:** A per-parse memo map is allocated the first time a recursive schema is entered. The map lives for the duration of that parse and is then garbage collected.
- **Shared (non-cyclic) references in recursive schemas:** When the same input object is reached more than once through a shared reference (a DAG rather than a cycle), Zod reuses the already-built output and replays the node's issues, avoiding duplicate validation.

```ts
// Non-recursive: shared references are NOT deduplicated (normal deep-clone behavior)
const Leaf = z.object({ v: z.number() });
const Pair = z.object({ a: Leaf, b: Leaf });

const shared = { v: 1 };
const result = Pair.parse({ a: shared, b: shared });
result.a === result.b; // false — two independent clones (zero overhead)

// Recursive: shared references ARE deduplicated in the output
const Node = z.object({
  v: z.number(),
  get kids() { return z.array(Node); },
});

const shared2: any = { v: 1, kids: [] };
const result2 = Node.parse({ v: 0, kids: [shared2, shared2] });
result2.kids[0] === result2.kids[1]; // true — one shared output node
```

## Practical Examples

### Tree with parent references

A common pattern in UI frameworks and compilers: tree nodes that hold a reference back to their parent.

```ts
const TreeNode = z.object({
  id: z.number(),
  name: z.string(),
  get parent() { return z.nullable(TreeNode); },
  get children() { return z.array(TreeNode); },
});

// Build a tree with parent back-references
const root: any = { id: 1, name: "root", parent: null, children: [] };
const child: any = { id: 2, name: "child", parent: root, children: [] };
root.children.push(child);

const result = TreeNode.parse(root);
result.children[0].parent === result; // true — parent reference preserved
```

### Graph nodes with bidirectional edges

```ts
const GraphNode = z.object({
  id: z.number(),
  label: z.string(),
  get neighbors() { return z.array(GraphNode); },
});

const a: any = { id: 1, label: "a", neighbors: [] };
const b: any = { id: 2, label: "b", neighbors: [] };
a.neighbors.push(b);
b.neighbors.push(a); // bidirectional

const result = GraphNode.parse(a);
result.neighbors[0].neighbors[0] === result; // true
```

### Doubly-linked list

```ts
const ListNode = z.object({
  value: z.number(),
  get next() { return z.nullable(ListNode); },
  get prev() { return z.nullable(ListNode); },
});

const head: any = { value: 1, next: null, prev: null };
const tail: any = { value: 2, next: null, prev: head };
head.next = tail;

const result = ListNode.parse(head);
result.next!.prev === result; // true — back-reference preserved
```

### Mutually referencing entities

A typical database model where users have posts and posts have authors:

```ts
const User = z.object({
  id: z.number(),
  name: z.string(),
  get posts() { return z.array(Post); },
});

const Post = z.object({
  id: z.number(),
  title: z.string(),
  get author() { return User; },
});

const user: any = { id: 1, name: "Alice", posts: [] };
const post: any = { id: 101, title: "Hello", author: user };
user.posts.push(post);

const result = User.parse(user);
result.posts[0].author === result; // true
result.posts[0].author.name;       // "Alice"
```

## Migrating from Zod v3

### The old limitation no longer applies

The v3 documentation for [recursive objects](https://zod.dev/api) warned:

> "Though recursive schemas are supported, passing cyclical data into Zod will cause an infinite loop."

**This warning no longer applies in Zod v4.** Cyclical input data is fully supported, and the parse terminates correctly. [[1]](https://github.com/colinhacks/zod/pull/6387)

### `safeParse` now works on cyclical input

In v3, the infinite loop was not catchable even via `safeParse`, because the call stack overflow occurred inside JavaScript's own recursion before Zod's error handling could intercept it. In v4, `safeParse` and `safeParseAsync` both handle cyclical input correctly:

```ts
const Node = z.object({
  id: z.number(),
  get self() { return Node; },
});

const input: any = { id: 1 };
input.self = input;

// v3: would crash with RangeError (not catchable)
// v4: works as expected
const result = Node.safeParse(input);
result.success; // true
```

### Code changes required

In most cases, **no code changes are required**. If you had worked around the limitation by stripping cycles before parsing (e.g., replacing back-references with `null` or `undefined`), you can now pass the data directly and let Zod preserve the structure.

If your schemas use `.transform()` and you now want to parse cyclical data, be aware of the `ZodCyclicError` limitation described in the [Transforms and Cycles](#transforms-and-cycles) section above. Transforms that wrap a recursive schema directly will throw if a cycle passes through them.
