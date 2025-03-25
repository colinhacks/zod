---
title: Validating functions
---

Zod provides a utility for defining "function factories". This is a simple way to define Zod-validated functions.

To create a "function factory":

```ts
const myFunction = z
  .function()
  .input([z.string()]) // supports multiple arguments
  .output(z.number());

type myFunction = z.infer<typeof myFunction>;
// => (arg0: string) => number
```

Now use `.implement` to define an auto-validating function that conforms to this function type.

```ts
const getLength = myFunction.implement((value) => {
  return value.length; // `value` is of type `string`
});

getLength("sandwich"); // => 8
getLength(42); // ❌
```

If you only care about validating inputs, just don't call the `.output()` method. The output type will be inferred from the implementation.

```ts
const getUser = z
  .function()
  .input([z.string()])
  .implement((id) => {
    return fetchUserFromDatabase(id);
  });
```

To ensure your function doesn't return anything, use `z.void()` as the output type.

```ts
const myFunction = z.function().output(z.void());

const myNonReturningFunction = myFunction.implement((arg) => {
  // return nothing
});
```
