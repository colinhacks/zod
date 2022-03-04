---
layout: doc-page
title: .promise
parent: Schema methods
nav_order: 13
previous:
    title: .array
    path: ../array
next:
    title: .or
    path: ../or
---

## `.promise`

A convenience method for promise types:

```ts
const stringPromise = z.string().promise() // Promise<string>
z.promise(z.string()) // equivalent
```