---
layout: doc-page
title: .and
parent: Schema methods
nav_order: 15
previous:
    title: .or
    path: ../or
next:
    title: Type inference
    path: /docs/type-inference
---

## `.and`

A convenience method for creating intersection types.

```ts
z.object( {
    name: z.string()
} ).and(
    z.object( { age: z.number() } )
) // { name: string } & { age: number }

z.intersection(
    z.object( { name: z.string() } ),
    z.object( { age: z.number() } )
) // equivalent
```