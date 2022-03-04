---
layout: doc-page
title: Errors
nav_order: 7
previous:
    title: Type inference
    path: ../type-inference
next:
    title: Guides
    path: /docs/guides
---

Zod provides a subclass of Error called `ZodError`. ZodErrors contain an `issues` array containing detailed information about the validation problems.

```ts
const data = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!data.success) {
  data.error.issues;
  /* [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [ "name" ],
        "message": "Expected string, received number"
      }
  ] */
}
```

#### Error formatting

You can use the `.format()` method to convert this error into a nested object.

```ts
data.error.format();
/* {
  name: { _errors: [ 'Expected string, received number' ] }
} */
```

For detailed information about the possible error codes and how to customize error messages, check out the dedicated error handling guide: [Error Handling](/docs/guides/error-handling)