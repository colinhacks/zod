---
layout: doc-page
title: .or
parent: Schema methods
nav_order: 14
previous:
    title: .promise
    path: ../promise
next:
    title: .and
    path: ../and
---

## `.or`

A convenience method for union types.

```ts
z.string().or(z.number()) // string | number
z.union([z.string(), z.number()]) // equivalent
```