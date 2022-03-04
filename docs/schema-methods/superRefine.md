---
layout: doc-page
title: .superRefine
parent: Schema methods
nav_order: 6
previous:
    title: .refine
    path: ../refine
next:
    title: .transform
    path: ../transform
---

## `.superRefine`

The `.refine` method is actually syntactic sugar atop a more versatile (and verbose) method called `superRefine`. Here's an example:

```ts
const Strings = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 3,
      type: "array",
      inclusive: true,
      message: "Too many items 😡",
    })
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No duplicated allowed.`,
    })
  }
})
```

You can add as many issues as you like. If `ctx.addIssue` is NOT called during the execution of the function, validation passes.

Normally refinements always create issues with a `ZodIssueCode.custom` error code, but with `superRefine` you can create any issue of any code. Each issue code is described in detail in the Error Handling guide: [Error Handling](/docs/guides/error-handling).

### Abort early

By default, parsing will continue even after a refinement check fails. For instance, if you chain together multiple refinements, they will all be executed. However, it may be desirable to _abort early_ to prevent later refinements from being executed. To achieve this, pass the `fatal` flag to `ctx.addIssue`:

```ts
const Strings = z
  .number()
  .superRefine((val, ctx) => {
    if (val < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "foo",
        fatal: true,
      })
    }
  })
  .superRefine((val, ctx) => {
    if (val !== " ") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "bar",
      })
    }
  })
```