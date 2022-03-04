---
layout: doc-page
title: Unions
parent: Defining schemas
nav_order: 14
previous:
    title: Tuples
    path: ../tuples
next:
    title: Discriminated unions
    path: ../discriminated-unions
---

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()])

stringOrNumber.parse("foo") // passes
stringOrNumber.parse(14) // passes
```

Zod will test the input against each of the "options" in order and return the first value that validates successfully.

For convenience, you can also use the `.or` method:

```ts
const stringOrNumber = z.string().or(z.number())
```