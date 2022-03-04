---
layout: doc-page
title: Dates
parent: Defining schemas
nav_order: 6
previous:
    title: Booleans
    path: ../booleans
next:
    title: Zod Enum
    path: ../enum-zod
---

## Basic Schema
```ts
z.date()
```

## Custom error messages
You can customize certain error messages when creating a schema.
```ts
const birthday = z.date( {
    required_error: 'birthday is required',
    invalid_type_error: 'birthday must be a Date',
} )
```

## Coercion
[MDN Docs: Coercion](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion){:target="_blank"}

z.date() accepts a date, NOT a date string
```ts
z.date().safeParse( new Date() ) // success: true
z.date().safeParse( '2022-01-12T00:00:00.000Z' ) // success: false
```

To coerce any input into a Date, you can use [`preprocess`](/docs/defining-schemas/preprocess/).
```ts
const birthday = z.preprocess(
    input => new Date( input as any ),
    z.date()
)
type Birthday = z.infer<typeof birthday>
// type Birthday = Date

birthday.safeParse( new Date() ) // success: true
birthday.safeParse( '2022-01-12T00:00:00.000Z' ) // success: true
birthday.safeParse( 1641945600000 ) // success: true
```
⚠️ Be careful, this might allow unintended values
```ts
birthday.safeParse( null ) // success: true
```

To make sure you are only allowing the values you intend, check the type of `input` before you return the new value

```ts
const birthday = z.preprocess(
    input => {
        if ( input instanceof Date ) return input
        if ( typeof input == 'string' || typeof input == 'number' )
            return new Date( input )
    },
    z.date()
)
type Birthday = z.infer<typeof birthday>
// type Birthday = Date

birthday.safeParse( new Date() ) // success: true
birthday.safeParse( '2022-01-12T00:00:00.000Z' ) // success: true
birthday.safeParse( 1641945600000 ) // success: true
birthday.safeParse( null ) // success: false
```