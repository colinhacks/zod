---
layout: doc-page
title: .transform
parent: Schema methods
nav_order: 7
previous:
    title: .superRefine
    path: ../superRefine
next:
    title: .default
    path: ../default
---

## `.transform`

To transform data after parsing, use the `transform` method.

```ts
const stringToNumber = z.string().transform((val) => myString.length)
stringToNumber.parse("string") // => 6
```

⚠️ Transform functions must not throw. Make sure to use refinements before the transform to make sure the input can be parsed by the transform.

### Chaining order

Note that `stringToNumber` above is an instance of the `ZodEffects` subclass. It is NOT an instance of `ZodString`. If you want to use the built-in methods of `ZodString` (e.g. `.email()`) you must apply those methods _before_ any transforms.

```ts
const emailToDomain = z
  .string()
  .email()
  .transform((val) => val.split("@")[1])

emailToDomain.parse("colinhacks@example.com") // => example.com
```

### Relationship to refinements

Transforms and refinements can be interleaved:

```ts
z.string()
  .transform((val) => val.length)
  .refine((val) => val > 25)
```

### Async transforms

Transforms can also be async.

```ts
const IdToUser = z
  .string()
  .uuid()
  .transform(async (id) => {
    return await getUserById(id)
  })
```

⚠️ If your schema contains asynchronous transforms, you must use .parseAsync() or .safeParseAsync() to parse data. Otherwise Zod will throw an error.