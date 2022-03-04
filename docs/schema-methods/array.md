---
layout: doc-page
title: .array
parent: Schema methods
nav_order: 12
previous:
    title: .nullish
    path: ../nullish
next:
    title: .promise
    path: ../promise
---

## `.array`

A convenience method that returns an array schema for the given type:

```ts
const nullableString = z.string().array() // string[]
z.array(z.string()) // equivalent
```