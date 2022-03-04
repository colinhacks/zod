---
layout: doc-page
title: Optionals
parent: Defining schemas
nav_order: 9
previous:
    title: Native Enum
    path: ../enum-native
next:
    title: Nullables
    path: ../nullables
---

You can make any schema optional with `z.optional()`

```ts
const schema = z.optional(z.string())

schema.parse(undefined) // returns undefined
type Schema = z.infer<typeof schema>
// type Schema = string | undefined
```

You can make an existing schema optional with the `.optional()` method:

```ts
const user = z.object({
  username: z.string().optional(),
})
type Schema = z.infer<typeof user>
// type Schema = { username?: string | undefined }
```

## `.unwrap`

```ts
const stringSchema = z.string()
const optionalString = stringSchema.optional()
optionalString.unwrap() === stringSchema // true
```