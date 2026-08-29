---
title: Introducing `z.compile()`
author: Colin McDonnell
date: 2026-08-25
description: z.compile() walks a schema once and produces a flat, loop-free JavaScript validator that runs far faster than the standard parser. Arrays, unions, and nested or wide objects parse 3 to 7x faster, with identical output and identical errors.
---

import { ThemedImage } from "@/components/themed-image";
import { Callout } from "fumadocs-ui/components/callout";

Under the hood, `z.compile()` walks the entire schema once and produces a hyperoptimized snippet of flat, loop-free JavaScript that can validate inputs far faster than a standard runtime validator. This snippet can be executed via `new Function()` (effectively a more powerful `eval`) to serve as a fast-path validator. Schemas use this to "fast check" validity, falling back to the regular runtime logic on validation failure to provide granular error information.

This can lead to dramatic speedups, especially for container types like objects, arrays, unions, and tuples.

```ts
import * as z from "zod";

const Player = z.object({
  username: z.string(),
  bio: z.string(),
  xp: z.number(),
  // ...20 more properties...
});

const CompiledPlayer = z.compile(Player);
```

A compiled schema like `CompiledPlayer` is a Zod schema like any other. *There are no special rules around compiled schemas.* 

- Same methods: `.parse()`, `.safeParse()`, `.extend()`, `.optional()`, etc.
- Same inferred input and output types
- Same issues and error messages

Use it exactly like `Player`:

```ts
Player.parse({ ... });
CompiledPlayer.parse({ ... }); // ~9x faster
```

Zod's entire test suite runs twice—once normally and again with auto-compilation enabled globally—to ensure perfect fidelity.

## How it works

<include>../../snippets/how-z-compile-works.mdx</include>

On invalid input the fallback runs the uncompiled schema, so the error is the uncompiled schema's error.

## Compile all the things!

If you import `"zod/compile"` in the entry point of your application, Zod enables compile-by-default—all schemas you declare will self-compile the first time you use them. This gives you the performance boost of compilation throughout your application with one line of code.

```ts
// in your entrypoint (or before any schemas are defined)
import "zod/compile";
```

Then use Zod normally:

```ts
import * as z from "zod";

z.string().min(1).max(10).optional().parse("hello"); // compiled
```

Compilation is lazy, so only the schemas you actually parse with get compiled.

It also works as a Node.js CLI flag, which guarantees it runs before any module defines a schema:

```sh
node --import zod/compile app.js   # ESM
node --require zod/compile app.cjs # CommonJS
```

Or set `preload` in [`bunfig.toml`](https://bun.com/docs/runtime/bunfig#preload) or [`nub.jsonc`](https://nubjs.com/docs/config#preload).

```jsonc title="nub.jsonc"
{
  "preload": ["zod/compile"]
}
```

> If `new Function()` is blocked by a Content Security Policy (e.g. in Cloudflare Workers environments) default-on compilation mode gracefully stands down and becomes a no-op.

## Speedups

Containers like objects and tuples benefit the most, since compilation unrolls the runtime's per-key walk into flat loop-free validation logic that can be optimized by the JS engine. 

<ThemedImage
  lightSrc="/blog/compile-speedup-light.svg"
  darkSrc="/blog/compile-speedup-dark.svg"
  alt="Time per parse on a shared nanosecond axis, standard parser as a gray bar with the compiled time as a blue bar inside it: an array of 10 objects 377 ns to 68 ns (5.5x), a 20-key object 301 ns to 38 ns (7.8x), an array of 10 strings 241 ns to 33 ns (7.3x), a union of 3 objects 190 ns to 36 ns (5.3x), a 3-element tuple 119 ns to 33 ns (3.6x), a 5-key strict object 117 ns to 32 ns (3.7x), a discriminated union 92 ns to 27 ns (3.4x), a 5-key object 76 ns to 28 ns (2.8x); up to 7.8x faster when compiled"
  caption={<>Time per parse, standard parser vs compiled — lower is better (<a href="https://github.com/colinhacks/zod/blob/main/packages/bench/compile-matrix.ts">benchmark</a>)</>}
/>

The benefits scale with schema complexity. Each schema here is measured alone in a tight loop — the standard parser's best case — so the ratios run lower than in the mixed-workload chart above ([benchmark](https://github.com/colinhacks/zod/blob/main/packages/bench/compile-scaling.ts)).

| object | speedup |
| --- | --- |
| 5 keys | 1.8x |
| 10 keys | 2.2x |
| 20 keys | 5.0x |
| 50 keys | 10.2x |

| tuple | speedup |
| --- | --- |
| 1 item | 2.2x |
| 3 items | 2.5x |
| 5 items | 3.0x |
| 10 items | 3.7x |

## Tradeoffs

The compiler trades off performance for bundle size. The compiler is a lot of code, and invoking it via `z.compile()` or `"zod/compile"` means it will be included in your bundle. It adds about 7 KB gzipped (28 KB minified): a Zod bundle with a four-key object schema goes from 24.1 KB to 31.1 KB gzipped, and a Zod Mini bundle from 4.6 KB to 13.2 KB. A bundle that never calls `z.compile()` or imports `zod/compile` pays nothing; it will be tree-shaken completely during bundling.

## Try it

```sh
npm install zod@^4.5.0
```

Then `z.compile()` any schemas on the hot path, or `import "zod/compile"` at the top of your entry point.
