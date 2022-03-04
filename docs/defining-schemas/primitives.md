---
layout: doc-page
title: Primitives
parent: Defining schemas
nav_order: 1
previous:
    title: Defining schemas
    path: ../
next:
    title: Literals
    path: ../literals
---

## Basic Schemas
```ts
z.string()
z.number()
z.bigint()
z.boolean()
z.date()
```

## Empty Schemas
```ts
z.undefined()
z.null()
z.void() // accepts undefined
```

## Catch-all Schemas
Allows any value.<br>
⚠️ These allow `undefined`, which causes them to be [`optional`](/docs/defining-schemas/optional/).
```ts
z.any()
z.unknown()
```

## Never Schema
Doesn't allow any values.
```ts
z.never()
```