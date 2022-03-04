---
layout: doc-page
title: .optional
parent: Schema methods
nav_order: 8
previous:
    title: .transform
    path: ../transform
next:
    title: .default
    path: ../default
---

## `.optional`
A convenience method that returns an optional version of a schema.

```ts
const optionalString = z.string().optional() // string | undefined
z.optional(z.string()) // equivalent
```