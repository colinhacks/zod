---
layout: doc-page
title: Sets
parent: Defining schemas
nav_order: 18
previous:
    title: Maps
    path: ../maps
next:
    title: Intersections
    path: ../intersections
---

```ts
const numberSet = z.set( z.number() )
type NumberSet = z.infer<typeof numberSet>
// type NumberSet = Set<number>
```

## `.nonempty/.min/.max/.size`

```ts
z.set( z.string() ).nonempty() // must contain at least one item
z.set( z.string() ).min( 5 )   // must contain 5 or more items
z.set( z.string() ).max( 5 )   // must contain 5 or fewer items
z.set( z.string() ).size( 5 )  // must contain 5 items exactly
```