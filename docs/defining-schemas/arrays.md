---
layout: doc-page
title: Arrays
parent: Defining schemas
nav_order: 12
previous:
    title: Objects
    path: ../objects
next:
    title: Tuples
    path: ../tuples
---

```ts
const stringArray = z.array(z.string())
const stringArray = z.string().array() // equivalent
```

Be careful with the `.array()` method. It returns a new `ZodArray` instance. This means the _order_ in which you call methods matters. For instance:

```ts
z.string().optional().array() // (string | undefined)[]
z.string().array().optional() // string[] | undefined
```

## `.element`

Use `.element` to access the schema for an element of the array.

```ts
stringArray.element // => string schema
```

## `.nonempty`

If you want to ensure that an array contains at least one element, use `.nonempty()`.

```ts
const nonEmptyStrings = z.string().array().nonempty()
// the inferred type is now
// [string, ...string[]]

nonEmptyStrings.parse([]) // throws: "Array cannot be empty"
nonEmptyStrings.parse(["Ariana Grande"]) // passes
```

You can optionally specify a custom error message:

```ts
// optional custom error message
const nonEmptyStrings = z.string().array().nonempty({
  message: "Can't be empty!",
})
```

## `.min/.max/.length`

```ts
z.string().array().min(5) // must contain 5 or more items
z.string().array().max(5) // must contain 5 or fewer items
z.string().array().length(5) // must contain 5 items exactly
```

Unlike `.nonempty()` these methods do not change the inferred type.