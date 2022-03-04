---
layout: doc-page
title: Basic usage
nav_order: 3
previous:
    title: Installation
    path: ../installation
next:
    title: Defining schemas
    path: ../defining-schemas
---

## Creating a string schema

```ts
import { z } from 'zod'

// creating a schema for strings
const stringSchema = z.string()

// parsing
stringSchema.parse( 'John Locke' ) // => 'John Locke'
stringSchema.parse( 4815162342 ) // => throws ZodError

// 'safe' parsing (doesn't throw error if validation fails)
stringSchema.safeParse( 'John Locke' ) // => { success: true; data: 'John Locke' }
stringSchema.safeParse( 4815162342 ) // => { success: false; error: ZodError }
```

## Creating an object schema

```ts
import { z } from 'zod'

const userSchema = z.object( {
    username: z.string(),
} )

type User = z.infer<typeof userSchema> // get the inferred type
// type User = {
//     username: string;
// }

userSchema.parse( { username: 'JohnLockeWalksAgain' } ) // => { username: 'JohnLockeWalksAgain' }
userSchema.parse( { username: 4815162342 } ) // => throws ZodError
```