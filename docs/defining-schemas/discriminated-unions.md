---
layout: doc-page
title: Discriminated Unions
parent: Defining schemas
nav_order: 15
release: v3.12.0
previous:
    title: Unions
    path: ../unions
next:
    title: Records
    path: ../records
---

If the union consists of object schemas all identifiable by a common property, it is possible to use
the `z.discriminatedUnion` method.

The advantage is in more efficient evaluation and more human friendly errors. With the basic union method the input is
tested against each of the provided "options", and in the case of invalidity, issues for all the "options" are shown in
the zod error. On the other hand, the discriminated union allows for selecting just one of the "options", testing
against it, and showing only the issues related to this "option".

```ts
const item = z
  .discriminatedUnion("type", [
    z.object({ type: z.literal("a"), a: z.string() }),
    z.object({ type: z.literal("b"), b: z.string() }),
  ])
  .parse({ type: "a", a: "abc" })
```