---
layout: doc-page
title: .nullish
parent: Schema methods
nav_order: 11
previous:
    title: .nullable
    path: ../nullable
next:
    title: .array
    path: ../array
---

## `.nullish`

A convenience method that returns a "nullish" version of a schema. Nullish schemas will accept both `undefined` and `null`. Read more about the concept of "nullish" [here](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing).

```ts
const nullishString = z.string().nullish() // string | null | undefined
z.string().optional().nullable() // equivalent
```