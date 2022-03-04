---
layout: doc-page
title: Records
parent: Defining schemas
nav_order: 16
previous:
    title: Discriminated unions
    path: ../discriminated-unions
next:
    title: Maps
    path: ../maps
---

Record schemas are used to validate types such as `{ [k: string]: number }`.

If you want to validate the _values_ of an object against some schema but don't care about the keys, use `Record`.

```ts
const numberCache = z.record( z.number() )
type NumberCache = z.infer<typeof numberCache>
// type NumberCache = { [k: string]: number }
```

This is particularly useful for storing or caching items by ID.

```ts
const userStore: UserStore = {}

userStore[ "77d2586b-9e8e-4ecf-8b21-ea7e0530eadd" ] = {
    name: "Carlotta",
} // passes

userStore[ "77d2586b-9e8e-4ecf-8b21-ea7e0530eadd" ] = {
    whatever: "Ice cream sundae",
} // TypeError
```

## A note on numerical keys

You may have expected `z.record()` to accept two arguments, one for the keys and one for the values. After all, TypeScript's built-in Record type does: `Record<KeyType, ValueType>` . Otherwise, how do you represent the TypeScript type `Record<number, any>` in Zod?

As it turns out, TypeScript's behavior surrounding `[k: number]` is a little unintuitive:

```ts
const testMap: { [ k: number ]: string } = { 1: 'one' }

for ( const key in testMap ) {
    console.log( `${ key }: ${ typeof key }` )
}
// prints: `1: string`
```

As you can see, JavaScript automatically casts all object keys to strings under the hood.

Since Zod is trying to bridge the gap between static and runtime types, it doesn't make sense to provide a way of creating a record schema with numerical keys, since there's no such thing as a numerical key in runtime JavaScript.