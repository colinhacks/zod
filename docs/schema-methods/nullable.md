---
layout: doc-page
title: .nullable
parent: Schema methods
nav_order: 10
previous:
    title: .default
    path: ../default
next:
    title: .nullish
    path: ../nullish
---

## `.nullable`

A convenience method that returns an nullable version of a schema.

```ts
const nullableString = z.string().nullable() // string | null
z.nullable(z.string()) // equivalent
```