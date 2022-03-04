---
layout: doc-page
title: .safeParseAsync
parent: Schema methods
nav_order: 4
previous:
    title: .safeParse
    path: ../safeParse
next:
    title: .refine
    path: ../refine
---

## `.safeParseAsync`

> Alias: `.spa`

An asynchronous version of `safeParse`.

```ts
await stringSchema.safeParseAsync("billie")
```

For convenience, this has been aliased to `.spa`:

```ts
await stringSchema.spa("billie")
```