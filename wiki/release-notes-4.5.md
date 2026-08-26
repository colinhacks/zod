<!-- Draft of the GitHub release notes for v4.5.0. Paste everything below this comment into the release body when the version is cut. -->

Zod 4.5 is a performance release. Schemas can now be compiled ahead of time for up to 14x faster parsing, and every schema you construct costs about a third of the memory it did in 4.4.

## `z.compile()` — ahead-of-time compilation ([#6085](https://github.com/colinhacks/zod/pull/6085))

> Read the announcement: [Introducing `z.compile()`](https://zod.dev/blog/introducing-z-compile)

Zod can now compile a schema into a specialized validator ahead of time. On arrays, unions, and nested or wide objects, compiled schemas parse 4–14x faster.

```ts
import * as z from "zod";

const Player = z.object({
  username: z.string(),
  bio: z.string(),
  xp: z.number(),
  level: z.number(),
  rank: z.number(),
  admin: z.boolean(),
  stats: z.object({ title: z.string(), score: z.number(), active: z.boolean() }),
});

const CompiledPlayer = z.compile(Player); // parses ~4.5x faster
```

`CompiledPlayer` is a regular Zod schema. Use it exactly like `Player`:

- It has every method the original has — `.parse()`, `.safeParse()`, `.extend()`, `.optional()`, Standard Schema — and composes into other schemas.
- Its inferred input and output types are identical.
- On failure it returns identical issues. The compiled code only handles the happy path; when an input is invalid, Zod runs the standard parser to produce the `ZodError`.

Zod's entire test suite runs twice, once against uncompiled schemas and once with compilation enabled globally, asserting that the compiled path produced every value.

Under the hood, `z.compile()` walks the entire schema once and generates a specialized fast-path validator with the `Function` constructor. For the large majority of inputs, that function validates the data with the fastest logic JavaScript can express; when it can't handle an input, Zod falls back to the standard parser.

### `import "zod/compile"`

To compile every schema in an application, import `zod/compile` once at the top of your entry point. Every schema constructed after that import is compiled on its first parse.

```ts
import "zod/compile"; // must come before modules that define schemas
import * as z from "zod";

const schema = z.object({ name: z.string() });
schema.parse({ name: "ok" }); // compiled on first parse
```

Compilation is lazy, so intermediate schemas in a builder chain cost nothing. Leave this import to applications; a library that adds it opts in every schema in the process on its users' behalf.

### Speedups

![Parse speedup of compiled schemas over the standard parser](https://zod.dev/blog/compile-speedup.svg)

What compilation removes is per-node dispatch and allocation, so the win scales with how many nodes a parse walks. Containers benefit most:

```ts
// 20-key object — 8.9x
z.object({ k0: z.string(), k1: z.string(), /* … */ k19: z.string() });
```

```ts
// union of 3 objects — 8.4x
z.union([z.object({ a: z.string() }), z.object({ b: z.number() }), z.object({ c: z.boolean() })]);
```

```ts
// tuple of 3 — 4.8x
z.tuple([z.string(), z.number(), z.boolean()]);
```

A bare `z.string()` has nothing to remove, since the whole schema is one `typeof`. Everything built out of such schemas still benefits, because leaves are inlined into the parent's compiled code.

Async schemas, `z.xor()`, recursive schemas, and coercion aren't compiled: `z.compile()` throws on them, and global mode quietly keeps using the standard parser. Encoding isn't compiled either, but it bypasses the fast path rather than throwing, so a compiled codec still speeds up decoding. Global mode stands down under `z.config({ jitless: true })` for CSP environments. The [docs](https://zod.dev/compile) have the full list.

## ~70% less memory per schema ([#6318](https://github.com/colinhacks/zod/pull/6318), [#6415](https://github.com/colinhacks/zod/pull/6415))

Schema instances used to carry every builder method and every lazily-derived internal as an own property. Those now live on prototypes and materialize per instance on first read. Retained heap per schema, 4.4.3 vs 4.5:

| schema | 4.4.3 | 4.5 |
| --- | --- | --- |
| `z.string()` | 7.5 KB | 784 B |
| `z.string().optional()` | 12.6 KB | 1.5 KB |
| `z.email()` | 5.8 KB | 2.2 KB |
| `z.array(z.string())` | 11.2 KB | 1.9 KB |
| `z.object()`, 10 keys | 82.0 KB | 11.5 KB |
| `z.discriminatedUnion()`, 2 options | 42.0 KB | 13.7 KB |
| `zod/mini` `z.string()` | 2.5 KB | 577 B |

On a realistic catalogue of API resource schemas (~40 nodes each), the cost per resource drops from 406 KB to 118 KB, and 500 of them go from 198 MB to 58 MB of heap. Schema construction is roughly twice as fast as a side effect, and keeping instances in V8's fast-properties mode sped up several parse paths too.

The one visible difference is that `hasOwnProperty("optional")` is `false` until the first time you touch `.optional`.

## Faster failures ([#6316](https://github.com/colinhacks/zod/pull/6316), [#6450](https://github.com/colinhacks/zod/pull/6450))

A failing `safeParse()` used to pay for two things almost nobody read: a pretty-printed JSON dump of every issue into `error.message`, and a V8 stack capture in the `Error` constructor. The message is now computed on first read (~1.6x faster failing `safeParse()`), and the stack capture is skipped for errors that are *returned* rather than thrown (another ~2.3x). A `ZodError` returned from `safeParse()` retains 714 B instead of 1073 B, and that cost no longer grows with call depth.

> **Note** — The error returned by `.safeParse()` no longer carries stack frames. `.parse()` still throws with a full stack. If you re-throw a `safeParse()` error, the thrown error has an empty trace.

## `z.deepPartial()` ([#5928](https://github.com/colinhacks/zod/pull/5928))

Back after being removed in Zod 4. The new implementation dispatches on the schema's `def.type` rather than `instanceof`, is cycle-safe, and covers the whole v4 schema vocabulary.

```ts
const Post = z.object({
  title: z.string(),
  author: z.object({ name: z.string(), email: z.string() }),
});

z.deepPartial(Post).parse({ author: {} }); // ✅
```

The result is still a `ZodObject`, so `.shape` and `.extend()` keep working. A discriminated union degrades to a plain `z.union()`, since an optional discriminator defeats the discriminated lookup.

## `z.input()` and `z.output()` at runtime ([#5928](https://github.com/colinhacks/zod/pull/5928))

Project a schema onto its input or output side. Useful for validating the two halves of a codec independently.

```ts
const isoDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
});

const Event = z.object({ name: z.string(), at: isoDate });

z.input(Event).parse({ name: "launch", at: "2024-01-01T00:00:00Z" }); // ✅
z.output(Event).parse({ name: "launch", at: new Date() });            // ✅
```

## `z.toZod<T>()` ([#5913](https://github.com/colinhacks/zod/pull/5913))

Check a hand-written schema against an existing TypeScript type. The check is *exact* type equality, which is what `satisfies z.ZodType<T>` can't give you: it lets extra keys, omitted optional keys, and a bare `z.any()` through.

```ts
type Player = { username: string; xp: number };

const Player = z.toZod<Player>()(
  z.object({
    username: z.string(),
    xp: z.number(),
  })
);

Player.shape.username; // ZodString — the schema is returned unchanged
```

Closes [#372](https://github.com/colinhacks/zod/issues/372), [#2084](https://github.com/colinhacks/zod/issues/2084), [#2807](https://github.com/colinhacks/zod/issues/2807), [#5418](https://github.com/colinhacks/zod/issues/5418).

## `.exactPartial()` ([#6065](https://github.com/colinhacks/zod/pull/6065))

Like `.partial()`, but wraps each field in `z.exactOptional()` instead of `z.optional()`: keys may be omitted, but an explicit `undefined` is rejected. This matches TypeScript's `Partial<>` under `exactOptionalPropertyTypes`.

```ts
const Recipe = z.object({ title: z.string(), servings: z.number() });

const PartialRecipe = Recipe.exactPartial();
PartialRecipe.parse({});                    // ✅
PartialRecipe.parse({ title: undefined });  // ❌
```

In Zod Mini it's a top-level function: `z.exactPartial(Recipe)`.

## `z.creditCard()` ([#5931](https://github.com/colinhacks/zod/pull/5931))

A new string format: 12–19 digits, optionally separated by single spaces or hyphens, with a valid Luhn checksum. The issuer is not identified: an allowlist of card schemes turns away Luhn-valid cards from every scheme it doesn't know, and keeping one current needs a BIN table.

```ts
z.creditCard().parse("4111 1111 1111 1111"); // ✅
z.creditCard().parse("4111 1111 1111 1112"); // ❌ bad checksum
```

## Symbol keys in `z.object()` ([#6448](https://github.com/colinhacks/zod/pull/6448))

A shape can now declare a symbol key. TypeScript tracks it: a `const` symbol infers as `unique symbol`, so `z.infer` makes the key required and checks its value type. Undeclared symbol keys are still ignored, and string-only objects don't pay for the feature.

```ts
const TAG = Symbol("tag");
const schema = z.object({ name: z.string(), [TAG]: z.number() });

schema.parse({ name: "alice", [TAG]: 42 }); // ✅ { name: "alice", [TAG]: 42 }
schema.safeParse({ name: "alice" });        // ❌ the symbol key is required
```

## `z.getDiscriminatedOption()` ([#5947](https://github.com/colinhacks/zod/pull/5947))

Look up a discriminated union's member by discriminator value, with the result narrowed at the type level.

```ts
const Fruit = z.object({ type: z.literal("fruit"), seeds: z.boolean() });
const Veg = z.object({ type: z.literal("vegetable"), leafy: z.boolean() });
const Produce = z.discriminatedUnion("type", [Fruit, Veg]);

z.getDiscriminatedOption(Produce, "fruit"); // typeof Fruit
z.getDiscriminatedOption(Produce, "meat");  // ❌ TypeScript error
```

## Reference cycles in parsed input ([#6387](https://github.com/colinhacks/zod/pull/6387))

Input that contains a reference cycle used to blow the stack with a `RangeError` — not even catchable through `safeParse()`. A recursive schema now parses it, and the output preserves the cycle.

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

This is a Zod-only feature; `zod/mini` keeps the old behavior to save bytes.

## `z.properties()` ([#5912](https://github.com/colinhacks/zod/pull/5912))

The multi-property counterpart to `z.property()`. It returns an array of checks to spread into `.check()`, and pairs well with `z.instanceof()`.

```ts
const httpsUrl = z.instanceof(URL).check(
  ...z.properties({
    protocol: z.literal("https:" as string),
    hostname: z.string().regex(z.regexes.domain),
  })
);

httpsUrl.parse(new URL("https://example.com")); // ✅
httpsUrl.parse(new URL("http://localhost")); // ❌ protocol
```

## `issue.schema` ([#6420](https://github.com/colinhacks/zod/pull/6420), [#6426](https://github.com/colinhacks/zod/pull/6426))

For an issue raised by a check (`too_small`, `too_big`, `invalid_format`, `not_multiple_of`), `issue.inst` is the check itself, which has no metadata and no link back to the schema. The raw issue handed to an error map now also carries `issue.schema`, the schema the check was attached to, so an error map can label a `.min()` failure with the field's own `.meta()`. It is stripped before the issue lands in `ZodError.issues`.

```ts
z.config({
  customError: (iss) => `${iss.schema?.meta?.()?.title ?? "Value"} is invalid.`,
});

z.string().min(5).meta({ title: "Password" }).safeParse("abc");
// => "Password is invalid."
```

A schema-level `error` also now covers issues raised by its own checks, not just the ones it raised itself:

```ts
z.string({ error: "Bad" }).min(5).safeParse("abc").error.issues[0].message;
// => "Bad"
```

Closes [#5240](https://github.com/colinhacks/zod/issues/5240), [#6108](https://github.com/colinhacks/zod/issues/6108).

## JSON Schema

`z.toJSONSchema()`:

- `unrepresentable` accepts a function, so you can substitute a schema for one type while every other unrepresentable type still throws ([#6380](https://github.com/colinhacks/zod/pull/6380)).
- Simple unions emit a type array — `z.union([z.string(), z.null()])` becomes `{ type: ["string", "null"] }` instead of `anyOf` ([#6339](https://github.com/colinhacks/zod/pull/6339)).
- An intersection of object schemas is folded into one object instead of an `allOf` that no object could satisfy ([#6461](https://github.com/colinhacks/zod/pull/6461)).
- A root schema with an `id` emits a root `$ref` ([#6029](https://github.com/colinhacks/zod/pull/6029)).
- Closed tuples emit their length constraints ([#6194](https://github.com/colinhacks/zod/pull/6194)).
- `$ref` pointers escape `/` and `~` per RFC 6901 ([#6144](https://github.com/colinhacks/zod/pull/6144), [#6402](https://github.com/colinhacks/zod/pull/6402)).
- Converting a registry is now linear in registry size instead of quadratic ([#6408](https://github.com/colinhacks/zod/pull/6408)).
- Input-mode fixes for `preprocess`, `catch`, and tuples ([#6133](https://github.com/colinhacks/zod/pull/6133), [#6409](https://github.com/colinhacks/zod/pull/6409), [#6418](https://github.com/colinhacks/zod/pull/6418)), record input keys ([#6460](https://github.com/colinhacks/zod/pull/6460)), `.includes()` with `position` ([#6024](https://github.com/colinhacks/zod/pull/6024)), `cidrv6` ([#5945](https://github.com/colinhacks/zod/pull/5945)), and dynamic `.catch()` under `unrepresentable: "any"` ([#5925](https://github.com/colinhacks/zod/pull/5925)).

`z.fromJSONSchema()`:

- `format: "hostname"` maps to `z.hostname()` ([#6305](https://github.com/colinhacks/zod/pull/6305)).
- `format: "date-time"` accepts RFC 3339 numeric offsets ([#6298](https://github.com/colinhacks/zod/pull/6298)), and `format: "time"` now means RFC 3339 `full-time` — seconds and a `Z` or offset are required ([#6452](https://github.com/colinhacks/zod/pull/6452)).
- Tuples are open-ended by default, per the spec, unless `items: false` / `additionalItems: false` closes them ([#6020](https://github.com/colinhacks/zod/pull/6020)), and positional items past `minItems` are optional ([#6201](https://github.com/colinhacks/zod/pull/6201)).
- `propertyNames` composes with `patternProperties` and `additionalProperties` ([#6411](https://github.com/colinhacks/zod/pull/6411)), and `additionalProperties: false` is honored alongside `patternProperties` ([#6199](https://github.com/colinhacks/zod/pull/6199)).
- Draft-04 boolean `exclusiveMinimum` / `exclusiveMaximum` no longer emit a redundant inclusive bound ([#6022](https://github.com/colinhacks/zod/pull/6022)).

## Tree-shaking

- `import z from "zod"` no longer pulls every locale into the bundle ([#6384](https://github.com/colinhacks/zod/pull/6384)).
- The default English locale survives bundlers that honor `sideEffects: false`, so messages no longer fall through to `"Invalid input"` ([#5959](https://github.com/colinhacks/zod/pull/5959)).
- Three dead declarations no longer survive into every `zod/mini` bundle under esbuild ([#6381](https://github.com/colinhacks/zod/pull/6381)).

## Smaller additions

- `.apply()` forwards extra arguments to the function it's given ([#6337](https://github.com/colinhacks/zod/pull/6337)).
- The function returned by `.implement()` exposes its schema on a non-enumerable `_zod` property ([#6267](https://github.com/colinhacks/zod/pull/6267)).
- `z.stringbool()` exposes its resolved `truthy` / `falsy` / `case` config on `._zod.bag` ([#6357](https://github.com/colinhacks/zod/pull/6357)).
- Stack traces from `z.parse()`, `.encode()`, and `.decode()` start at your call site instead of inside Zod ([#5910](https://github.com/colinhacks/zod/pull/5910)). Closes [#3254](https://github.com/colinhacks/zod/issues/3254).
- The Zod 3 compat aliases (`ZodTypeAny`, `ZodSchema`, `TypeOf`, …) now render as `@deprecated` in editors ([#6072](https://github.com/colinhacks/zod/pull/6072)).

## New locales

- Bengali (`bn`) ([#5974](https://github.com/colinhacks/zod/pull/5974))
- Central Kurdish (`ckb`) ([#6078](https://github.com/colinhacks/zod/pull/6078))
- Hindi (`hi`) and Kannada (`kn`) ([#6315](https://github.com/colinhacks/zod/pull/6315))
- Norwegian Nynorsk (`nn`) ([#6092](https://github.com/colinhacks/zod/pull/6092))
- Brazilian Portuguese (`pt-BR`) ([#6076](https://github.com/colinhacks/zod/pull/6076))
- Slovak (`sk`) ([#6041](https://github.com/colinhacks/zod/pull/6041))
- Turkmen (`tk`) ([#6168](https://github.com/colinhacks/zod/pull/6168))

```ts
import * as z from "zod";
import { sk } from "zod/locales";

z.config(sk());
```

Message text also changed in existing locales:

- French: more natural wording ([#6120](https://github.com/colinhacks/zod/pull/6120), [#5999](https://github.com/colinhacks/zod/pull/5999))
- Portuguese: article fixes ([#6076](https://github.com/colinhacks/zod/pull/6076))
- Danish, Norwegian (Bokmål and Nynorsk), Swedish: `ipv4` / `ipv6` name an address, not a range ([#6430](https://github.com/colinhacks/zod/pull/6430))
- Every locale now has the full dictionary, with a test pinning it ([#6424](https://github.com/colinhacks/zod/pull/6424), [#6427](https://github.com/colinhacks/zod/pull/6427))
- English: fixed-length failures say `exactly N` ([#6177](https://github.com/colinhacks/zod/pull/6177)), `z.xor()` names the overlap when more than one option matches ([#6376](https://github.com/colinhacks/zod/pull/6376)), and `Infinity` is called out by name ([#5906](https://github.com/colinhacks/zod/pull/5906))

If you snapshot error messages, expect diffs.

---

## Bug fixes

All of these fix soundness issues, so a schema that relied on the old behavior may now reject input it used to accept.

### ⚠️ `z.iso.datetime()` requires seconds ([#6457](https://github.com/colinhacks/zod/pull/6457))

RFC 3339 mandates seconds, and Zod's own pattern did too until a refactor ([#4680](https://github.com/colinhacks/zod/pull/4680)) dropped it by accident. `z.iso.datetime()` and `z.iso.datetime({ offset: true })` no longer accept minute-precision input like `2020-01-01T06:15Z`. `local: true` still admits `2020-01-01T06:15`, since an unqualified datetime is outside RFC 3339 either way.

```ts
z.iso.datetime().parse("2020-01-01T06:15:00Z"); // ✅
z.iso.datetime().parse("2020-01-01T06:15Z");    // ❌ was accepted in 4.4
```

To accept both forms, union the two precisions:

```ts
z.union([z.iso.datetime(), z.iso.datetime({ precision: -1 })]);
```

### ⚠️ String length counts code points ([#6441](https://github.com/colinhacks/zod/pull/6441))

`.min()`, `.max()`, and `.length()` counted UTF-16 code units, so `z.string().max(5)` rejected five emoji. They now count Unicode code points, which is what every non-JS consumer of a length bound does (Postgres, MySQL, Go, Python, and the `maxLength` that `z.toJSONSchema()` emits). `.max()` only loosens; `.min()` and `.length()` tighten for astral input. Graphemes are unchanged — a ZWJ sequence is still several code points.

```ts
z.string().max(5).parse("😀😀😀😀😀"); // was too_big, now passes
z.string().min(5).parse("😀😀😀");     // was fine, now too_small
```

Closes [#3355](https://github.com/colinhacks/zod/issues/3355).

### ⚠️ Record keys and intersections match TypeScript ([#6412](https://github.com/colinhacks/zod/pull/6412))

A record's key schema now governs only the keys that match it, the way TypeScript treats an index signature. Intersecting an object with a pattern-keyed record no longer rejects the object's own keys.

```ts
z.object({ name: z.string() })
  .and(z.record(z.string().regex(/^S_/), z.string()))
  .parse({ name: "a", S_a: "s" });
// 4.4: throws invalid_key on "name"
// 4.5: { name: "a", S_a: "s" }
```

Separately, an `unrecognized_keys` issue no longer aborts the schema it came from, so a strict object with an extra key *and* a bad value now reports both issues instead of just the first. Closes [#2200](https://github.com/colinhacks/zod/issues/2200), [#2573](https://github.com/colinhacks/zod/issues/2573), [#4017](https://github.com/colinhacks/zod/issues/4017), [#5663](https://github.com/colinhacks/zod/issues/5663).

### ⚠️ `__proto__` is always stripped ([#6386](https://github.com/colinhacks/zod/pull/6386), [#6354](https://github.com/colinhacks/zod/pull/6354), [#6355](https://github.com/colinhacks/zod/pull/6355), [#6221](https://github.com/colinhacks/zod/pull/6221))

Object and record parsers now drop a `__proto__` key whether it comes from the input, is declared by the schema, or is produced by a record key transform. A key that a record's key schema *normalizes* to `__proto__` is dropped too. `.strict()` reports an own `__proto__` input key as `unrecognized_keys` instead of silently swallowing it. Error formatters and both JSON Schema converters use own-property writes so a `toString` or `constructor` path segment can't walk onto `Object.prototype` ([#6213](https://github.com/colinhacks/zod/pull/6213), [#6367](https://github.com/colinhacks/zod/pull/6367), [#6346](https://github.com/colinhacks/zod/pull/6346)).

### ⚠️ Number and bigint formats are distinct types ([#6052](https://github.com/colinhacks/zod/pull/6052))

`ZodInt`, `ZodFloat32`, `ZodFloat64`, `ZodInt32`, and `ZodUInt32` were empty extensions of one base, so TypeScript treated all five as the same type. They are now `ZodNumberFormat<Format>` with a distinct format each, and the bigint formats get the same treatment: `z.int64()` and `z.uint64()` return `ZodInt64` and `ZodUInt64`. This is breaking at the type level only: `z.float32()` is no longer assignable to a `ZodInt` annotation.

### ⚠️ Stricter string formats

- `z.ipv6()` validated by handing the string to `new URL()`, which let `::@1\` and `::1\n` through. It now checks the address alphabet directly ([#6442](https://github.com/colinhacks/zod/pull/6442)).
- `z.ulid()` restricts the first character to `0`–`7`; anything higher overflows the 48-bit timestamp. A fixture that doesn't start with a real timestamp, such as one with a leading letter, is now rejected ([#6095](https://github.com/colinhacks/zod/pull/6095)).
- `z.httpUrl()` enforces the RFC 1035 length limits on the host, matching `z.hostname()` ([#6035](https://github.com/colinhacks/zod/pull/6035)).
- `z.emoji()` no longer backtracks exponentially on a failed match ([#6347](https://github.com/colinhacks/zod/pull/6347)).
- `z.string().includes(sub, { position: N })` emits a JSON Schema pattern that allows *at least* N leading characters, matching `String.prototype.includes` ([#6024](https://github.com/colinhacks/zod/pull/6024)).

### Optionality

- Fixed a 4.4.3 regression where `.default().transform()` inside `.partial()` dropped the default ([#6419](https://github.com/colinhacks/zod/pull/6419)). Closes [#6321](https://github.com/colinhacks/zod/issues/6321).
- An absent key under `.exactOptional()` supplies nothing — `z.coerce.string().exactOptional()` no longer produces `"undefined"` for a missing key ([#6434](https://github.com/colinhacks/zod/pull/6434)).
- A discriminator that may be absent now claims `undefined`, so `z.discriminatedUnion()` can match an option whose discriminator key is missing ([#6432](https://github.com/colinhacks/zod/pull/6432)).
- `z.preprocess()` keeps the input-type narrowing from its function's argument, a regression in 4.4.3 ([#5967](https://github.com/colinhacks/zod/pull/5967)).

### `.catch()`

- Adding `.catch()` to a chain that already parsed could make it fail; it can now only turn failure into success ([#6440](https://github.com/colinhacks/zod/pull/6440)).
- A catch callback's `ctx.value` is the original input, not the coerced or transformed intermediate ([#6192](https://github.com/colinhacks/zod/pull/6192)).
- A wrapper on the far side of a `.pipe()` no longer treats an upstream `unrecognized_keys` issue as its own inner schema failing, which let `.catch()` swallow a strict-object violation ([#6462](https://github.com/colinhacks/zod/pull/6462)).

### Other fixes

- `z.number().multipleOf(0.07)` accepts `2.03` — exact decimal multiples that a one-ULP tolerance rejected ([#6223](https://github.com/colinhacks/zod/pull/6223)).
- An empty enum matches nothing instead of matching the empty string, and `z.literal([])` constructs (and rejects everything) instead of throwing ([#6459](https://github.com/colinhacks/zod/pull/6459)).
- `z.discriminatedUnion()` infers mutually-recursive getter options instead of collapsing to `any` ([#6422](https://github.com/colinhacks/zod/pull/6422)). Closes [#5991](https://github.com/colinhacks/zod/issues/5991).
- A shared node inside a recursive schema no longer leaks path prefixes between visitors ([#6443](https://github.com/colinhacks/zod/pull/6443)).
- The object fast path no longer keeps a value written alongside an issue it swallowed ([#6407](https://github.com/colinhacks/zod/pull/6407)).
- `z.looseRecord()` honors loose mode for enum and literal key schemas ([#6157](https://github.com/colinhacks/zod/pull/6157)).
- Zod Mini's `merge()` takes an object schema, matching the classic API and its own signature ([#6404](https://github.com/colinhacks/zod/pull/6404)).
- `z.date().min(timestamp)` reports `origin: "date"` regardless of the bound's type ([#6129](https://github.com/colinhacks/zod/pull/6129)).
- `.superRefine()` preserves an explicit `input: undefined` on an issue instead of backfilling it ([#6053](https://github.com/colinhacks/zod/pull/6053)).
- Numeric enum values inside `z.templateLiteral()` are escaped in the generated pattern ([#5934](https://github.com/colinhacks/zod/pull/5934)).
- `z.iso.datetime({ local: true })` no longer emits an empty alternation branch in its pattern ([#6439](https://github.com/colinhacks/zod/pull/6439)).
- The circular import between `zod/v4/classic` schemas and `iso` is gone ([#5926](https://github.com/colinhacks/zod/pull/5926)).

<details>
<summary>Commits</summary>

- [`9d5b20ef`](https://github.com/colinhacks/zod/commit/9d5b20ef) fix(v4): restrict the first ULID character to [0-7] ([#6095](https://github.com/colinhacks/zod/pull/6095)) by @JSap0914
- [`1cf9cd09`](https://github.com/colinhacks/zod/commit/1cf9cd09) docs: record that error maps run per parse, and how to translate at render by @colinhacks
- [`fc90cad8`](https://github.com/colinhacks/zod/commit/fc90cad8) test: drop the orphaned deep-readonly assertions by @colinhacks
- [`7ce3e77d`](https://github.com/colinhacks/zod/commit/7ce3e77d) fix(v4): run a wrapper's inner schema on its own payload ([#6462](https://github.com/colinhacks/zod/pull/6462)) by @colinhacks
- [`7b612b53`](https://github.com/colinhacks/zod/commit/7b612b53) fix(v4): fold an intersection of object schemas into one object ([#6461](https://github.com/colinhacks/zod/pull/6461)) by @colinhacks
- [`1c43b774`](https://github.com/colinhacks/zod/commit/1c43b774) docs(v4): record why the failure path is not worth compiling by @colinhacks
- [`badf0b78`](https://github.com/colinhacks/zod/commit/badf0b78) fix(v4): build the catch context from the input that failed ([#6192](https://github.com/colinhacks/zod/pull/6192)) by @zelinewang
- [`a82593c1`](https://github.com/colinhacks/zod/commit/a82593c1) chore: gitignore agents.local.md by @colinhacks
- [`dd1a58dc`](https://github.com/colinhacks/zod/commit/dd1a58dc) chore: move the advisory workflow out of the triage skill by @colinhacks
- [`a87ac366`](https://github.com/colinhacks/zod/commit/a87ac366) fix(v4)!: distinguish number and bigint formats at the type level ([#6052](https://github.com/colinhacks/zod/pull/6052)) by @abhishek-chaudhary2003
- [`6726c1dd`](https://github.com/colinhacks/zod/commit/6726c1dd) docs: record what z.input and z.output do with transforms and wrappers by @colinhacks
- [`7cfc0122`](https://github.com/colinhacks/zod/commit/7cfc0122) fix(v4): keep a wrapper's stored value only on the side it belongs to by @colinhacks
- [`a825c1b0`](https://github.com/colinhacks/zod/commit/a825c1b0) fix(v4): empty enums and literals match nothing ([#6459](https://github.com/colinhacks/zod/pull/6459)) by @colinhacks
- [`7c070db9`](https://github.com/colinhacks/zod/commit/7c070db9) feat(v4): expose the function schema on .implement() results ([#6267](https://github.com/colinhacks/zod/pull/6267)) by @deepshekhardas
- [`3a496968`](https://github.com/colinhacks/zod/commit/3a496968) fix(v4): make record input keys optional when the value can fill them ([#6460](https://github.com/colinhacks/zod/pull/6460)) by @colinhacks
- [`53cec2a0`](https://github.com/colinhacks/zod/commit/53cec2a0) fix(v4): resolve z.input past a preprocess transform by @colinhacks
- [`2125d30c`](https://github.com/colinhacks/zod/commit/2125d30c) fix(v4): accept exact decimal multiples in multipleOf ([#6223](https://github.com/colinhacks/zod/pull/6223)) by @spokodev
- [`168122fc`](https://github.com/colinhacks/zod/commit/168122fc) fix(v4): carry a pipe's own checks through z.output by @colinhacks
- [`51a1368a`](https://github.com/colinhacks/zod/commit/51a1368a) fix(v4): let the includes(position) pattern match at or after the offset ([#6024](https://github.com/colinhacks/zod/pull/6024)) by @francisjohnjohnston-web
- [`a0bfdb39`](https://github.com/colinhacks/zod/commit/a0bfdb39) chore: drop dead code in core and fix a stale deprecation message ([#6012](https://github.com/colinhacks/zod/pull/6012)) by @Mohammad-Faiz-Cloud-Engineer
- [`72a05c4f`](https://github.com/colinhacks/zod/commit/72a05c4f) feat(v4): expose stringbool truthy/falsy/case via _zod.bag ([#6357](https://github.com/colinhacks/zod/pull/6357)) by @hamed-bavar
- [`036b39f4`](https://github.com/colinhacks/zod/commit/036b39f4) fix(v4)!: require seconds once a datetime carries a Z or an offset ([#6457](https://github.com/colinhacks/zod/pull/6457)) by @colinhacks
- [`5825605e`](https://github.com/colinhacks/zod/commit/5825605e) perf(v4): skip the eager stack capture when building a ZodError ([#6450](https://github.com/colinhacks/zod/pull/6450)) by @colinhacks
- [`d85472c4`](https://github.com/colinhacks/zod/commit/d85472c4) feat(v4): support declared symbol keys in z.object() ([#6448](https://github.com/colinhacks/zod/pull/6448)) by @colinhacks
- [`d4108872`](https://github.com/colinhacks/zod/commit/d4108872) fix(v4): correct the date/time format keywords in both JSON Schema directions ([#6452](https://github.com/colinhacks/zod/pull/6452)) by @colinhacks
- [`e516c3ba`](https://github.com/colinhacks/zod/commit/e516c3ba) ci: publish to jsr after cutting the release, not before ([#6453](https://github.com/colinhacks/zod/pull/6453)) by @colinhacks
- [`555e5f46`](https://github.com/colinhacks/zod/commit/555e5f46) Add z.toZod helper ([#5913](https://github.com/colinhacks/zod/pull/5913)) by @colinhacks
- [`49507f34`](https://github.com/colinhacks/zod/commit/49507f34) chore: require comments to be lowercase fragments by @colinhacks
- [`36c68adf`](https://github.com/colinhacks/zod/commit/36c68adf) ci: replace the archived create-release action on the publish path ([#6451](https://github.com/colinhacks/zod/pull/6451)) by @colinhacks
- [`87da8146`](https://github.com/colinhacks/zod/commit/87da8146) chore: bar file paths from maintainer comments and tighten the length rule by @colinhacks
- [`e0e51a55`](https://github.com/colinhacks/zod/commit/e0e51a55) docs(v4): cut the compile comments down to what they explain ([#6449](https://github.com/colinhacks/zod/pull/6449)) by @colinhacks
- [`6574e784`](https://github.com/colinhacks/zod/commit/6574e784) fix(v4): stop catch resurrecting issues an optional already resolved ([#6440](https://github.com/colinhacks/zod/pull/6440)) by @colinhacks
- [`937b5d01`](https://github.com/colinhacks/zod/commit/937b5d01) perf(v4): prefix issue paths in place in the object JIT failure path ([#6445](https://github.com/colinhacks/zod/pull/6445)) by @colinhacks
- [`b63db248`](https://github.com/colinhacks/zod/commit/b63db248) fix(v4): keep a memoized node's cached issues private to the cache ([#6443](https://github.com/colinhacks/zod/pull/6443)) by @colinhacks
- [`463ebb30`](https://github.com/colinhacks/zod/commit/463ebb30) chore: require comments to be short and tight by @colinhacks
- [`870433f3`](https://github.com/colinhacks/zod/commit/870433f3) chore: record why the attw stderr filter needs a \\s match ([#6447](https://github.com/colinhacks/zod/pull/6447)) by @colinhacks
- [`6ec3d043`](https://github.com/colinhacks/zod/commit/6ec3d043) fix(resolution): keep pnpm's own warnings out of the attw snapshot ([#6446](https://github.com/colinhacks/zod/pull/6446)) by @colinhacks
- [`830ba314`](https://github.com/colinhacks/zod/commit/830ba314) fix(v4): validate the address, and return the string that was validated ([#6442](https://github.com/colinhacks/zod/pull/6442)) by @colinhacks
- [`f101d8ca`](https://github.com/colinhacks/zod/commit/f101d8ca) Preserve callsites in parse stack traces ([#5910](https://github.com/colinhacks/zod/pull/5910)) by @colinhacks
- [`2a417097`](https://github.com/colinhacks/zod/commit/2a417097) ci: bump the GitHub Actions off the deprecated Node 20 runtime ([#6444](https://github.com/colinhacks/zod/pull/6444)) by @colinhacks
- [`16959de5`](https://github.com/colinhacks/zod/commit/16959de5) test(v4): cover z.required in zod/mini by @colinhacks
- [`6c77d028`](https://github.com/colinhacks/zod/commit/6c77d028) feat: compact simple anyOf unions to type array in toJSONSchema ([#6339](https://github.com/colinhacks/zod/pull/6339)) by @deepshekhardas
- [`28e1ebd8`](https://github.com/colinhacks/zod/commit/28e1ebd8) fix(v4): measure string length in Unicode code points ([#6441](https://github.com/colinhacks/zod/pull/6441)) by @colinhacks
- [`060bc9f3`](https://github.com/colinhacks/zod/commit/060bc9f3) refactor: share default when-clauses for size/length checks ([#6394](https://github.com/colinhacks/zod/pull/6394)) by @zirkelc
- [`6772a43e`](https://github.com/colinhacks/zod/commit/6772a43e) ci: bump .nvmrc to 24 and unpin the publish job's Node version ([#6307](https://github.com/colinhacks/zod/pull/6307)) by @MGPOCKY
- [`2848177d`](https://github.com/colinhacks/zod/commit/2848177d) docs: point the flattened/formatted error deprecations at a symbol that exists by @colinhacks
- [`3c2dee9e`](https://github.com/colinhacks/zod/commit/3c2dee9e) Add properties checks for instanceof schemas ([#5912](https://github.com/colinhacks/zod/pull/5912)) by @colinhacks
- [`87ffeb0f`](https://github.com/colinhacks/zod/commit/87ffeb0f) fix(v4): an absent key on the middle rung supplies nothing ([#6434](https://github.com/colinhacks/zod/pull/6434)) by @colinhacks
- [`7785fc82`](https://github.com/colinhacks/zod/commit/7785fc82) feat(v4): add z.getDiscriminatedOption ([#5947](https://github.com/colinhacks/zod/pull/5947)) by @dokson
- [`0135c85a`](https://github.com/colinhacks/zod/commit/0135c85a) feat(v4): allow passing extra args to apply() ([#6337](https://github.com/colinhacks/zod/pull/6337)) by @deepshekhardas
- [`ca246d26`](https://github.com/colinhacks/zod/commit/ca246d26) fix(v4): drop empty alternation branch from datetime pattern ([#6439](https://github.com/colinhacks/zod/pull/6439)) by @colinhacks
- [`17d1227f`](https://github.com/colinhacks/zod/commit/17d1227f) chore: document that format validators are deliberately narrower than their specs by @colinhacks
- [`e073d55b`](https://github.com/colinhacks/zod/commit/e073d55b) docs: z.iso.datetime() accepts a subset of ISO 8601, not all of it by @colinhacks
- [`d6ca12ae`](https://github.com/colinhacks/zod/commit/d6ca12ae) fix(v4): infer recursive getter options in discriminatedUnion ([#6422](https://github.com/colinhacks/zod/pull/6422)) by @colinhacks
- [`dc51404b`](https://github.com/colinhacks/zod/commit/dc51404b) Add shorn to Zod Utilities ([#6398](https://github.com/colinhacks/zod/pull/6398)) by @ChiChuRita
- [`580111da`](https://github.com/colinhacks/zod/commit/580111da) docs: mark AOT compilation as canary-only by @colinhacks
- [`6b0dae79`](https://github.com/colinhacks/zod/commit/6b0dae79) docs: note that a catch callback is not islanded by @colinhacks
- [`898c4461`](https://github.com/colinhacks/zod/commit/898c4461) refactor(v4): give the runtime and compiled code one URL implementation by @colinhacks
- [`260e5d4b`](https://github.com/colinhacks/zod/commit/260e5d4b) fix(v4): stop islanding a catch callback, which diverged silently by @colinhacks
- [`11c9268b`](https://github.com/colinhacks/zod/commit/11c9268b) revert(core): drop the exactOptional parse prototype from #6432 ([#6438](https://github.com/colinhacks/zod/pull/6438)) by @colinhacks
- [`a38ab4a8`](https://github.com/colinhacks/zod/commit/a38ab4a8) fix(core): an omittable discriminator claims undefined ([#6432](https://github.com/colinhacks/zod/pull/6432)) by @colinhacks
- [`c9ec89e0`](https://github.com/colinhacks/zod/commit/c9ec89e0) perf(core): drop the seal and the per-key WeakSet from the lazy internals ([#6435](https://github.com/colinhacks/zod/pull/6435)) by @colinhacks
- [`3c9ca1d9`](https://github.com/colinhacks/zod/commit/3c9ca1d9) feat(json-schema): emit a root $ref when the root schema has an id ([#6029](https://github.com/colinhacks/zod/pull/6029)) by @dinwwwh
- [`e125fd8d`](https://github.com/colinhacks/zod/commit/e125fd8d) test(treeshake): widen the bundle ceilings to survive ordinary churn by @colinhacks
- [`fa77a4d7`](https://github.com/colinhacks/zod/commit/fa77a4d7) feat(v4): z.compile — ahead-of-time schema compilation ([#6085](https://github.com/colinhacks/zod/pull/6085)) by @colinhacks
- [`f300476d`](https://github.com/colinhacks/zod/commit/f300476d) fix(v4): let a schema's error map cover its own checks' issues ([#6426](https://github.com/colinhacks/zod/pull/6426)) by @colinhacks
- [`9f0a3d81`](https://github.com/colinhacks/zod/commit/9f0a3d81) fix(core): restore defineLazy semantics lost in the internals move ([#6429](https://github.com/colinhacks/zod/pull/6429)) by @colinhacks
- [`604464c3`](https://github.com/colinhacks/zod/commit/604464c3) fix(locales): da/nn/no/sv called an IP address a range ([#6430](https://github.com/colinhacks/zod/pull/6430)) by @colinhacks
- [`7378e7cd`](https://github.com/colinhacks/zod/commit/7378e7cd) fix(locales): backfill the mac and Sizable.map gaps, and pin dictionary parity ([#6427](https://github.com/colinhacks/zod/pull/6427)) by @colinhacks
- [`b1077f05`](https://github.com/colinhacks/zod/commit/b1077f05) perf(memory): install derived internals on a per-constructor prototype ([#6415](https://github.com/colinhacks/zod/pull/6415)) by @colinhacks
- [`ccc15144`](https://github.com/colinhacks/zod/commit/ccc15144) fix(locales): add the credit_card key to the seven locales missing it ([#6424](https://github.com/colinhacks/zod/pull/6424)) by @colinhacks
- [`73bacbbb`](https://github.com/colinhacks/zod/commit/73bacbbb) fix(from-json-schema): drop redundant inclusive bound for draft-04 exclusive ranges ([#6022](https://github.com/colinhacks/zod/pull/6022)) by @francisjohnjohnston-web
- [`8f813b1e`](https://github.com/colinhacks/zod/commit/8f813b1e) chore(triage): drop the reference to a skill that is not in this repo by @colinhacks
- [`86b2e6da`](https://github.com/colinhacks/zod/commit/86b2e6da) docs: list el and hr in the supported locales ([#6423](https://github.com/colinhacks/zod/pull/6423)) by @colinhacks
- [`45fdeda5`](https://github.com/colinhacks/zod/commit/45fdeda5) fix(v4): refine optin into a three-rung ladder, retire the fallback payload flag ([#6419](https://github.com/colinhacks/zod/pull/6419)) by @colinhacks
- [`e03d8587`](https://github.com/colinhacks/zod/commit/e03d8587) test(v4): cover why superRefine preserves an explicit nullish input by @colinhacks
- [`5b34c0ce`](https://github.com/colinhacks/zod/commit/5b34c0ce) Improve Portuguese localization and add Brazilian Portuguese (pt-BR) ([#6076](https://github.com/colinhacks/zod/pull/6076)) by @thristhart
- [`d995981c`](https://github.com/colinhacks/zod/commit/d995981c) test(v4): pin issue.schema across every error map kind ([#6421](https://github.com/colinhacks/zod/pull/6421)) by @colinhacks
- [`dc1a40a5`](https://github.com/colinhacks/zod/commit/dc1a40a5) fix(locales): improve french translation ([#6120](https://github.com/colinhacks/zod/pull/6120)) by @tsmartin9
- [`0175a043`](https://github.com/colinhacks/zod/commit/0175a043) feat(locales): add Hindi and Kannada locale support ([#6315](https://github.com/colinhacks/zod/pull/6315)) by @vedanshshetti
- [`536ee3b0`](https://github.com/colinhacks/zod/commit/536ee3b0) Locales: added Slovak (sk) language ([#6041](https://github.com/colinhacks/zod/pull/6041)) by @belicam
- [`07b0c3d8`](https://github.com/colinhacks/zod/commit/07b0c3d8) fix: preserve explicit superRefine issue input ([#6053](https://github.com/colinhacks/zod/pull/6053)) by @frastefanini
- [`ba98071c`](https://github.com/colinhacks/zod/commit/ba98071c) feat: add .exactPartial() to ZodObject ([#6065](https://github.com/colinhacks/zod/pull/6065)) by @andersk
- [`234c407d`](https://github.com/colinhacks/zod/commit/234c407d) feat(lang): Added Bengali locale ([#5974](https://github.com/colinhacks/zod/pull/5974)) by @musaddiq-rafi
- [`377cd9d7`](https://github.com/colinhacks/zod/commit/377cd9d7) feat(locales): add turkmen (tk) locale ([#6168](https://github.com/colinhacks/zod/pull/6168)) by @tachmyratsaparmyradov
- [`69b6bb08`](https://github.com/colinhacks/zod/commit/69b6bb08) feat(locales): add Norwegian Nynorsk (nn) locale ([#6092](https://github.com/colinhacks/zod/pull/6092)) by @arvindfroi
- [`33d82e6b`](https://github.com/colinhacks/zod/commit/33d82e6b) Add Central Kurdish (ckb) locale ([#6078](https://github.com/colinhacks/zod/pull/6078)) by @KUMachine
- [`06666fe2`](https://github.com/colinhacks/zod/commit/06666fe2) fix(fr): remove hyphen in "non-optionnel" ([#5999](https://github.com/colinhacks/zod/pull/5999)) by @spidersouris
- [`79cfedea`](https://github.com/colinhacks/zod/commit/79cfedea) feat(v4): expose the owning schema on check-originated issues ([#6420](https://github.com/colinhacks/zod/pull/6420)) by @colinhacks
- [`92f47984`](https://github.com/colinhacks/zod/commit/92f47984) chore: fail on stacked line comments by @colinhacks
- [`436b5da8`](https://github.com/colinhacks/zod/commit/436b5da8) docs: propose compiled constructor graph by @colinhacks
- [`83067994`](https://github.com/colinhacks/zod/commit/83067994) chore(triage): require a chat summary and a drafted close comment by @colinhacks
- [`ab4a5db8`](https://github.com/colinhacks/zod/commit/ab4a5db8) chore: add triage skill and tooling for issue/PR investigation by @colinhacks
- [`eb4682c9`](https://github.com/colinhacks/zod/commit/eb4682c9) fix(json-schema): resolve tuple minItems past transform and catch in input mode ([#6418](https://github.com/colinhacks/zod/pull/6418)) by @colinhacks
- [`4d6b5cd3`](https://github.com/colinhacks/zod/commit/4d6b5cd3) fix(json-schema): route unrepresentable default values through `unrepresentable` by @colinhacks
- [`2abc9e05`](https://github.com/colinhacks/zod/commit/2abc9e05) docs: note that the JSON Schema emitter reads static optin ([#6417](https://github.com/colinhacks/zod/pull/6417)) by @colinhacks
- [`578e1cd0`](https://github.com/colinhacks/zod/commit/578e1cd0) feat(v4): support format: "hostname" in fromJSONSchema ([#6305](https://github.com/colinhacks/zod/pull/6305)) by @catdalfonso
- [`942bf8cb`](https://github.com/colinhacks/zod/commit/942bf8cb) feat(v4): parse input containing reference cycles ([#6387](https://github.com/colinhacks/zod/pull/6387)) by @colinhacks
- [`78b523f0`](https://github.com/colinhacks/zod/commit/78b523f0) fix(json-schema): keep preprocess object properties required in input mode ([#6133](https://github.com/colinhacks/zod/pull/6133)) by @MerlijnW70
- [`973b1b44`](https://github.com/colinhacks/zod/commit/973b1b44) fix(v4): strip output-typed catch values from the input JSON Schema ([#6409](https://github.com/colinhacks/zod/pull/6409)) by @colinhacks
- [`5e608851`](https://github.com/colinhacks/zod/commit/5e608851) feat(v4): add z.deepPartial and runtime z.input / z.output ([#5928](https://github.com/colinhacks/zod/pull/5928)) by @dokson
- [`4e1720c8`](https://github.com/colinhacks/zod/commit/4e1720c8) fix(v4): align record keys and intersection strictness with TypeScript ([#6412](https://github.com/colinhacks/zod/pull/6412)) by @colinhacks
- [`4cc4053d`](https://github.com/colinhacks/zod/commit/4cc4053d) fix: honor loose mode for closed record key schemas ([#6157](https://github.com/colinhacks/zod/pull/6157)) by @pullfrog[bot]
- [`69be843f`](https://github.com/colinhacks/zod/commit/69be843f) fix(v4): stop the object JIT fastpass keeping a swallowed issue's value ([#6407](https://github.com/colinhacks/zod/pull/6407)) by @colinhacks
- [`b899cd17`](https://github.com/colinhacks/zod/commit/b899cd17) perf(json-schema): make toJSONSchema(registry) linear in registry size ([#6408](https://github.com/colinhacks/zod/pull/6408)) by @colinhacks
- [`6074828e`](https://github.com/colinhacks/zod/commit/6074828e) fix(v4): make fromJSONSchema propertyNames compose with the other object keywords ([#6411](https://github.com/colinhacks/zod/pull/6411)) by @colinhacks
- [`d7b209f3`](https://github.com/colinhacks/zod/commit/d7b209f3) docs: point the Web URLs callout at z.httpUrl() ([#6410](https://github.com/colinhacks/zod/pull/6410)) by @colinhacks
- [`611bd762`](https://github.com/colinhacks/zod/commit/611bd762) fix(mini): make merge() take an object schema, matching classic ([#6404](https://github.com/colinhacks/zod/pull/6404)) by @colinhacks
- [`b53e53cc`](https://github.com/colinhacks/zod/commit/b53e53cc) fix(v4): use exact flag in English locale too_small/too_big messages ([#6177](https://github.com/colinhacks/zod/pull/6177)) by @pullfrog[bot]
- [`421cc9a5`](https://github.com/colinhacks/zod/commit/421cc9a5) fix(json-schema): unescape JSON Pointer tokens when resolving $ref ([#6402](https://github.com/colinhacks/zod/pull/6402)) by @colinhacks
- [`4c27fe87`](https://github.com/colinhacks/zod/commit/4c27fe87) fix(v4): give z.xor() a distinct error when multiple options match ([#6376](https://github.com/colinhacks/zod/pull/6376)) by @colinhacks
- [`a106fbe7`](https://github.com/colinhacks/zod/commit/a106fbe7) fix(v4): make fromJSONSchema tuples open-ended by default ([#6020](https://github.com/colinhacks/zod/pull/6020)) by @mneetika
- [`e8034eba`](https://github.com/colinhacks/zod/commit/e8034eba) fix(v4): make prefixItems/draft-7 items respect minItems in fromJSONSchema ([#6201](https://github.com/colinhacks/zod/pull/6201)) by @pullfrog[bot]
- [`784e5c26`](https://github.com/colinhacks/zod/commit/784e5c26) fix(v4): let bundlers tree-shake locales out of the default import ([#6384](https://github.com/colinhacks/zod/pull/6384)) by @colinhacks
- [`97edd70a`](https://github.com/colinhacks/zod/commit/97edd70a) fix(toJSONSchema): constrain closed tuple length ([#6194](https://github.com/colinhacks/zod/pull/6194)) by @pullfrog[bot]
- [`f150020d`](https://github.com/colinhacks/zod/commit/f150020d) fix(v4): escape non-string enum values in template literal patterns ([#5934](https://github.com/colinhacks/zod/pull/5934)) by @gwagjiug
- [`faf33a28`](https://github.com/colinhacks/zod/commit/faf33a28) fix: surface @deprecated on re-exported compat aliases ([#6072](https://github.com/colinhacks/zod/pull/6072)) by @MahinAnowar
- [`3956224a`](https://github.com/colinhacks/zod/commit/3956224a) docs: state that metadata wins over generated JSON Schema keywords ([#6401](https://github.com/colinhacks/zod/pull/6401)) by @colinhacks
- [`a1904fc2`](https://github.com/colinhacks/zod/commit/a1904fc2) fix(v4): report date origin for numeric min/max bounds ([#6129](https://github.com/colinhacks/zod/pull/6129)) by @MerlijnW70
- [`bd18314c`](https://github.com/colinhacks/zod/commit/bd18314c) fix: escape JSON Pointer reserved characters in toJSONSchema $ref (closes #6027) ([#6144](https://github.com/colinhacks/zod/pull/6144)) by @MaksZhukov
- [`2a5164f5`](https://github.com/colinhacks/zod/commit/2a5164f5) fix(v4): enforce RFC 1035 length limits in regexes.domain ([#6035](https://github.com/colinhacks/zod/pull/6035)) by @emmayusufu
- [`0e5bc4b1`](https://github.com/colinhacks/zod/commit/0e5bc4b1) fix(v4): respect additionalProperties:false with patternProperties in fromJSONSchema ([#6199](https://github.com/colinhacks/zod/pull/6199)) by @pullfrog[bot]
- [`c8f06d36`](https://github.com/colinhacks/zod/commit/c8f06d36) fix(v4): clarify infinite number errors ([#5906](https://github.com/colinhacks/zod/pull/5906)) by @colinhacks
- [`9a7ecc35`](https://github.com/colinhacks/zod/commit/9a7ecc35) fix(json-schema): accept RFC 3339 numeric offsets in date-time format ([#6298](https://github.com/colinhacks/zod/pull/6298)) by @agcty
- [`0a76f3d7`](https://github.com/colinhacks/zod/commit/0a76f3d7) feat(v4): add z.creditCard() string format ([#5931](https://github.com/colinhacks/zod/pull/5931)) by @dokson
- [`bd6619c0`](https://github.com/colinhacks/zod/commit/bd6619c0) feat(json-schema): accept a function for `unrepresentable` ([#6380](https://github.com/colinhacks/zod/pull/6380)) by @colinhacks
- [`9d20fdc3`](https://github.com/colinhacks/zod/commit/9d20fdc3) fix(v4): preserve z.preprocess input narrowing ([#5967](https://github.com/colinhacks/zod/pull/5967)) by @devareddy05
- [`3063993a`](https://github.com/colinhacks/zod/commit/3063993a) perf(v4): cut per-schema memory ~90% by moving methods to the prototype ([#6318](https://github.com/colinhacks/zod/pull/6318)) by @zirkelc
- [`fd074106`](https://github.com/colinhacks/zod/commit/fd074106) feat(json-schema): run `override` before the unrepresentable error ([#6391](https://github.com/colinhacks/zod/pull/6391)) by @colinhacks
- [`2715c12e`](https://github.com/colinhacks/zod/commit/2715c12e) fix(v4): preserve default English locale across tree-shaken bundles ([#5959](https://github.com/colinhacks/zod/pull/5959)) by @colinhacks
- [`81d9fc6c`](https://github.com/colinhacks/zod/commit/81d9fc6c) docs: add zod-form-action to ecosystem ([#6314](https://github.com/colinhacks/zod/pull/6314)) by @Vish05
- [`d86df5e0`](https://github.com/colinhacks/zod/commit/d86df5e0) docs: add ArkEnv to ecosystem page ([#6203](https://github.com/colinhacks/zod/pull/6203)) by @yamcodes
- [`18b4ff99`](https://github.com/colinhacks/zod/commit/18b4ff99) docs(ecosystem): add zodql to API Libraries ([#6227](https://github.com/colinhacks/zod/pull/6227)) by @mattiasahlsen
- [`479d6f51`](https://github.com/colinhacks/zod/commit/479d6f51) shill oxlint ([#6196](https://github.com/colinhacks/zod/pull/6196)) by @samchungy
- [`85dba7e1`](https://github.com/colinhacks/zod/commit/85dba7e1) docs: document that any/unknown object keys are required ([#6388](https://github.com/colinhacks/zod/pull/6388)) by @colinhacks
- [`d24fb4c3`](https://github.com/colinhacks/zod/commit/d24fb4c3) fix: consistently strip __proto__ from parsed objects ([#6386](https://github.com/colinhacks/zod/pull/6386)) by @colinhacks
- [`7708d447`](https://github.com/colinhacks/zod/commit/7708d447) perf(v4): lazy ZodError construction ([#6316](https://github.com/colinhacks/zod/pull/6316)) by @zirkelc
- [`8ac9ae51`](https://github.com/colinhacks/zod/commit/8ac9ae51) fix(docs-v3): serve the docsify SPA fallback on Vercel ([#6378](https://github.com/colinhacks/zod/pull/6378)) by @colinhacks
- [`31384464`](https://github.com/colinhacks/zod/commit/31384464) fix(v4): complete reserved-key hardening ([#6371](https://github.com/colinhacks/zod/pull/6371)) by @colinhacks
- [`600c6909`](https://github.com/colinhacks/zod/commit/600c6909) docs: add Attaform to ecosystem ([#6188](https://github.com/colinhacks/zod/pull/6188)) by @ozzyfromspace
- [`37c05fa5`](https://github.com/colinhacks/zod/commit/37c05fa5) docs(ecosystem): rename zod-to-mongo-schema to zod-mongo-schema ([#6178](https://github.com/colinhacks/zod/pull/6178)) by @udohjeremiah
- [`badfdf08`](https://github.com/colinhacks/zod/commit/badfdf08) docs: update keyof() ZodEnum type to the v4 form ([#6124](https://github.com/colinhacks/zod/pull/6124)) by @patrickwehbe
- [`a57a1807`](https://github.com/colinhacks/zod/commit/a57a1807) Update ecosystem.tsx ([#6122](https://github.com/colinhacks/zod/pull/6122)) by @gajus
- [`e25b68e1`](https://github.com/colinhacks/zod/commit/e25b68e1) perf(v4): let three dead declarations tree-shake under esbuild ([#6381](https://github.com/colinhacks/zod/pull/6381)) by @colinhacks
- [`53397351`](https://github.com/colinhacks/zod/commit/53397351) docs(ecosystem): Add zod-mongoose list item in Zod To X ([#6062](https://github.com/colinhacks/zod/pull/6062)) by @Harm-Nullix
- [`dfa0deb1`](https://github.com/colinhacks/zod/commit/dfa0deb1) docs: add tauri-typegen to ecosystem ([#6032](https://github.com/colinhacks/zod/pull/6032)) by @thwbh
- [`9c914ee8`](https://github.com/colinhacks/zod/commit/9c914ee8) docs: add dynamic error message and combined refinement examples for refine() ([#6002](https://github.com/colinhacks/zod/pull/6002)) by @IdanGonen
- [`921649de`](https://github.com/colinhacks/zod/commit/921649de) fix(v4): formatError and treeifyError handle inherited-name path elements ([#6367](https://github.com/colinhacks/zod/pull/6367)) by @deepshekhardas
- [`e7029aa4`](https://github.com/colinhacks/zod/commit/e7029aa4) fix(v4): report own __proto__ key under .strict() ([#6221](https://github.com/colinhacks/zod/pull/6221)) by @pullfrog[bot]
- [`7f20a26a`](https://github.com/colinhacks/zod/commit/7f20a26a) test(v4): stop redos tests failing on CPU contention ([#6360](https://github.com/colinhacks/zod/pull/6360)) by @irfanfandi
- [`9c540db8`](https://github.com/colinhacks/zod/commit/9c540db8) fix(v4): re-check the record key after the key schema runs ([#6355](https://github.com/colinhacks/zod/pull/6355)) by @colinhacks
- [`8bb89ea4`](https://github.com/colinhacks/zod/commit/8bb89ea4) docs: add .nonempty() to Strings, Arrays, Sets, and Maps sections ([#6056](https://github.com/colinhacks/zod/pull/6056)) by @pullfrog[bot]
- [`599c0e41`](https://github.com/colinhacks/zod/commit/599c0e41) docs(ecosystem): Add `@chrock-studio/overload` and `@chrock-studio/zod-utils` ([#6040](https://github.com/colinhacks/zod/pull/6040)) by @JuerGenie
- [`27a9036a`](https://github.com/colinhacks/zod/commit/27a9036a) docs(ecosystem): `eslint-plugin-zod` is `eslint-zod` now ([#5975](https://github.com/colinhacks/zod/pull/5975)) by @marcalexiei
- [`e177a0ee`](https://github.com/colinhacks/zod/commit/e177a0ee) docs(v4): document coerce missing-key breaking change ([#5957](https://github.com/colinhacks/zod/pull/5957)) ([#5964](https://github.com/colinhacks/zod/pull/5964)) by @dokson
- [`66fba964`](https://github.com/colinhacks/zod/commit/66fba964) docs: show z.instanceof with built-in classes ([#6059](https://github.com/colinhacks/zod/pull/6059)) by @itsahmedbilal
- [`2d90846a`](https://github.com/colinhacks/zod/commit/2d90846a) fix(docs): make the prefault example runnable ([#6063](https://github.com/colinhacks/zod/pull/6063)) by @DucMinhNe
- [`ead9fcb3`](https://github.com/colinhacks/zod/commit/ead9fcb3) fix(v4): write a declared __proto__ key as an own property ([#6354](https://github.com/colinhacks/zod/pull/6354)) by @colinhacks
- [`c58764c5`](https://github.com/colinhacks/zod/commit/c58764c5) docs: fix UUID helper list in v4 introduction ([#6214](https://github.com/colinhacks/zod/pull/6214)) by @meliharik
- [`24b4cc7a`](https://github.com/colinhacks/zod/commit/24b4cc7a) ci: fix release matrix broken by TypeScript 7 ([#6352](https://github.com/colinhacks/zod/pull/6352)) by @colinhacks
- [`f238fbd2`](https://github.com/colinhacks/zod/commit/f238fbd2) fix: remove exponential backtracking from the emoji regex ([#6347](https://github.com/colinhacks/zod/pull/6347)) by @colinhacks
- [`e6c213ec`](https://github.com/colinhacks/zod/commit/e6c213ec) fix(json-schema): keep __proto__ keys as own properties in schema conversion ([#6346](https://github.com/colinhacks/zod/pull/6346)) by @colinhacks
- [`573fcb75`](https://github.com/colinhacks/zod/commit/573fcb75) fix(errors): use own-property semantics in every error-tree walker ([#6213](https://github.com/colinhacks/zod/pull/6213)) by @pullfrog[bot]
- [`f722bcdd`](https://github.com/colinhacks/zod/commit/f722bcdd) ci: build with pinned TypeScript, add TS 6 and 7 legs ([#6345](https://github.com/colinhacks/zod/pull/6345)) by @colinhacks
- [`912f0f51`](https://github.com/colinhacks/zod/commit/912f0f51) chore: add chrome-devtools MCP server to project config by @colinhacks
- [`6f5e99fd`](https://github.com/colinhacks/zod/commit/6f5e99fd) fix(docs-v3): rename README.md to home.md so Vercel serves it by @colinhacks
- [`bbc68f99`](https://github.com/colinhacks/zod/commit/bbc68f99) docs: soften Zod 3 EOL callouts to informational tone by @colinhacks
- [`3fc9b25f`](https://github.com/colinhacks/zod/commit/3fc9b25f) docs: reframe library-authors page Zod-4-first; note Zod 3 EOL by @colinhacks
- [`d58da935`](https://github.com/colinhacks/zod/commit/d58da935) chore: gitignore tmp/, .worktrees/, research/ by @colinhacks
- [`b6071fc0`](https://github.com/colinhacks/zod/commit/b6071fc0) ci: pass CLAUDE_CODE_OAUTH_TOKEN to pullfrog agent by @colinhacks
- [`f29f2a6d`](https://github.com/colinhacks/zod/commit/f29f2a6d) fix(v4): cidrv6 JSON schema pattern matches runtime ([#5945](https://github.com/colinhacks/zod/pull/5945)) by @dokson
- [`ee7376ad`](https://github.com/colinhacks/zod/commit/ee7376ad) chore: bump recheck to 4.6.0-beta.3 for cross-platform path resolution by @colinhacks
- [`e75ca0fc`](https://github.com/colinhacks/zod/commit/e75ca0fc) Use existing madge check:circular for cycle regression by @colinhacks
- [`dfd8766b`](https://github.com/colinhacks/zod/commit/dfd8766b) fix(v4): break circular import between classic schemas and iso ([#5275](https://github.com/colinhacks/zod/pull/5275)) ([#5926](https://github.com/colinhacks/zod/pull/5926)) by @dokson
- [`fbe8ad1b`](https://github.com/colinhacks/zod/commit/fbe8ad1b) fix(v4): allow dynamic `.catch()` under `unrepresentable: "any"` ([#5273](https://github.com/colinhacks/zod/pull/5273)) ([#5925](https://github.com/colinhacks/zod/pull/5925)) by @dokson

</details>
