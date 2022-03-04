---
layout: doc-page
title: Type inference
nav_order: 6
previous:
    title: .and
    path: /docs/schema-methods/and
next:
    title: Errors
    path: ../errors
---

You can extract the TypeScript type of any schema with `z.infer<typeof mySchema>` .

```ts
const A = z.string();
type A = z.infer<typeof A>; // string

const u: A = 12; // TypeError
const u: A = "asdf"; // compiles
```

## What about transforms?

In reality each Zod schema internally tracks **two** types: an input and an output. For most schemas (e.g. `z.string()`) these two are the same. But once you add transforms into the mix, these two values can diverge. For instance `z.string().transform(val => val.length)` has an input of `string` and an output of `number`.

You can separately extract the input and output types like so:

```ts
const stringToNumber = z.string().transform((val) => val.length);

type input = z.input<typeof stringToNumber>; // string
type output = z.output<typeof stringToNumber>; // number

// ⚠️ IMPORTANT: z.infer returns the OUTPUT type!
// equivalent to z.output!
type inferred = z.infer<typeof stringToNumber>; // number
```