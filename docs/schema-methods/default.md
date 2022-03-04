---
layout: doc-page
title: .default
parent: Schema methods
nav_order: 9
previous:
    title: .optional
    path: ../optional
next:
    title: .nullable
    path: ../nullable
---

## `.default`
A convenience method that returns an optional version of a schema with a default value.

```ts
const stringWithDefault = z.string().default("tuna")
stringWithDefault.parse(undefined) // => "tuna"
```

Optionally, you can pass a function into `.default` that will be re-executed whenever a default value needs to be generated:

```ts
const numberWithRandomDefault = z.number().default(Math.random)

numberWithRandomDefault.parse(undefined) // => 0.4413456736055323
numberWithRandomDefault.parse(undefined) // => 0.1871840107401901
numberWithRandomDefault.parse(undefined) // => 0.7223408162401552
```