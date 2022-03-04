---
layout: doc-page
title: .parse
parent: Schema methods
nav_order: 1
previous:
    title: Schema methods
    path: ../
next:
    title: .parseAsync
    path: ../parseAsync
---

## `.parse`

`.parse(data:unknown): T`

Given any Zod schema, you can call its `.parse` method to check `data` is valid. If it is, a value is returned with full type information! Otherwise, an error is thrown.

⚠️ IMPORTANT: In Zod 2 and Zod 1.11+, the value returned by `.parse` is a _deep clone_ of the variable you passed in. This was also the case in zod@1.4 and earlier.

```ts
const stringSchema = z.string()
stringSchema.parse("fish") // => returns "fish"
stringSchema.parse(12) // throws Error('Non-string type: number')
```