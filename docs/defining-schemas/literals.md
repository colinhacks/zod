---
layout: doc-page
title: Literals
parent: Defining schemas
nav_order: 2
previous:
    title: Primitives
    path: ../primitives
next:
    title: Strings
    path: ../strings
---

## Basic Schemas
```ts
z.literal( 'tuna' )
z.literal( 12 )
z.literal( true )
```
retrieve literal value
```ts
z.literal( 'tuna' ).value // 'tuna'
z.literal( 12 ).value     // 12
z.literal( true ).value   // true
```

## Custom error messages
You can customize certain error messages when creating a schema.
```ts
const tuna = z.literal( 'tuna', {
    required_error: 'tuna is required',
    invalid_type_error: `tuna must be 'tuna'`,
} )
```

Currently there is no support for Date or bigint literals in Zod. If you have a use case for this feature, please [file an issue](https://github.com/colinhacks/zod/issues){:target="_blank"}.