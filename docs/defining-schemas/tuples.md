---
layout: doc-page
title: Tuples
parent: Defining schemas
nav_order: 13
previous:
    title: Arrays
    path: ../arrays
next:
    title: Unions
    path: ../unions
---

Tuples have a fixed number of elements and each element can have a different type.

```ts
const athleteSchema = z.tuple([
  z.string(), // name
  z.number(), // jersey number
  z.object({
    pointsScored: z.number(),
  }), // statistics
])

type Athlete = z.infer<typeof athleteSchema>
// type Athlete = [string, number, { pointsScored: number }]
```