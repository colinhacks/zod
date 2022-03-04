---
layout: doc-page
title: Nullables
parent: Defining schemas
nav_order: 10
previous:
    title: Optionals
    path: ../optionals
next:
    title: Objects
    path: ../objects
---

You can make any schema nullable with `z.nullable()`

```ts
const nullableString = z.nullable(z.string())
nullableString.parse("asdf") // => "asdf"
nullableString.parse(null) // => null
```

You can make an existing schema nullable with the `.nullable()` method:

```ts
const stringSchema = z.string()
const nullableString = stringSchema.nullable() // equivalent to z.nullable(z.string())
type NullableString = z.infer<typeof nullableString> // string | null
```

## `.unwrap`

```ts
nullableString.unwrap() === stringSchema // true
```