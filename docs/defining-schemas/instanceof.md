---
layout: doc-page
title: Instanceof
parent: Defining schemas
nav_order: 22
previous:
    title: Promises
    path: ../promises
next:
    title: Functions
    path: ../functions
---

You can use `z.instanceof` to check that the input is an instance of a class. This is useful to validate inputs against classes that are exported from third-party libraries.

```ts
class Test {
  name: string
}

const TestSchema = z.instanceof(Test)

const blob: any = "whatever"
TestSchema.parse(new Test()) // passes
TestSchema.parse("blob") // throws
```