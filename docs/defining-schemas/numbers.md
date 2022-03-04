---
layout: doc-page
title: Numbers
parent: Defining schemas
nav_order: 4
previous:
    title: Strings
    path: ../strings
next:
    title: Booleans
    path: ../booleans
---

## Basic Schema
```ts
z.number()
```

## Number-specific validators
```ts
z.number().gt( 5 )
z.number().gte( 5 )
z.number().lt( 5 )
z.number().lte( 5 ) 
z.number().min( 5 ) // this is an alias for .gte( 5 )
z.number().max( 5 ) // this is an alias for .lte( 5 )

z.number().int() // value must be an integer

z.number().positive()    // > 0
z.number().nonnegative() // >= 0
z.number().negative()    // < 0
z.number().nonpositive() // <= 0

z.number().multipleOf( 5 ) // Evenly divisible by 5
z.number().step( 5 ) // this is an alias for .multipleOf( 5 )
```

## Custom error messages
You can customize certain error messages when creating a schema.
```ts
const age = z.number( {
    required_error: 'Age is required',
    invalid_type_error: 'Age must be a number',
} )
```

## Validators with custom error messages
When using validators, you can pass in a second argument to provide a custom error message.
```ts
z.number().lte( 5, { message: 'this👏is👏too👏big' } )

z.number( {
    required_error: 'custom required error',
    invalid_type_error: 'custom invalid type error',
} ).lte( 5, {
    message: 'this👏is👏too👏big'
} )
```