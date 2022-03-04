---
layout: doc-page
title: Maps
parent: Defining schemas
nav_order: 17
previous:
    title: Records
    path: ../records
next:
    title: Sets
    path: ../sets
---

```ts
const stringNumberMap = z.map( z.string(), z.number() )
type StringNumberMap = z.infer<typeof stringNumberMap>
// type StringNumberMap = Map<string, number>
```