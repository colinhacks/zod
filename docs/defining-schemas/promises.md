---
layout: doc-page
title: Promises
parent: Defining schemas
nav_order: 21
previous:
    title: Recursive types
    path: ../recursive-types
next:
    title: Instanceof
    path: ../instanceof
---

```ts
const numberPromise = z.promise(z.number())
```

"Parsing" works a little differently with promise schemas. Validation happens in two parts:

1. Zod synchronously checks that the input is an instance of Promise (i.e. an object with `.then` and `.catch` methods.).
2. Zod uses `.then` to attach an additional validation step onto the existing Promise. You'll have to use `.catch` on the returned Promise to handle validation failures.

```ts
numberPromise.parse("tuna")
// ZodError: Non-Promise type: string

numberPromise.parse(Promise.resolve("tuna"))
// => Promise<number>

const test = async () => {
  await numberPromise.parse(Promise.resolve("tuna"))
  // ZodError: Non-number type: string

  await numberPromise.parse(Promise.resolve(3.14))
  // => 3.14
}
```

<!-- #### Non-native promise implementations

When "parsing" a promise, Zod checks that the passed value is an object with `.then` and `.catch` methods — that's it. So you should be able to pass non-native Promises (Bluebird, etc) into `z.promise(...).parse` with no trouble. One gotcha: the return type of the parse function will be a _native_ `Promise` , so if you have downstream logic that uses non-standard Promise methods, this won't work. -->