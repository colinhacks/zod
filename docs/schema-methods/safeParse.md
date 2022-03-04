---
layout: doc-page
title: .safeParse
parent: Schema methods
nav_order: 3
previous:
    title: .parseAsync
    path: ../parseAsync
next:
    title: .safeParseAsync
    path: ../safeParseAsync
---

## `.safeParse`

```ts
.safeParse(data:unknown): {
    success: true
    data: T
} | {
    success: false
    error: ZodError
}
```

If you don't want Zod to throw errors when validation fails, use `.safeParse`. This method returns an object containing either the successfully parsed data or a ZodError instance containing detailed information about the validation problems.

```ts
stringSchema.safeParse(12)
// => { success: false, error: ZodError }

stringSchema.safeParse("billie")
// => { success: true, data: 'billie' }
```

The result is a _discriminated union_ so you can handle errors very conveniently:

```ts
const result = stringSchema.safeParse("billie")
if (!result.success) {
  // handle error then return
  result.error
} else {
  // do something
  result.data
}
```