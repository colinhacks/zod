---
layout: doc-page
title: .parseAsync
parent: Schema methods
nav_order: 2
previous:
    title: .parse
    path: ../parse
next:
    title: .safeParse
    path: ../safeParse
---

## `.parseAsync`

`.parseAsync(data:unknown): Promise<T>`

If you use asynchronous [refinements](#refine) or [transforms](#transform) (more on those later), you'll need to use `.parseAsync`

```ts
const stringSchema = z.string().refine(async (val) => val.length > 20)
const value = await stringSchema.parseAsync("hello") // => hello
```